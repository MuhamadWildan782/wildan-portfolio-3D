export function createPanel() {
    const panel = document.querySelector('#project-panel')
    const backdrop = document.querySelector('#panel-backdrop')
    const closeButton = document.querySelector('#panel-close')
    const elements = {
        panelLabel: document.querySelector('#panel-label'),
        panelTitle: document.querySelector('#panel-title'),
        panelDescription: document.querySelector('#panel-description'),
        projectList: document.querySelector('#project-list'),
    }

    function setOpen(open) {
        panel.classList.toggle('active', open)
        backdrop.classList.toggle('active', open)
    }

    function onClose(callback) {
        closeButton.addEventListener('click', callback)
        backdrop.addEventListener('click', callback)
        return () => {
            closeButton.removeEventListener('click', callback)
            backdrop.removeEventListener('click', callback)
        }
    }

    return { elements, setOpen, onClose }
}
