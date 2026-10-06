import * as THREE from 'three'
import { createTrees } from './Trees.js'
import {
    treePlacements,
    bushPlacements,
    rockPlacements,
    lampPlacements,
} from '../data/Landscaping.js'

export function createLandscaping(scene) {
    const landscaping = new THREE.Group()
    landscaping.name = 'landscaping'
    createTrees(landscaping, treePlacements)

    // Shared per world instance, so the existing scene disposal owns every resource.
    const bushGeometry = new THREE.IcosahedronGeometry(1, 0)
    const bushMaterial = new THREE.MeshStandardMaterial({
        color: 0x52754a,
        roughness: 1,
        flatShading: true,
    })
    const bushes = new THREE.InstancedMesh(bushGeometry, bushMaterial, bushPlacements.length)
    bushes.name = 'bushes'
    bushes.castShadow = true
    const transform = new THREE.Object3D()
    bushPlacements.forEach(([x, z, scale], index) => {
        transform.scale.set(scale, scale * 0.6, scale * 0.75)
        transform.position.set(x, scale * 0.4, z)
        transform.rotation.y = x * 0.4
        transform.updateMatrix()
        bushes.setMatrixAt(index, transform.matrix)
    })
    bushes.instanceMatrix.needsUpdate = true
    landscaping.add(bushes)

    const rockGeometry = new THREE.DodecahedronGeometry(1, 0)
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0xa2a394,
        roughness: 1,
        flatShading: true,
    })
    const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, rockPlacements.length)
    rocks.name = 'rocks'
    rocks.castShadow = true
    rockPlacements.forEach(([x, z, scale], index) => {
        transform.scale.set(scale, scale * 0.48, scale * 0.7)
        transform.position.set(x, scale * 0.3, z)
        transform.rotation.y = z * 0.2
        transform.updateMatrix()
        rocks.setMatrixAt(index, transform.matrix)
    })
    rocks.instanceMatrix.needsUpdate = true
    landscaping.add(rocks)

    const poleGeometry = new THREE.CylinderGeometry(0.055, 0.085, 2.5, 6)
    const capGeometry = new THREE.BoxGeometry(0.48, 0.12, 0.48)
    const lensGeometry = new THREE.BoxGeometry(0.32, 0.2, 0.32)
    const metal = new THREE.MeshStandardMaterial({ color: 0x414c4c, roughness: 0.85 })
    const lens = new THREE.MeshBasicMaterial({ color: 0xf4e6c3 })
    for (const [x, z] of lampPlacements) {
        const lamp = new THREE.Group()
        lamp.name = 'lamp'
        const pole = new THREE.Mesh(poleGeometry, metal)
        pole.position.y = 1.25
        pole.castShadow = true
        const cap = new THREE.Mesh(capGeometry, metal)
        cap.position.y = 2.66
        const light = new THREE.Mesh(lensGeometry, lens)
        light.position.y = 2.5
        lamp.add(pole, cap, light)
        lamp.position.set(x, 0, z)
        landscaping.add(lamp)
    }
    scene.add(landscaping)
    return landscaping
}
