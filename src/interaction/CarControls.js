export function createCarControls({ car, wheels, frontWheelPivots }) {
    const keys = new Set()
    let enabled = true

    function resetKeys() {
        keys.clear()
    }

    function onKeyDown(event) {
        const key = event.key.toLowerCase()
        if (enabled && 'wasd'.includes(key)) keys.add(key)
    }

    function onKeyUp(event) {
        keys.delete(event.key.toLowerCase())
    }

    function steer(angle) {
        for (const pivot of frontWheelPivots) pivot.rotation.y = angle
    }

    function update() {
        if (!enabled) return
        const forward = keys.has('w')
        const backward = keys.has('s')
        const direction = Number(forward) - Number(backward)

        // Keep the original per-frame speed and steering feel.
        car.translateZ(-0.08 * direction)
        for (const wheel of wheels) wheel.rotation.x -= 0.15 * direction

        const turn = keys.has('a') ? 1 : keys.has('d') ? -1 : 0
        if (forward || backward) {
            car.rotation.y += 0.03 * turn * (forward ? 1 : -1)
            steer(0.35 * turn)
        } else {
            steer(0)
        }
    }

    function enable() {
        enabled = true
    }

    function disable() {
        enabled = false
        resetKeys()
        steer(0)
    }

    function dispose() {
        disable()
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        window.removeEventListener('blur', resetKeys)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', resetKeys)
    return { update, enable, disable, dispose }
}
