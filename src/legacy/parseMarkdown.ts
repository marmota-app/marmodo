/*
Copyright [2020-2024] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ContentUpdate } from "../mbuffer/ContentUpdate";

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
export type TextContent = { type: 'Text', content: string, }
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
	return {
		options: {},
		content: [],
	}
}
