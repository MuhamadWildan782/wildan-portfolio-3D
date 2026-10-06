import * as THREE from 'three'

import { createTextLabel } from '../utils/TextLabel.js'

export function createAbout(scene) {
    // GROUP

    const aboutArea = new THREE.Group()
    aboutArea.name = 'about-building'

    /*
        Group digunakan sebagai "container".

        Semua object About nanti dimasukkan ke group ini.

        Jadi kalau kita ingin memindahkan seluruh area,
        cukup pindahkan aboutArea, tidak perlu satu-satu.
    */

    // PLATFORM

    const platformGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.1, 12)

    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8dfcf,
    })

    const platform = new THREE.Mesh(platformGeometry, platformMaterial)

    platform.position.y = 0.05

    platform.receiveShadow = true

    aboutArea.add(platform)

    // CENTER OBJECT

    const centerGeometry = new THREE.BoxGeometry(2.4, 2.8, 2.4)

    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xf3f0e8,
    })

    const centerObject = new THREE.Mesh(centerGeometry, centerMaterial)

    centerObject.position.y = 1.5

    centerObject.castShadow = true
    centerObject.receiveShadow = true

    aboutArea.add(centerObject)

    // ROOF

    const roofGeometry = new THREE.ConeGeometry(2, 1.2, 4)

    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x6c5ce7,
    })

    const roof = new THREE.Mesh(roofGeometry, roofMaterial)

    roof.position.y = 3.45

    roof.rotation.y = Math.PI / 4

    roof.castShadow = true

    aboutArea.add(roof)

    // DOOR

    const doorGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.12)

    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b3f35,
    })

    const door = new THREE.Mesh(doorGeometry, doorMaterial)

    door.position.set(0, 0.85, 1.25)

    aboutArea.add(door)

    // WINDOWS

    const windowGeometry = new THREE.BoxGeometry(0.55, 0.65, 0.12)

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x9dd7e5,
    })

    const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial)

    leftWindow.position.set(-0.7, 1.8, 1.25)

    aboutArea.add(leftWindow)

    const rightWindow = leftWindow.clone()

    rightWindow.position.x = 0.7

    aboutArea.add(rightWindow)

    // ABOUT ME LABEL

    const aboutLabel = createTextLabel({
        text: 'ABOUT ME',

        size: 0.42,

        depth: 0.05,

        color: 0xffffff,
        unlit: true,
        center: true,
        castShadow: false,

        position: {
            x: 0,
            y: 2.65,
            z: 1.61,
        },
    })

    aboutArea.add(aboutLabel)

    const labelBoard = new THREE.Mesh(
        new THREE.BoxGeometry(3.15, 0.68, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x514581, roughness: 0.9 }),
    )
    labelBoard.position.set(0, 2.65, 1.5)
    aboutArea.add(labelBoard)

    // POSITION

    aboutArea.position.set(0, 0, -23)

    scene.add(aboutArea)

    // RETURN

    return {
        aboutArea,
    }
}
