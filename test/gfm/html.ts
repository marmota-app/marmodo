import { AnyBlock, AnyInline, BlankLine, Container, Paragraph, Section, Text } from "../../src/element/MfMElements";
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
		default: throw unreachable(`Unsupported block element: ${(b as any).type}`, b)
	}
}

function undecorated(c: Container | Section): string {
	return c.content.map(block).join('')
}
function paragraph(p: Paragraph): string {
	return `<p>${p.content.map(inline).join('')}</p>\n`
}

function inline(i: AnyInline) {
	switch(i.type) {
		case 'Text': return content(i)
		case 'BlankLine': return ''
		default: throw unreachable(`Unsupported inline element: ${(i as any).type}`, i)
	}
}

function content(e: Text) {
	return e.textContent.charAt(e.textContent.length-1)==='\n'?
		e.textContent.substring(0, e.textContent.length-1) :
		e.textContent
}
