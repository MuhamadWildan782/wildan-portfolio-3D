import test from 'node:test'
import assert from 'node:assert/strict'
import { Group, Scene, Vector3, Mesh, InstancedMesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { createCarModel } from '../src/world/Car.js'
import { createCarControls } from '../src/interaction/CarControls.js'
import { findNearestArea } from '../src/interaction/NearestArea.js'
import { createInteractiveAreas } from '../src/world/InteractiveAreas.js'
import { createCamera } from '../src/core/Camera.js'
import { disposeScene } from '../src/utils/DisposeScene.js'

function keyboard(target, type, key) {
    const event = new Event(type)
    event.key = key
    target.dispatchEvent(event)
}

function carFixture(t) {
    const target = new EventTarget()
    globalThis.window = target
    const scene = new Scene()
    const model = createCarModel(scene)
    const controls = createCarControls(model)
    t.after(() => {
        controls.dispose()
        disposeScene(scene)
        delete globalThis.window
    })
    return { ...model, controls, target }
}

test('W/S movement and A/D steering retain original forward and reverse directions', (t) => {
    const { car, controls, target, frontWheelPivots } = carFixture(t)
    keyboard(target, 'keydown', 'W')
    controls.update()
    assert.equal(car.position.z, 4.92)
    keyboard(target, 'keydown', 'a')
    controls.update()
    assert.equal(car.rotation.y, 0.03)
    assert.equal(frontWheelPivots[0].rotation.y, 0.35)
    keyboard(target, 'keyup', 'w')
    keyboard(target, 'keydown', 's')
    controls.update()
    assert.equal(car.rotation.y, 0)
    keyboard(target, 'keyup', 'a')
    keyboard(target, 'keydown', 'd')
    controls.update()
    assert.equal(car.rotation.y, 0.03)
    keyboard(target, 'keyup', 's')
    controls.update()
    assert.equal(frontWheelPivots[0].rotation.y, 0)
})

test('opening a panel blocks movement and ignores keys pressed while disabled', (t) => {
    const { car, controls, target } = carFixture(t)
    keyboard(target, 'keydown', 'w')
    controls.disable()
    keyboard(target, 'keydown', 'w')
    controls.update()
    controls.enable()
    controls.update()
    assert.equal(car.position.z, 5)
})

test('blur and disposal clear held keys and detached listeners cannot move the car', (t) => {
    const { car, controls, target } = carFixture(t)
    keyboard(target, 'keydown', 'w')
    target.dispatchEvent(new Event('blur'))
    controls.update()
    assert.equal(car.position.z, 5)
    controls.dispose()
    controls.enable()
    keyboard(target, 'keydown', 'w')
    controls.update()
    assert.equal(car.position.z, 5)
})

test('nearest area excludes the 3.5 boundary and resolves overlapping areas by distance', () => {
    const areas = [
        { id: 'far', position: new Vector3(3, 0, 0) },
        { id: 'near', position: new Vector3(1, 0, 0) },
    ]
    assert.equal(findNearestArea(new Vector3(), areas).id, 'near')
    assert.equal(findNearestArea(new Vector3(-2.5, 0, 0), areas), null)
    assert.equal(findNearestArea(new Vector3(), []), null)
})

test('world area positions preserve Odoo, Backend, and About entry points', () => {
    const odooBuilding = new Group()
    const backendBuilding = new Group()
    const aboutArea = new Group()
    odooBuilding.position.set(-10, 0, -10)
    backendBuilding.position.set(10, 0, -10)
    aboutArea.position.set(0, 0, -23)
    const areas = createInteractiveAreas({ odooBuilding, backendBuilding }, { aboutArea })
    assert.deepEqual(
        areas.map((area) => area.position.toArray()),
        [
            [-6, 0, -10],
            [6, 0, -10],
            [0, 0, -19],
        ],
    )
})

test('camera keeps the original follow offset, smoothing and resize projection', () => {
    globalThis.window = { innerWidth: 1280, innerHeight: 720 }
    try {
        const { camera, update, resize } = createCamera()
        const car = new Group()
        car.position.z = 5
        update(car)
        assert.deepEqual(camera.position.toArray(), [0, 6.92, 12.16])
        resize(800, 400)
        assert.equal(camera.aspect, 2)
    } finally {
        delete globalThis.window
    }
})

test('shared GPU resources are disposed once and pending labels are marked disposed', () => {
    const scene = new Scene()
    const geometry = new BoxGeometry()
    const material = new MeshBasicMaterial()
    let geometries = 0
    let materials = 0
    let instances = 0
    geometry.addEventListener('dispose', () => geometries++)
    material.addEventListener('dispose', () => materials++)
    const label = new Group()
    const instanced = new InstancedMesh(geometry, material, 2)
    instanced.addEventListener('dispose', () => instances++)
    scene.add(new Mesh(geometry, material), instanced, label)
    disposeScene(scene)
    assert.equal(geometries, 1)
    assert.equal(materials, 1)
    assert.equal(instances, 1)
    assert.equal(label.userData.disposed, true)
    assert.equal(scene.children.length, 0)
})
