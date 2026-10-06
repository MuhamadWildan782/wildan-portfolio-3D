import { aboutData } from '../data/AboutData.js'
import { projectAreas } from '../data/ProjectsData.js'
import { createPanel } from '../ui/Panel.js'
import { renderProjectList } from '../ui/ProjectList.js'
import { renderProjectDetail } from '../ui/ProjectDetail.js'
import { renderAbout } from '../ui/AboutPanel.js'

export function createPanelController({ onOpen, onClose }) {
    const view = createPanel()
    let activeArea = null
    let detailOpen = false

    function showList() {
        detailOpen = false
        renderProjectList(activeArea, view.elements, showDetail)
    }

    function showDetail(project) {
        detailOpen = true
        renderProjectDetail(project, view.elements, showList)
    }

    function open(area) {
        if (activeArea) return
        const content =
            area.type === 'about' ? aboutData : projectAreas.find((item) => item.id === area.id)
        if (!content) return
        activeArea = content
        if (area.type === 'about') renderAbout(content, view.elements)
        else showList()
        view.setOpen(true)
        onOpen?.()
    }

    function close() {
        if (!activeArea) return
        activeArea = null
        detailOpen = false
        view.setOpen(false)
        onClose?.()
    }

    // Preserve Escape's original detail -> list -> closed navigation.
    function backOrClose() {
        if (detailOpen) showList()
        else close()
    }

    const removeListeners = view.onClose(close)
    function dispose() {
        close()
        removeListeners()
        view.elements.projectList.replaceChildren()
    }

    return {
        open,
        close,
        backOrClose,
        dispose,
        get isOpen() {
            return activeArea !== null
        },
    }
}
