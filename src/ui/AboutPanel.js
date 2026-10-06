import { element, setPanelContent } from './Elements.js'

export function renderAbout(data, elements) {
    const container = setPanelContent(
        elements,
        {
            label: data.label,
            title: data.name,
            description: data.role,
        },
        'about-content',
    )
    const profile = element('div', 'about-section')
    profile.append(
        element('span', 'detail-label', 'PROFILE'),
        element('p', 'about-description', data.description),
    )

    const highlights = element('div', 'about-highlights')
    for (const item of data.highlights) {
        const card = element('div', 'about-highlight')
        card.append(element('strong', null, item.value), element('span', null, item.label))
        highlights.append(card)
    }

    const skillsSection = element('div', 'about-section')
    const skills = element('div', 'about-skills')
    for (const skill of data.skills) skills.append(element('span', null, skill))
    skillsSection.append(element('span', 'detail-label', 'CORE SKILLS'), skills)

    const information = element('div', 'about-info')
    for (const [label, value] of [
        ['LOCATION', data.location],
        ['CURRENT FOCUS', data.focus],
    ]) {
        const item = element('div', 'about-info-item')
        item.append(element('span', null, label), element('strong', null, value))
        information.append(item)
    }
    container.append(profile, highlights, skillsSection, information)
}
