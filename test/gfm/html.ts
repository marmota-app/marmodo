import { AnyBlock, AnyInline, BlankLine, Container, Heading, Paragraph, Section, Text } from "../../src/element/MfMElements";
import { MfMDocument } from "../../src/MfMDocument";
import { unreachable } from "../../src/utilities/unreachable";

export function html(document: MfMDocument) {
	return undecorated(document.content/*, document.linkReferences*/)
}

function block(b: AnyBlock): string {
	switch(b.type) {
		case 'Container': return undecorated(b)
		case 'Section': return undecorated(b)
		case 'Paragraph': return paragraph(b)
		case 'Heading': return heading(b)
		default: throw unreachable(`Unsupported block element: ${(b as any).type}`, b)
	}
}

function undecorated(c: Container | Section): string {
	return c.content.map(block).join('')
}
function paragraph(p: Paragraph): string {
	return `<p>${p.content.map((i, x) => inline(i, true)).join('')}</p>\n`
}
function heading(h: Heading): string {
	const content = h.content.length > 0 ? h.content[0].content.map((i, x) => inline(i, x===h.content.length-1)).join('') : ''
	return `<h${h.level}>${content}</h${h.level}>\n`
}

function inline(i: AnyInline, isLast: boolean): string {
	switch(i.type) {
		case 'Text': return content(i, isLast)
		case 'BlankLine': return ''
		case 'StrongEmphasis': return `<strong>${i.content.map((c, x) => inline(c, x===i.content.length-1)).join('')}</strong>`
		case 'Emphasis': return `<em>${i.content.map((c, x) => inline(c, x===i.content.length-1)).join('')}</em>`
		case 'Options': return ''
		case 'Option': return ''
		default: throw unreachable(`Unsupported inline element: ${(i as any).type}`, i)
	}
}

function content(e: Text, isLast: boolean) {
	return (isLast && e.textContent.charAt(e.textContent.length-1)==='\n')?
		e.textContent.substring(0, e.textContent.length-1) :
		e.textContent
}
