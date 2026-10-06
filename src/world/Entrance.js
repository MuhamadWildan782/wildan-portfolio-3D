import * as THREE from 'three'

export function createEntrance(scene) {
    const entrance = new THREE.Group()
    entrance.name = 'entrance'
    entrance.position.set(0, 0, 1)

    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x3b4445, roughness: 0.9 })
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 0.16), frameMaterial)
    board.name = 'entrance-board'
    board.position.y = 6.9
    board.castShadow = true
    entrance.add(board)

    const postGeometry = new THREE.BoxGeometry(0.14, 7, 0.14)
    for (const x of [-3.8, 3.8]) {
        const post = new THREE.Mesh(postGeometry, frameMaterial)
        post.name = 'entrance-post'
        post.position.set(x, 3.5, 0)
        post.castShadow = true
        entrance.add(post)
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.74, 0.14, 0.14), frameMaterial)
    beam.name = 'entrance-beam'
    beam.position.y = 6.9
    entrance.add(beam)

    // One texture keeps the small instruction readable without extruding dozens of glyphs.
    const canvas = document.createElement('canvas')
    canvas.width = 1536
    canvas.height = 416
    const context = canvas.getContext('2d')
    context.fillStyle = '#293637'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.textAlign = 'center'
    context.fillStyle = '#faf7ee'
    context.font = 'bold 92px Arial, sans-serif'
    context.fillText('MUHAMAD WILDAN', 768, 130)
    context.font = 'bold 52px Arial, sans-serif'
    context.fillStyle = '#d3dccc'
    context.fillText('ODOO & BACKEND DEVELOPER', 768, 223)
    context.fillStyle = '#faf7ee'
    context.font = '48px Arial, sans-serif'
    context.fillText('WASD TO DRIVE • E TO EXPLORE', 768, 344)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const face = new THREE.Mesh(
        new THREE.PlaneGeometry(5.02, 1.27),
        new THREE.MeshBasicMaterial({ map: texture }),
    )
    face.name = 'entrance-face'
    face.position.set(0, 6.9, 0.086)
    entrance.add(face)
    scene.add(entrance)
    return entrance
}
