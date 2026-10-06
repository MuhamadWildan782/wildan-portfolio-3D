import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
let browser
try {
    browser = await chromium.launch({
        headless: true,
        channel: process.env.BROWSER_CHANNEL || undefined,
    })
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const messages = []
    page.on('pageerror', (error) => messages.push(error.message))
    page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) messages.push(message.text())
    })
    await page.route('**/src/main.js', (route) =>
        route.fulfill({
            contentType: 'application/javascript',
            body: "import '/src/style.css'",
        }),
    )
    await page.goto(server.resolvedUrls.local[0])
    await page.evaluate(async () => {
        const { THREE } = await import('/tests/three.js')
        const { createWorld } = await import('/src/world/World.js')
        const { createCamera } = await import('/src/core/Camera.js')
        const { createRenderer } = await import('/src/core/Renderer.js')
        const { createCarControls } = await import('/src/interaction/CarControls.js')
        const { createInteraction } = await import('/src/interaction/Interaction.js')
        const { createPanelController } = await import('/src/interaction/PanelController.js')
        const { loadFont } = await import('/src/utils/Font.js')
        const { disposeScene } = await import('/src/utils/DisposeScene.js')
        const world = createWorld()
        await loadFont()
        const camera = createCamera()
        const renderer = createRenderer(document.querySelector('#app'))
        const controls = createCarControls(world.carModel)
        const panel = createPanelController({ onOpen: controls.disable, onClose: controls.enable })
        const interaction = createInteraction(world.car, world.interactiveAreas, panel)
        const decorations = [
            ...world.scene.getObjectByName('landscaping').children,
            world.scene.getObjectByName('entrance'),
            ...world.scene.getObjectByName('directional-signs').children,
        ]
        const footprints = decorations
            .flatMap((object) => (object.name === 'entrance' ? object.children : [object]))
            .flatMap((object) => {
                object.updateWorldMatrix(true, false)
                if (!object.isInstancedMesh)
                    return [{ object, box: new THREE.Box3().setFromObject(object) }]
                object.geometry.computeBoundingBox()
                const matrix = new THREE.Matrix4()
                return Array.from({ length: object.count }, (_, index) => {
                    object.getMatrixAt(index, matrix)
                    matrix.premultiply(object.matrixWorld)
                    return { object, box: object.geometry.boundingBox.clone().applyMatrix4(matrix) }
                })
            })
        window.worldTest = {
            world,
            camera,
            renderer,
            controls,
            panel,
            interaction,
            decorations,
            footprints,
            THREE,
            disposeScene,
            frame() {
                controls.update()
                interaction.update()
                world.markers.update()
                camera.update(world.car)
                renderer.renderer.render(world.scene, camera.camera)
            },
            reset() {
                panel.close()
                controls.disable()
                controls.enable()
                world.car.position.set(0, 0, 5)
                world.car.rotation.set(0, 0, 0)
                camera.camera.position.set(0, 7, 12)
                this.resize()
                for (let i = 0; i < 120; i++) this.frame()
            },
            resize() {
                camera.resize(innerWidth, innerHeight)
                renderer.resize(innerWidth, innerHeight)
            },
        }
        window.worldTest.reset()
    })
    await mkdir('test-results/visual', { recursive: true })
    await page.screenshot({ path: 'test-results/visual/entrance-desktop.png' })
    const geometryReport = await page.evaluate(() => {
        const { world, THREE, footprints, renderer } = window.worldTest
        const overlapXZ = (a, b) =>
            a.min.x < b.max.x && a.max.x > b.min.x && a.min.z < b.max.z && a.max.z > b.min.z
        const buildings = ['odoo-building', 'backend-building', 'about-building'].map((name) => ({
            name,
            box: new THREE.Box3().setFromObject(world.scene.getObjectByName(name)),
        }))
        const collisions = []
        const road = world.scene.getObjectByName('road')
        const ray = new THREE.Raycaster()
        for (const { object, box } of footprints) {
            for (const building of buildings) {
                if (overlapXZ(box, building.box))
                    collisions.push(`${object.name} / ${building.name}`)
            }
            for (const area of world.interactiveAreas) {
                const nearestX = Math.max(box.min.x, Math.min(area.position.x, box.max.x))
                const nearestZ = Math.max(box.min.z, Math.min(area.position.z, box.max.z))
                if (Math.hypot(nearestX - area.position.x, nearestZ - area.position.z) < 1.3) {
                    collisions.push(`${object.name} / ${area.id} marker`)
                }
            }
            // Sample the complete canopy/board footprint, not just the trunk or post.
            // The entrance header crosses above the road, with clearance over the camera.
            if (box.min.y > 6) continue
            for (let x = box.min.x; x <= box.max.x + 0.01; x += 0.15) {
                for (let z = box.min.z; z <= box.max.z + 0.01; z += 0.15) {
                    ray.set(new THREE.Vector3(x, 8, z), new THREE.Vector3(0, -1, 0))
                    if (ray.intersectObject(road).length) collisions.push(`${object.name} / road`)
                }
            }
        }
        const trees = footprints.filter(({ object }) => object.name.startsWith('tree-'))
        const treeGeometries = new Set(trees.map(({ object }) => object.geometry))
        const treeMaterials = new Set(trees.map(({ object }) => object.material))
        return {
            collisions: [...new Set(collisions)],
            trees: world.scene.getObjectByName('tree-canopies').count,
            sharedTreeGeometries: treeGeometries.size,
            sharedTreeMaterials: treeMaterials.size,
            renderCalls: renderer.renderer.info.render.calls,
            triangles: renderer.renderer.info.render.triangles,
            geometries: renderer.renderer.info.memory.geometries,
            textures: renderer.renderer.info.memory.textures,
        }
    })
    assert.deepEqual(geometryReport.collisions, [])
    assert.equal(geometryReport.sharedTreeGeometries, 2)
    assert.equal(geometryReport.sharedTreeMaterials, 2)

    if (process.env.COMPARE_BASELINE === '1') {
        geometryReport.before = await page.evaluate(async () => {
            const { createWorld } = await import('/test-results/before-polish/src/world/World.js')
            const { loadFont } = await import('/test-results/before-polish/src/utils/Font.js')
            const previous = createWorld()
            await loadFont()
            const test = window.worldTest
            test.renderer.renderer.render(previous.scene, test.camera.camera)
            const info = test.renderer.renderer.info
            const result = { renderCalls: info.render.calls, triangles: info.render.triangles }
            previous.markers.dispose()
            test.disposeScene(previous.scene)
            test.frame()
            return result
        })
    }

    for (const id of ['odoo', 'backend', 'about']) {
        await page.evaluate(() => window.worldTest.reset())
        const result = await page.evaluate((id) => {
            const test = window.worldTest
            const { world, THREE, camera, footprints, decorations } = test
            const ray = new THREE.Raycaster()
            const collisions = []
            const occlusions = []
            function step(key, frames) {
                if (key) window.dispatchEvent(new KeyboardEvent('keydown', { key }))
                for (let i = 0; i < frames; i++) {
                    test.frame()
                    const box = new THREE.Box3().setFromObject(world.car)
                    for (const decoration of footprints) {
                        if (box.intersectsBox(decoration.box))
                            collisions.push(decoration.object.name)
                    }
                    const target = world.car.position.clone().add(new THREE.Vector3(0, 0.8, 0))
                    const direction = target.sub(camera.camera.position)
                    ray.far = direction.length() - 0.4
                    ray.set(camera.camera.position, direction.normalize())
                    for (const object of decorations) {
                        if (ray.intersectObject(object, true).length) occlusions.push(object.name)
                    }
                }
                if (key) window.dispatchEvent(new KeyboardEvent('keyup', { key }))
            }
            if (id === 'about') {
                step('w', 267)
            } else {
                step('w', 154)
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
                step(id === 'odoo' ? 'a' : 'd', 52)
                step(null, 35)
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }))
            }
            const area = world.interactiveAreas.find((area) => area.id === id)
            return {
                distance: world.car.position.distanceTo(area.position),
                collisions: [...new Set(collisions)],
                occlusions: [...new Set(occlusions)],
            }
        }, id)
        assert.ok(result.distance < 3.5, `${id}: WASD must reach the interaction zone`)
        assert.deepEqual(result.collisions, [], `${id}: driving route intersects decoration`)
        assert.deepEqual(result.occlusions, [], `${id}: new objects obscure camera follow`)
        await page.screenshot({ path: `test-results/visual/drive-${id}.png` })
        await page.keyboard.press('e')
        assert.equal(await page.locator('#project-panel.active').count(), 1)
        const title = await page.locator('#panel-title').textContent()
        assert.equal(
            title,
            { odoo: 'Odoo Projects', backend: 'Backend Projects', about: 'Muhamad Wildan' }[id],
        )
        await page.keyboard.press('x')
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => window.worldTest.reset())
    await page.screenshot({ path: 'test-results/visual/entrance-mobile.png' })
    assert.deepEqual(messages, [])
    await writeFile('test-results/visual/metrics.json', JSON.stringify(geometryReport, null, 2))
    console.log(
        'PASS: tree/resource sharing, building/road/marker clearance, WASD access to all destinations, camera clearance and E interaction.',
        geometryReport,
    )
    await page.evaluate(() => {
        const test = window.worldTest
        test.interaction.dispose()
        test.panel.dispose()
        test.controls.dispose()
        test.world.markers.dispose()
        test.disposeScene(test.world.scene)
        test.renderer.dispose()
    })
} finally {
    await browser?.close()
    await server.close()
}
