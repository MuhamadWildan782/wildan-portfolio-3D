import { element, setPanelContent } from './Elements.js'

export function renderProjectDetail(project, elements, onBack) {
    const container = setPanelContent(
        elements,
        {
            label: 'PROJECT DETAIL',
            title: project.name,
            description: project.subtitle,
        },
        'project-detail',
    )
    const backButton = element('button', 'project-back', '← Back to projects')
    backButton.type = 'button'
    backButton.addEventListener('click', onBack)

    const meta = element('div', 'project-meta')
    for (const [label, value] of [
        ['COMPANY', project.company],
        ['ROLE', project.role],
    ]) {
        const item = element('div', 'meta-item')
        item.append(element('span', null, label), element('strong', null, value))
        meta.append(item)
    }

    const overview = element('div', 'detail-section')
    overview.append(
        element('span', 'detail-label', 'OVERVIEW'),
        element('p', null, project.description),
    )

    const techSection = element('div', 'detail-section')
    const techList = element('div', 'tech-badges')
    for (const technology of project.tech.split('•')) {
        techList.append(element('span', null, technology.trim()))
    }
    techSection.append(element('span', 'detail-label', 'TECH STACK'), techList)

    const contributionSection = element('div', 'detail-section')
    const contributionList = element('div', 'contribution-list')
    for (const contribution of project.contributions) {
        const item = element('div', 'contribution-item')
        item.append(element('span', null, '→'), element('p', null, contribution))
        contributionList.append(item)
    }
    contributionSection.append(
        element('span', 'detail-label', 'WHAT I WORKED ON'),
        contributionList,
    )

    const preview = element('div', 'detail-section')
    const placeholder = element('div', 'project-preview-placeholder')
    placeholder.append(
        element('span', null, 'PROJECT SCREENSHOT'),
        element('p', null, 'Preview image will be added here'),
    )
    preview.append(element('span', 'detail-label', 'PROJECT PREVIEW'), placeholder)
    container.append(backButton, meta, overview, techSection, contributionSection, preview)
}
