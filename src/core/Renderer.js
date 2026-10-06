import * as THREE from 'three'

export function createRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    function resize(width, height) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(width, height)
    }

    function dispose() {
        renderer.dispose()
        renderer.domElement.remove()
    }

    return { renderer, resize, dispose }
}
