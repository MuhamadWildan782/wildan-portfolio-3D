import { FontLoader } from 'three/addons/loaders/FontLoader.js'

let fontPromise

export function loadFont() {
    if (!fontPromise) {
        const url = `${import.meta.env.BASE_URL}fonts/helvetiker_bold.typeface.json`
        fontPromise = new FontLoader().loadAsync(url).catch((error) => {
            fontPromise = null
            throw error
        })
    }
    return fontPromise
}
