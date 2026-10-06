import { interactionDistance } from '../data/InteractiveAreas.js'

export function findNearestArea(position, areas) {
    let nearest = null
    let nearestDistance = interactionDistance
    for (const area of areas) {
        const distance = position.distanceTo(area.position)
        if (distance < nearestDistance) {
            nearest = area
            nearestDistance = distance
        }
    }
    return nearest
}
