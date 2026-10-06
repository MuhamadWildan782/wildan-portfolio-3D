export function disposeScene(scene) {
    const resources = new Set()
    scene.traverse((object) => {
        // Font loading may finish after the application has been disposed.
        object.userData.disposed = true
        if (object.isInstancedMesh) object.dispose()
        if (object.geometry) resources.add(object.geometry)
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of materials) {
            if (!material) continue
            resources.add(material)
            for (const value of Object.values(material)) {
                if (value?.isTexture) resources.add(value)
            }
        }
        object.shadow?.dispose()
    })
    for (const resource of resources) resource.dispose()
    scene.clear()
}
