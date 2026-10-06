import { findNearestArea } from './NearestArea.js'

export function createInteraction(car, interactiveAreas, panel) {
    const prompt = document.querySelector('#interaction-prompt')
    let currentArea = null

    function update() {
        currentArea = panel.isOpen ? null : findNearestArea(car.position, interactiveAreas)
        prompt.classList.toggle('active', Boolean(currentArea))
    }

    function onKeyDown(event) {
        if (event.repeat) return
        const key = event.key.toLowerCase()
        if (key === 'e' && !panel.isOpen) {
            update()
            if (currentArea) {
                panel.open(currentArea)
                prompt.classList.remove('active')
            }
        } else if (key === 'escape') {
            panel.backOrClose()
        } else if (key === 'x') {
            panel.close()
        }
    }

    window.addEventListener('keydown', onKeyDown)

    function dispose() {
        window.removeEventListener('keydown', onKeyDown)
        prompt.classList.remove('active')
    }

    return { update, dispose }
}
