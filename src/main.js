import { createApp } from './core/App.js'
import './style.css'

const app = createApp(document.querySelector('#app'))

if (import.meta.hot) {
    import.meta.hot.accept()
    import.meta.hot.dispose(() => app.dispose())
}
