import * as THREE from 'three'
import { createEnvironment } from './Environment.js'
import { createBuildings } from './Buildings.js'
import { createAbout } from './About.js'
import { createLandscaping } from './Landscaping.js'
import { createEntrance } from './Entrance.js'
import { createCarModel } from './Car.js'
import { createSigns } from './Signs.js'
import { createMarkers } from './Markers.js'
import { createInteractiveAreas } from './InteractiveAreas.js'

export function createWorld() {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xbfd7ea)
    createEnvironment(scene)
    const buildings = createBuildings(scene)
    const about = createAbout(scene)
    createLandscaping(scene)
    createEntrance(scene)
    const carModel = createCarModel(scene)
    const { car } = carModel
    const interactiveAreas = createInteractiveAreas(buildings, about)
    const markers = createMarkers(scene, interactiveAreas, car)
    createSigns(scene)
    return { scene, car, carModel, interactiveAreas, markers }
}
