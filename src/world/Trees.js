import * as THREE from 'three'

export function createTrees(parent, placements) {
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.29, 1.4, 6)
    const leavesGeometry = new THREE.ConeGeometry(1.05, 2.2, 7)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x806149, roughness: 1 })
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x527c4b,
        roughness: 1,
        flatShading: true,
    })

    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, placements.length)
    const leaves = new THREE.InstancedMesh(leavesGeometry, leavesMaterial, placements.length)
    trunks.name = 'tree-trunks'
    leaves.name = 'tree-canopies'
    trunks.castShadow = true
    leaves.castShadow = true
    const transform = new THREE.Object3D()
    placements.forEach(([x, z, scale, rotation], index) => {
        transform.scale.setScalar(scale)
        transform.rotation.y = rotation
        transform.position.set(x, 0.7 * scale, z)
        transform.updateMatrix()
        trunks.setMatrixAt(index, transform.matrix)
        transform.position.y = 2.05 * scale
        transform.updateMatrix()
        leaves.setMatrixAt(index, transform.matrix)
    })
    trunks.instanceMatrix.needsUpdate = true
    leaves.instanceMatrix.needsUpdate = true
    parent.add(trunks, leaves)
}
