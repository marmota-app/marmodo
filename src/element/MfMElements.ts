/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { Element } from "./Element"

export interface InlineElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends InlineElement<TYPE, CONTENT, THIS>,
> extends Element<TYPE, CONTENT, THIS> {
	readonly plainContent: string,
}
export interface LeafInline<
	TYPE extends string,
	THIS extends LeafInline<TYPE, THIS>,
> extends InlineElement<TYPE, never, THIS> {
	readonly textContent: string,
}
export interface ContainerInline<
	TYPE extends string,
	THIS extends ContainerInline<TYPE, THIS, CONTENT>,
	CONTENT extends Element<any, any, any> = AnyInline,
> extends InlineElement<TYPE, CONTENT, THIS> {
}

export interface ContainerElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends ContainerElement<TYPE, CONTENT, THIS>,
> extends Element<TYPE, CONTENT, THIS> {}
export interface LeafContainer<
	TYPE extends string,
	THIS extends LeafContainer<TYPE, THIS, CONTENT>,
	CONTENT extends Element<any, any, any> = AnyInline,
> extends ContainerElement<TYPE, CONTENT, THIS> {
}
export interface BlockContainer<
	TYPE extends string,
	THIS extends BlockContainer<TYPE, THIS, CONTENT>,
	CONTENT extends Element<any, any, any> = AnyBlock,
> extends ContainerElement<TYPE, CONTENT, THIS> {
}

export type AnyInline = InlineTypes[keyof InlineTypes]
export type AnyBlock = ContainerTypes[keyof ContainerTypes]

export type InlineTypes = {
	'Text': Text,
	'BlankLine': BlankLine,
	'StrongEmphasis': StrongEmphasis,
	'Emphasis': Emphasis,
	'Option': Option,
	'Options': Options,
}
export type ContainerTypes = {
	'Container': Container,
	'Section': Section,

	'Heading': Heading,
	'Paragraph': Paragraph,
	'Table': Table,
}

export interface Container extends BlockContainer<'Container', Container> {}
export interface Section extends BlockContainer<'Section', Section> {
	level: number,
}

export interface Heading extends ContainerElement<'Heading', HeadingContent | BlankLine | Options, Heading> {
	level: number,
}
export interface Paragraph extends LeafContainer<'Paragraph', Paragraph> {}
export interface TableRow extends LeafContainer<'TableRow', TableRow, TableColumn<any> | Options | Text> {
	columns: TableColumn<any>[]
}
export interface TableDelimiterRow extends LeafContainer<'TableDelimiterRow', TableDelimiterRow, TableDelimiterColumn | Options | Text> {
	columns: TableDelimiterColumn[],
}
export interface Table extends LeafContainer<'Table', Table, TableRow | TableDelimiterRow | BlankLine> {
	rows: number,
	columns: number,

	headers: TableRow | null,
	delimiters: TableDelimiterRow,
	tableRows: TableRow[],
}

export interface HeadingContent extends ContainerInline<'HeadingContent', HeadingContent> {}
export interface CustomInline extends ContainerInline<'CustomInline', CustomInline, Text | Options> {
	customContent: string,
	contentType: 'value' | 'error',
}
export interface Text extends LeafInline<'Text', Text> {}
export interface BlankLine extends LeafInline<'BlankLine', BlankLine> {}

export interface TableDelimiterColumn extends ContainerInline<'TableDelimiterColumn', TableDelimiterColumn, Options> {
	alignment: 'left' | 'center' | 'right'
}
export interface TableColumn<
	COL_TYPE extends 'TableColumn' | 'HeaderColumn' | 'CustomTableColumn'
> extends ContainerInline<COL_TYPE, TableColumn<COL_TYPE>> {}

export interface Options extends ContainerInline<'Options', Options, Option> {
	keys: string[],
	get(key: string): string | null | undefined,
}
export interface Option extends ContainerInline<'Option', Option> {
	key: string,
	value: string | null | undefined,
	valid: boolean,
}

export interface StrongEmphasis extends ContainerInline<'StrongEmphasis', StrongEmphasis> {}
export interface Emphasis extends ContainerInline<'Emphasis', Emphasis> {}

export const allBlockStarts: string[] = [ '#', '|' ]
