import * as THREE from 'three'

import { createTextLabel } from '../utils/TextLabel.js'

export function createBuildings(scene) {
    // HELPER: WINDOW

    function createWindow(x, y, z, color = 0x9dd9f3) {
        const geometry = new THREE.BoxGeometry(0.65, 0.55, 0.08)

        const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.25,
            metalness: 0.05,
        })

        const windowMesh = new THREE.Mesh(geometry, material)

        windowMesh.position.set(x, y, z)

        return windowMesh
    }

    // ODOO BUILDING

    const odooBuilding = new THREE.Group()
    odooBuilding.name = 'odoo-building'

    odooBuilding.position.set(-10, 0, -10)

    odooBuilding.rotation.y = Math.PI / 2

    // Main building
    const odooBody = new THREE.Mesh(
        new THREE.BoxGeometry(5, 2.8, 4),
        new THREE.MeshStandardMaterial({
            color: 0x875a7b,
        }),
    )

    odooBody.position.y = 1.4
    odooBody.castShadow = true
    odooBody.receiveShadow = true

    odooBuilding.add(odooBody)

    // Roof
    const odooRoof = new THREE.Mesh(
        new THREE.BoxGeometry(5.3, 0.25, 4.3),
        new THREE.MeshStandardMaterial({
            color: 0x5f3d59,
        }),
    )

    odooRoof.position.y = 2.9
    odooRoof.castShadow = true

    odooBuilding.add(odooRoof)

    // Door
    const odooDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.4, 0.12),
        new THREE.MeshStandardMaterial({
            color: 0x30252e,
        }),
    )

    odooDoor.position.set(0, 0.7, 2.06)

    odooBuilding.add(odooDoor)

    // Windows
    const odooWindowPositions = [
        [-1.5, 1.8],
        [0, 1.8],
        [1.5, 1.8],
    ]

    for (const [x, y] of odooWindowPositions) {
        const windowMesh = createWindow(x, y, 2.06)

        odooBuilding.add(windowMesh)
    }

    scene.add(odooBuilding)

    // BACKEND BUILDING

    const backendBuilding = new THREE.Group()
    backendBuilding.name = 'backend-building'

    backendBuilding.position.set(10, 0, -10)

    backendBuilding.rotation.y = -Math.PI / 2

    // Main body
    const backendBody = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3.5, 4),
        new THREE.MeshStandardMaterial({
            color: 0x3c6e71,
        }),
    )

    backendBody.position.y = 1.75
    backendBody.castShadow = true
    backendBody.receiveShadow = true

    backendBuilding.add(backendBody)

    // Roof
    const backendRoof = new THREE.Mesh(
        new THREE.BoxGeometry(5.3, 0.25, 4.3),
        new THREE.MeshStandardMaterial({
            color: 0x284b4d,
        }),
    )

    backendRoof.position.y = 3.6
    backendRoof.castShadow = true

    backendBuilding.add(backendRoof)

    // Door
    const backendDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.4, 0.12),
        new THREE.MeshStandardMaterial({
            color: 0x172a2b,
        }),
    )

    backendDoor.position.set(0, 0.7, 2.06)

    backendBuilding.add(backendDoor)

    // Windows
    const backendWindowPositions = [
        [-1.5, 2.2],
        [0, 2.2],
        [1.5, 2.2],
    ]

    for (const [x, y] of backendWindowPositions) {
        const windowMesh = createWindow(x, y, 2.06, 0x8ed6dc)

        backendBuilding.add(windowMesh)
    }

    scene.add(backendBuilding)

    odooBuilding.add(
        createTextLabel({
            text: 'ODOO PROJECTS',
            size: 0.36,
            depth: 0.08,
            center: true,
            unlit: true,
            castShadow: false,
            position: { x: -2.61, y: 2.25, z: 0 },
            rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        }),
    )
    backendBuilding.add(
        createTextLabel({
            text: 'BACKEND',
            size: 0.32,
            depth: 0.08,
            center: true,
            unlit: true,
            castShadow: false,
            position: { x: 2.61, y: 2.8, z: 0 },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
        }),
    )

    // Road-facing names remain readable after turning into either driveway.
    for (const [building, text, y] of [
        [odooBuilding, 'ODOO PROJECTS', 2.25],
        [backendBuilding, 'BACKEND', 2.8],
    ]) {
        building.add(
            createTextLabel({
                text,
                size: 0.32,
                depth: 0.02,
                curveSegments: 3,
                center: true,
                unlit: true,
                castShadow: false,
                position: { x: 0, y, z: 2.12 },
            }),
        )
    }

    return {
        odooBuilding,
        backendBuilding,
    }
}
