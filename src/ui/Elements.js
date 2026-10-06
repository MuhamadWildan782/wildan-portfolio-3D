export function element(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
}

export function setPanelContent(elements, { label, title, description }, className) {
    elements.panelLabel.textContent = label
    elements.panelTitle.textContent = title
    elements.panelDescription.textContent = description
    elements.projectList.className = className
    elements.projectList.replaceChildren()
    return elements.projectList
}
