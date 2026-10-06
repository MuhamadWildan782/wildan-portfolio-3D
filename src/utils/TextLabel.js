import * as THREE from 'three'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { loadFont } from './Font.js'

export function createTextLabel({
    text,
    size = 0.4,
    depth = 0.04,
    color = 0xffffff,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    center = false,
    unlit = false,
    castShadow = true,
    curveSegments = 6,
}) {
    const group = new THREE.Group()
    group.position.set(position.x, position.y, position.z)
    group.rotation.set(rotation.x, rotation.y, rotation.z)

    loadFont()
        .then((font) => {
            if (group.userData.disposed) return
            const geometry = new TextGeometry(text, {
                font,
                size,
                depth,
                curveSegments,
                bevelEnabled: false,
            })
            if (center) {
                geometry.center()
            } else {
                // About's label keeps its original baseline and depth alignment.
                geometry.computeBoundingBox()
                const { min, max } = geometry.boundingBox
                geometry.translate(-(max.x - min.x) / 2, 0, 0)
            }
            const material = unlit
                ? new THREE.MeshBasicMaterial({ color })
                : new THREE.MeshStandardMaterial({ color })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = castShadow
            group.add(mesh)
        })
        .catch((error) => {
            if (!group.userData.disposed) console.error(`Unable to load label "${text}"`, error)
        })

    return group
}
