import { createCamera } from './Camera.js'
import { createRenderer } from './Renderer.js'
import { createWorld } from '../world/World.js'
import { createCarControls } from '../interaction/CarControls.js'
import { createInteraction } from '../interaction/Interaction.js'
import { createPanelController } from '../interaction/PanelController.js'
import { disposeScene } from '../utils/DisposeScene.js'

export function createApp(container) {
    const { scene, car, markers, interactiveAreas, carModel } = createWorld()
    const cameraController = createCamera()
    const rendererController = createRenderer(container)
    const { renderer } = rendererController
    const controls = createCarControls(carModel)
    const panel = createPanelController({ onOpen: controls.disable, onClose: controls.enable })
    const interaction = createInteraction(car, interactiveAreas, panel)
    let disposed = false

    function resize() {
        const width = window.innerWidth
        const height = Math.max(window.innerHeight, 1)
        cameraController.resize(width, height)
        rendererController.resize(width, height)
    }

    function animate() {
        controls.update()
        interaction.update()
        markers.update()
        cameraController.update(car)
        renderer.render(scene, cameraController.camera)
    }

    function dispose() {
        if (disposed) return
        disposed = true
        renderer.setAnimationLoop(null)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pagehide', onPageHide)
        interaction.dispose()
        panel.dispose()
        controls.dispose()
        markers.dispose()
        disposeScene(scene)
        rendererController.dispose()
    }

    function onPageHide(event) {
        // A page restored from the back/forward cache keeps its existing app.
        if (!event.persisted) dispose()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pagehide', onPageHide)
    resize()
    renderer.setAnimationLoop(animate)
    return { dispose }
}
