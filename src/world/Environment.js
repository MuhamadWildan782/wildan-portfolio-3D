import * as THREE from 'three'

// World-space X/Z boundary: open turn pockets, short driveways, faceted About plaza.
export const roadOutline = [
    [-3, 28],
    [3, 28],
    [3, -6.1],
    [4.2, -7.3],
    [7.75, -7.3],
    [7.75, -12.7],
    [4.2, -12.7],
    [3, -13.9],
    [3, -19.9],
    [4.2, -22],
    [4.2, -24],
    [2.8, -26.6],
    [-2.8, -26.6],
    [-4.2, -24],
    [-4.2, -22],
    [-3, -19.9],
    [-3, -13.9],
    [-4.2, -12.7],
    [-7.75, -12.7],
    [-7.75, -7.3],
    [-4.2, -7.3],
    [-3, -6.1],
]

export function createEnvironment(scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 1.8))
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
    sunLight.position.set(10, 20, 10)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(2048, 2048)
    Object.assign(sunLight.shadow.camera, {
        near: 0.5,
        far: 80,
        left: -30,
        right: 30,
        top: 30,
        bottom: -30,
    })
    sunLight.shadow.bias = -0.0002
    scene.add(sunLight)

    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const ground = new THREE.Mesh(groundGeometry, new THREE.MeshBasicMaterial({ color: 0x81956d }))
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    // Keep the matte palette while grounding objects with subtle, real cast shadows.
    const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false })
    const grassShadow = new THREE.Mesh(groundGeometry, shadowMaterial)
    grassShadow.rotation.x = -Math.PI / 2
    grassShadow.position.y = 0.008
    grassShadow.receiveShadow = true
    scene.add(grassShadow)

    const shape = new THREE.Shape(roadOutline.map(([x, z]) => new THREE.Vector2(x, -z)))
    const roadGeometry = new THREE.ShapeGeometry(shape)
    const road = new THREE.Mesh(roadGeometry, new THREE.MeshBasicMaterial({ color: 0x505659 }))
    road.name = 'road'
    road.rotation.x = -Math.PI / 2
    road.position.y = 0.025
    scene.add(road)
    const roadShadow = new THREE.Mesh(roadGeometry, shadowMaterial)
    roadShadow.rotation.x = -Math.PI / 2
    roadShadow.position.y = 0.03
    roadShadow.receiveShadow = true
    scene.add(roadShadow)

    const curbGeometry = new THREE.BoxGeometry(1, 1, 1)
    const curbMaterial = new THREE.MeshBasicMaterial({ color: 0xc8c3b5 })
    function curb(x, z, width, length) {
        const mesh = new THREE.Mesh(curbGeometry, curbMaterial)
        mesh.name = 'curb'
        mesh.scale.set(width, 0.12, length)
        mesh.position.set(x, 0.06, z)
        scene.add(mesh)
    }
    for (const side of [-1, 1]) {
        curb(side * 3.25, 10.95, 0.5, 34.1)
        curb(side * 3.25, -16.8, 0.5, 5.4)
        curb(side * 6, -7.05, 3.5, 0.5)
        curb(side * 6, -12.95, 3.5, 0.5)
    }

    const lineGeometry = new THREE.PlaneGeometry(0.12, 1.5)
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xeee9d7 })
    for (const z of [-17, -4, 0, 4, 8, 12, 16, 20, 24]) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial)
        line.rotation.x = -Math.PI / 2
        line.position.set(0, 0.045, z)
        scene.add(line)
    }
    // Small branch dashes stop before the interaction rings.
    for (const x of [-4.2, 4.2]) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial)
        line.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
        line.scale.y = 0.65
        line.position.set(x, 0.045, -10)
        scene.add(line)
    }
    return { ground, road }
}
