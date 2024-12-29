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

import { Element } from "../element/Element";
import { AnyBlock } from "../element/MfMElements";
import { ContentUpdate } from "../mbuffer/ContentUpdate";
import { MfMDocument } from "../MfMDocument";

export type Content = Empty |
	Heading |
	List |
	Table |
	Paragraph |
	Block |
	Preformatted |
	HorizontalRule

export type ContentOptions = {
	[key: string]: string,
}

export type Empty = { type: 'Empty', }

const ALL_LEVELS = [ 1, 2, 3, 4, ] as const;
export type Level = (typeof ALL_LEVELS)[number];

export type Heading = {
	type: 'Heading',
	level: Level,
	text: string,
	options: ContentOptions,
}

export type Newline = { type: 'Newline', }
export type LineBreak = { type: 'LineBreak', }
export type TextContent = { type: 'Text', content: string, textContent: string, }
export type BoldTextContent = { type: 'Bold', content: ParagraphContent[], options: ContentOptions, }
export type ItalicTextContent = { type: 'Italic', content: ParagraphContent[], options: ContentOptions, }
export type StrikeThroughTextContent = { type: 'StrikeThrough', content: ParagraphContent[], options: ContentOptions, }
export type InlineCodeTextContent = {
	type: 'InlineCode',
	content: (TextContent | Arrow)[],
	options: ContentOptions,
}
export type InlineLink = {
	type: 'InlineLink',
	description: string,
	href: string,
	options: ContentOptions,
}
export type InlineImage = {
	type: 'InlineImage',
	description: string,
	href: string,
	options: ContentOptions,
}
export type Arrow = {
	type: 'Arrow',
	pointingTo: string,
	options: ContentOptions,
}

export type ParagraphContent =
	TextContent |
	BoldTextContent |
	ItalicTextContent |
	StrikeThroughTextContent |
	InlineCodeTextContent |
	InlineLink |
	InlineImage |
	Arrow |
	LineBreak |
	Newline

export type Paragraph = {
	type: 'Paragraph',
	content: ParagraphContent[],
	options?: ContentOptions,
}

export type List = {
	type: 'UnorderedList' | 'OrderedList',
	indentLevel: number,
	items: ListItem[],
	options: ContentOptions,
}

export type ListItem = {
	type: 'ListItem',
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}

export type Table = {
	type: 'Table',
	columns?: TableColumn[],
	headings: TableCell[],
	rows: TableRow[],
	options: ContentOptions,
}

export type TableColumn = {
	align: 'left' | 'center' | 'right'
}
export type TableCell = {
	type: 'TableCell',
	content: ParagraphContent[],
}
export type TableRow = {
	type: 'TableRow',
	columns: TableCell[],
}

export type Block = {
	type: 'Aside' | 'Blockquote',
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}

type PreformattedContent = TextContent | Newline | Arrow
export type Preformatted = {
	type: 'Preformatted',
	content: PreformattedContent[],
	options: ContentOptions,
}

export type HorizontalRule = {
	type: 'HorizontalRule',
	level: Level,
	options: ContentOptions,
}

export type DefaultContent = {
	hasChanged: boolean,
}
export class MarkdownDocument {
	readonly options: ContentOptions = {}
	readonly content: (Content & DefaultContent)[] = []
}

export interface ParseResult {
	readonly options: ContentOptions,
	content: (Content & DefaultContent)[],
}

export function parseMarkdown(markdown: string, changes: ContentUpdate[] = []): MarkdownDocument {
	const document = new MfMDocument(markdown)

	return simplifyToLegacyDocument(document)
}

function simplifyToLegacyDocument(document: MfMDocument): MarkdownDocument {
	const container = document.content

	const content: (Content & DefaultContent)[] = []
	container.content.forEach(e => addSimplified(e, content))

	return {
		options: {},
		content,
	}
}

function addSimplified(e: Element<any, any, any>, content: (Content & DefaultContent)[]): void {
	if(e.type === 'Container' || e.type === 'Section') {
		e.content.forEach(inner => addSimplified(inner, content))
	} else {
		content.push(e as any)
	}
}

