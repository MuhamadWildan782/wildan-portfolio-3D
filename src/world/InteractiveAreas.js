import { Vector3 } from 'three'
import { interactiveAreaConfigs } from '../data/InteractiveAreas.js'

export function createInteractiveAreas(buildings, about) {
    const anchors = { ...buildings, ...about }
    return interactiveAreaConfigs.map(({ anchor, offset, ...area }) => ({
        ...area,
        position: anchors[anchor].getWorldPosition(new Vector3()).add(new Vector3(...offset)),
    }))
}
