import * as THREE from 'three'
import { markerActiveDistance } from '../data/InteractiveAreas.js'

export function createMarkers(scene, targets, car) {
    // SETTINGS

    const markers = []

    const activeDistance = markerActiveDistance

    const timer = new THREE.Timer()

    // CREATE ONE MARKER

    function createMarker(target) {
        const group = new THREE.Group()

        // OUTER RING

        const ringGeometry = new THREE.RingGeometry(0.8, 1, 32)

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: target.color,

            transparent: true,

            opacity: 0.65,

            side: THREE.DoubleSide,

            depthWrite: false,
        })

        const ring = new THREE.Mesh(ringGeometry, ringMaterial)

        ring.rotation.x = -Math.PI / 2

        group.add(ring)

        // INNER CIRCLE

        const circleGeometry = new THREE.CircleGeometry(0.6, 32)

        const circleMaterial = new THREE.MeshBasicMaterial({
            color: target.color,

            transparent: true,

            opacity: 0.15,

            side: THREE.DoubleSide,

            depthWrite: false,
        })

        const circle = new THREE.Mesh(circleGeometry, circleMaterial)

        circle.rotation.x = -Math.PI / 2

        circle.position.y = 0.01

        group.add(circle)

        // POSITION

        group.position.copy(target.position)

        group.position.y = 0.08

        scene.add(group)

        // SAVE MARKER DATA

        const marker = {
            id: target.id,

            group: group,

            ring: ring,

            circle: circle,
        }

        markers.push(marker)

        return marker
    }

    // CREATE ALL MARKERS

    targets.forEach((target) => {
        createMarker(target)
    })

    // UPDATE

    function update() {
        timer.update()

        const time = timer.getElapsed()

        markers.forEach((marker, index) => {
            // DISTANCE CAR -> MARKER

            const distance = car.position.distanceTo(marker.group.position)

            const isNear = distance < activeDistance

            // ROTATION

            marker.ring.rotation.z += isNear ? 0.025 : 0.008

            // PULSE

            let scale

            if (isNear) {
                scale = 1.15 + Math.sin(time * 5 + index) * 0.12
            } else {
                scale = 1 + Math.sin(time * 2 + index) * 0.05
            }

            marker.group.scale.set(scale, scale, scale)

            // OPACITY

            if (isNear) {
                marker.ring.material.opacity = 0.8 + Math.sin(time * 5 + index) * 0.15

                marker.circle.material.opacity = 0.3 + Math.sin(time * 5 + index) * 0.1
            } else {
                marker.ring.material.opacity = 0.55

                marker.circle.material.opacity = 0.12
            }
        })
    }

    // RETURN

    return {
        markers,
        update,
        dispose: () => timer.dispose(),
    }
}
