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

import { Element } from "./Element"

export interface InlineElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends InlineElement<TYPE, CONTENT, THIS>,
> extends Element<TYPE, CONTENT, THIS> {}
export interface LeafInline<
	TYPE extends string,
	THIS extends LeafInline<TYPE, THIS>,
> extends InlineElement<TYPE, never, THIS> {
	readonly textContent: string,
}
export interface ContainerInline<
	TYPE extends string,
	THIS extends ContainerInline<TYPE, THIS>,
> extends InlineElement<TYPE, AnyInline, THIS> {
}

export interface ContainerElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends ContainerElement<TYPE, CONTENT, THIS>,
> extends Element<TYPE, CONTENT, THIS> {}
export interface LeafContainer<
	TYPE extends string,
	THIS extends LeafContainer<TYPE, THIS>,
> extends ContainerElement<TYPE, AnyInline, THIS> {
}
export interface BlockContainer<
	TYPE extends string,
	THIS extends BlockContainer<TYPE, THIS>,
> extends ContainerElement<TYPE, AnyBlock, THIS> {
}

export type AnyInline = InlineElement<keyof InlineTypes, AnyInline | never, InlineTypes[keyof InlineTypes]>
export type AnyBlock = ContainerElement<keyof ContainerTypes, AnyBlock | AnyInline, ContainerTypes[keyof ContainerTypes]>

export type InlineTypes = {
	'Text': Text,
	'BlankLine': BlankLine,
}
export type ContainerTypes = {
	'Container': Container,
	'Section': Section,

	'Paragraph': Paragraph,
}

export interface Container extends BlockContainer<'Container', Container> {}
export interface Section extends BlockContainer<'Section', Section> {}

export interface Paragraph extends LeafContainer<'Paragraph', Paragraph> {}

export interface Text extends LeafInline<'Text', Text> {}
export interface BlankLine extends LeafInline<'BlankLine', BlankLine> {}
