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

import { AnyInline, Emphasis } from "../../element";
import { ElementOptions } from "../../element/Element";
import { PersistentRange } from "../../mbuffer/TextRange";
import { DelimitedInlineParser, DelimitedMfMElement } from "./DelimitedInlineParser";

export class MfMEmphasis extends DelimitedMfMElement<'Emphasis', MfMEmphasis, EmphasisParser> {
	readonly type = 'Emphasis'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: EmphasisParser,
		delimiter: string,
		content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith, delimiter, content)
	}
}
export class EmphasisParser extends DelimitedInlineParser<'Emphasis', MfMEmphasis, EmphasisParser> {
	override readonly type = 'Emphasis'
	override readonly ElementClass = MfMEmphasis
	override readonly self = this
	override readonly delimiters = [ '*', '_' ]
	override readonly delimiterLength = 1
}
