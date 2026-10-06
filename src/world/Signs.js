import * as THREE from 'three'
import { createTextLabel } from '../utils/TextLabel.js'
import { interactiveAreaConfigs } from '../data/InteractiveAreas.js'

export function createSigns(scene) {
    const signs = new THREE.Group()
    signs.name = 'directional-signs'
    const poleGeometry = new THREE.CylinderGeometry(0.07, 0.09, 1.9, 6)
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x414c4c, roughness: 0.9 })
    const outline = new THREE.Shape([
        new THREE.Vector2(-1.35, -0.36),
        new THREE.Vector2(0.95, -0.36),
        new THREE.Vector2(1.35, 0),
        new THREE.Vector2(0.95, 0.36),
        new THREE.Vector2(-1.35, 0.36),
    ])
    const boardGeometry = new THREE.ExtrudeGeometry(outline, { depth: 0.12, bevelEnabled: false })

    for (const [id, direction, text] of [
        ['odoo', -1, '< ODOO'],
        ['backend', 1, 'BACKEND >'],
    ]) {
        const sign = new THREE.Group()
        sign.name = `${id}-sign`
        sign.position.set(direction * 7, 0, -4.4)
        const pole = new THREE.Mesh(poleGeometry, poleMaterial)
        pole.position.y = 0.95
        pole.castShadow = true
        const color = interactiveAreaConfigs.find((area) => area.id === id).color
        const board = new THREE.Mesh(
            boardGeometry,
            new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
        )
        board.position.y = 1.85
        board.scale.x = direction
        board.castShadow = true
        const label = createTextLabel({
            text,
            size: 0.26,
            depth: 0.015,
            curveSegments: 4,
            center: true,
            unlit: true,
            castShadow: false,
            position: { x: -direction * 0.05, y: 1.85, z: 0.14 },
        })
        sign.add(pole, board, label)
        signs.add(sign)
    }
    scene.add(signs)
    return signs
}
