import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { build, createServer, preview } from 'vite'
import { chromium } from 'playwright'

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
})
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
const warnings = []
const fontRequests = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
    if (message.type() === 'warning') warnings.push(message.text())
})
page.on('request', (request) => {
    if (request.url().includes('helvetiker_bold')) fontRequests.push(request.url())
})

try {
    // Expose only the lifecycle handle in the test browser, never in production source.
    await page.route('**/src/main.js*', async (route) => {
        const response = await route.fetch()
        const body = (await response.text()).replace('const app =', 'const app = window.__app =')
        await route.fulfill({ response, body })
    })
    await page.addInitScript(() => {
        const add = window.addEventListener.bind(window)
        const remove = window.removeEventListener.bind(window)
        window.__listeners = {}
        window.addEventListener = (type, listener, options) => {
            ;(window.__listeners[type] ??= new Set()).add(listener)
            add(type, listener, options)
        }
        window.removeEventListener = (type, listener, options) => {
            window.__listeners[type]?.delete(listener)
            remove(type, listener, options)
        }
    })

    const url = server.resolvedUrls.local[0]
    await page.goto(url)
    await page.waitForFunction(() => Boolean(window.__app))
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(400)
    assert.equal(await page.locator('#app canvas').count(), 1)
    await mkdir('test-results', { recursive: true })
    await page.screenshot({ path: 'test-results/world.png' })

    await page.setViewportSize({ width: 900, height: 600 })
    await page.waitForTimeout(100)
    assert.deepEqual(
        await page
            .locator('canvas')
            .evaluate((canvas) => [canvas.clientWidth, canvas.clientHeight]),
        [900, 600],
    )

    const listenerCounts = () =>
        page.evaluate(() =>
            Object.fromEntries(
                ['keydown', 'keyup', 'blur', 'resize', 'pagehide'].map((type) => [
                    type,
                    window.__listeners[type]?.size ?? 0,
                ]),
            ),
        )
    const before = await listenerCounts()
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
            window.__previousApp = window.__app
        })
        server.ws.send({
            type: 'update',
            updates: [
                {
                    type: 'js-update',
                    path: '/src/main.js',
                    acceptedPath: '/src/main.js',
                    timestamp: Date.now(),
                },
            ],
        })
        await page.waitForFunction(() => window.__app !== window.__previousApp)
        assert.equal(await page.locator('canvas').count(), 1)
        assert.deepEqual(await listenerCounts(), before)
    }
    assert.equal(fontRequests.length, 1, 'font is shared and cached across HMR')

    // Assemble the same modules with explicit frame steps for deterministic driving tests.
    await page.evaluate(async () => {
        window.__app.dispose()
        const { createWorld } = await import('/src/world/World.js')
        const { createCarControls } = await import('/src/interaction/CarControls.js')
        const { createPanelController } = await import('/src/interaction/PanelController.js')
        const { createInteraction } = await import('/src/interaction/Interaction.js')
        const { createCamera } = await import('/src/core/Camera.js')
        const { createRenderer } = await import('/src/core/Renderer.js')
        const { disposeScene } = await import('/src/utils/DisposeScene.js')
        const world = createWorld()
        const controls = createCarControls(world.carModel)
        const panel = createPanelController({ onOpen: controls.disable, onClose: controls.enable })
        const interaction = createInteraction(world.car, world.interactiveAreas, panel)
        const camera = createCamera()
        const renderer = createRenderer(document.querySelector('#app'))
        renderer.resize(innerWidth, innerHeight)
        window.harness = {
            ...world,
            controls,
            panel,
            interaction,
            near(id) {
                panel.close()
                world.car.position.copy(
                    world.interactiveAreas.find((area) => area.id === id).position,
                )
                interaction.update()
                world.markers.update()
                camera.update(world.car)
                renderer.renderer.render(world.scene, camera.camera)
            },
            dispose() {
                interaction.dispose()
                panel.dispose()
                controls.dispose()
                world.markers.dispose()
                disposeScene(world.scene)
                renderer.dispose()
            },
        }
    })
    assert.equal(await page.locator('#project-panel.active').count(), 0)
    await page.keyboard.press('e')
    assert.equal(await page.locator('#project-panel.active').count(), 0)

    for (const [id, expectedCount] of [
        ['odoo', 4],
        ['backend', 3],
    ]) {
        await page.evaluate((id) => window.harness.near(id), id)
        assert.equal(await page.locator('#interaction-prompt.active').count(), 1)
        await page.keyboard.press('e')
        assert.equal(await page.locator('#project-panel.active').count(), 1)
        assert.equal(await page.locator('.project-card').count(), expectedCount)
        const position = await page.evaluate(() => window.harness.car.position.toArray())
        await page.keyboard.down('w')
        await page.evaluate(() => window.harness.controls.update())
        assert.deepEqual(await page.evaluate(() => window.harness.car.position.toArray()), position)
        await page.keyboard.up('w')

        for (let i = 0; i < expectedCount; i++) {
            const title = await page.locator('.project-card h3').nth(i).textContent()
            await page.locator('.project-card').nth(i).click()
            assert.equal(await page.locator('#panel-title').textContent(), title)
            assert.ok((await page.locator('.contribution-item').count()) > 0)
            assert.ok((await page.locator('.tech-badges span').count()) > 0)
            if (i === 0) await page.screenshot({ path: `test-results/${id}-detail.png` })
            await page.locator('.project-back').click()
            assert.equal(await page.locator('.project-card').count(), expectedCount)
        }
        await page.locator('.project-card').first().click()
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('.project-card').count(), expectedCount)
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('#project-panel.active').count(), 0)
    }

    for (const close of ['button', 'backdrop', 'x']) {
        await page.evaluate(() => window.harness.near('odoo'))
        await page.keyboard.press('e')
        await page.locator('.project-card').first().click()
        if (close === 'button') await page.locator('#panel-close').click()
        if (close === 'backdrop')
            await page.locator('#panel-backdrop').click({ position: { x: 2, y: 2 } })
        if (close === 'x') await page.keyboard.press('x')
        assert.equal(await page.locator('#project-panel.active').count(), 0)
    }

    await page.evaluate(() => window.harness.near('about'))
    await page.keyboard.press('e')
    assert.equal(await page.locator('#panel-title').textContent(), 'Muhamad Wildan')
    assert.equal(await page.locator('.about-highlight').count(), 3)
    assert.equal(await page.locator('.about-skills span').count(), 9)
    await page.screenshot({ path: 'test-results/about.png' })
    await page.keyboard.press('Escape')

    for (const id of ['odoo', 'about']) {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.evaluate((id) => window.harness.near(id), id)
        await page.keyboard.press('e')
        await page.waitForTimeout(250)
        assert.ok(
            await page
                .locator('#project-panel')
                .evaluate((panel) => panel.scrollWidth <= panel.clientWidth),
        )
        await page.screenshot({ path: `test-results/${id}-mobile.png` })
        await page.keyboard.press('Escape')
    }

    await page.evaluate(() => window.harness.dispose())
    assert.equal(await page.locator('canvas').count(), 0)
    assert.deepEqual(await listenerCounts(), {
        keydown: 0,
        keyup: 0,
        blur: 0,
        resize: 0,
        pagehide: 0,
    })
    assert.deepEqual(errors, [])
    assert.deepEqual(
        warnings.filter((warning) => /THREE|deprecated/i.test(warning)),
        [],
    )
    console.log(
        'PASS: all 7 projects, Back, Escape, X, close button, backdrop, About, mobile overflow, resize, font cache, HMR and cleanup.',
    )
    if (warnings.length) console.log('Browser warnings:', warnings)

    await build({ base: '/portfolio/', build: { outDir: 'test-results/subpath' } })
    const production = await preview({
        base: '/portfolio/',
        build: { outDir: 'test-results/subpath' },
        preview: { host: '127.0.0.1', port: 0 },
    })
    try {
        const productionPage = await browser.newPage()
        const productionErrors = []
        productionPage.on('pageerror', (error) => productionErrors.push(error.message))
        productionPage.on('console', (message) => {
            if (message.type() === 'error')
                productionErrors.push(`${message.text()} ${message.location().url}`)
        })
        productionPage.on('response', (response) => {
            if (response.status() >= 400)
                productionErrors.push(`${response.status()} ${response.url()}`)
        })
        const fontResponse = productionPage.waitForResponse((response) =>
            response.url().includes('/portfolio/fonts/'),
        )
        await productionPage.goto(production.resolvedUrls.local[0])
        assert.equal((await fontResponse).status(), 200)
        await productionPage.waitForLoadState('networkidle')
        assert.equal(await productionPage.locator('#app canvas').count(), 1)
        assert.deepEqual(productionErrors, [])
        await productionPage.close()
        console.log(
            'PASS: production build served under /portfolio/ loads WebGL and font without errors.',
        )
    } finally {
        await new Promise((resolve, reject) =>
            production.httpServer.close((error) => (error ? reject(error) : resolve())),
        )
    }
} finally {
    await browser.close()
    await server.close()
}
