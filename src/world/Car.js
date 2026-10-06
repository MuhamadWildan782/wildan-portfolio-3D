import * as THREE from 'three'

export function createCarModel(scene) {
    // CAR GROUP

    const car = new THREE.Group()

    const wheels = []
    const frontWheelPivots = []

    // MATERIALS

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x6c5ce7,
        roughness: 0.45,
    })

    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x202124,
        roughness: 0.7,
    })

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x8ecae6,
        roughness: 0.15,
        metalness: 0.1,
    })

    const headlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffffaa,
        emissiveIntensity: 0.5,
    })

    const tailMaterial = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        emissive: 0xff0000,
        emissiveIntensity: 0.35,
    })

    // MAIN BODY

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 3.2), bodyMaterial)

    body.position.y = 0.65

    body.castShadow = true
    body.receiveShadow = true

    car.add(body)

    // LOWER BODY

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.28, 2.8), darkMaterial)

    lowerBody.position.y = 0.42
    lowerBody.castShadow = true

    car.add(lowerBody)

    // CABIN

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.7, 1.65), bodyMaterial)
    cabin.position.set(0, 1.15, 0.05)
    cabin.castShadow = true
    car.add(cabin)

    // =====================================================
    // WINDSHIELD
    // FRONT = -Z
    // =====================================================

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.48, 0.06), glassMaterial)
    windshield.position.set(0, 1.18, -0.8)
    car.add(windshield)

    // =====================================================
    // REAR WINDOW
    // BACK = +Z
    // =====================================================

    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.48, 0.06), glassMaterial)

    rearWindow.position.set(0, 1.18, 0.9)

    car.add(rearWindow)

    // HEADLIGHTS

    const leftHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.08), headlightMaterial)
    leftHeadlight.position.set(-0.55, 0.68, -1.63)
    car.add(leftHeadlight)
    const rightHeadlight = leftHeadlight.clone()
    rightHeadlight.position.x = 0.55
    car.add(rightHeadlight)

    // TAIL LIGHTS

    const leftTail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), tailMaterial)

    leftTail.position.set(-0.55, 0.68, 1.63)

    car.add(leftTail)

    const rightTail = leftTail.clone()

    rightTail.position.x = 0.55

    car.add(rightTail)

    // BUMPERS

    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.16), darkMaterial)

    frontBumper.position.set(0, 0.42, -1.68)

    car.add(frontBumper)

    const rearBumper = frontBumper.clone()

    rearBumper.position.z = 1.68

    car.add(rearBumper)

    // WHEELS

    const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 20)

    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
    })

    function createWheel(x, z, isFront = false) {
        // Pivot digunakan supaya roda depan
        // bisa berbelok kiri / kanan.
        const pivot = new THREE.Group()

        pivot.position.set(x, 0.38, z)

        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)

        // Rebahan menjadi roda
        wheel.rotation.z = Math.PI / 2

        wheel.castShadow = true

        pivot.add(wheel)
        car.add(pivot)

        wheels.push(wheel)

        if (isFront) {
            frontWheelPivots.push(pivot)
        }

        return pivot
    }

    // Front wheels = -Z

    createWheel(-0.95, -1.05, true)

    createWheel(0.95, -1.05, true)

    // Rear wheels = +Z

    createWheel(-0.95, 1.05)

    createWheel(0.95, 1.05)

    // START POSITION

    car.position.set(0, 0, 5)

    scene.add(car)

    return { car, wheels, frontWheelPivots }
}
