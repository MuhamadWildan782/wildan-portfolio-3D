import { element, setPanelContent } from './Elements.js'

export function renderProjectList(area, elements, onSelect) {
    const container = setPanelContent(elements, area, 'project-list')
    area.projects.forEach((project, index) => {
        const card = element('div', 'project-card')
        card.append(
            element('span', 'project-number', String(index + 1).padStart(2, '0')),
            element('h3', null, project.name),
            element('div', 'project-tech', project.tech),
            element('p', null, project.description),
        )
        card.addEventListener('click', () => onSelect(project))
        container.append(card)
    })
}
