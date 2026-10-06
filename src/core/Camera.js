import * as THREE from 'three'

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    )
    camera.position.set(0, 7, 12)
    const targetPosition = new THREE.Vector3()
    const lookTarget = new THREE.Vector3()

    function update(car) {
        targetPosition.set(0, 6, 9).applyQuaternion(car.quaternion).add(car.position)
        camera.position.lerp(targetPosition, 0.08)
        lookTarget.set(0, 1, -4).applyQuaternion(car.quaternion).add(car.position)
        camera.lookAt(lookTarget)
    }

    function resize(width, height) {
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    return { camera, update, resize }
}
