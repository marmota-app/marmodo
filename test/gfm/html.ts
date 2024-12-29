/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { AnyBlock, AnyInline, BlankLine, Container, Heading, Paragraph, Section, Table, TableColumn, TableDelimiterColumn, TableRow, Text } from "../../src/element/MfMElements";
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
		case 'Table': return table(b)
		default: throw unreachable(`Unsupported block element: ${(b as any).type}`, b)
	}
}

function table(b: Table) {
	return `<table>\n${b.headers? tableHeaders(b)+'\n' : ''}${tableRows(b)}\n</table>\n`
}
function tableHeaders(table: Table) {
	return `<thead>\n<tr>\n${table.headers?.columns.map((c, i) => tableCell(c, table.delimiters.columns[i], 'th')).join('\n')}\n</tr>\n</thead>`
}
function tableRows(table: Table) {
	if(table.tableRows.length === 0) {
		return ''
	}
	return `<tbody>\n${table.tableRows.map(r => tableRow(table, r)).join('\n')}\n</tbody>`
}
function tableRow(table: Table, tableRow: TableRow) {
	return `<tr>\n${table.delimiters.columns.map((d, i) => tableCell(tableRow.columns[i], table.delimiters.columns[i], 'td')).join('\n')}\n</tr>`
}
function tableCell(col: TableColumn<any> | undefined, del: TableDelimiterColumn | undefined, type: string) {
	if(col == null) {
		return `<${type}></${type}>`
	}
	const alignment = del?.alignment ?? 'left'
	return `<${type}${alignment!=='left'? ` align="${alignment}"` : ''}>${col.content.map(i => inline(i, false).trim()).join('')}</${type}>`
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
