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

import { AnyInline, Emphasis } from "../../element";
import { ElementOptions, ParsingContext } from "../../element/Element";
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
		parsingContext: ParsingContext,
	) {
		super(id, parsedRange, parsedWith, delimiter, content, parsingContext)
	}
}
export class EmphasisParser extends DelimitedInlineParser<'Emphasis', MfMEmphasis, EmphasisParser> {
	override readonly type = 'Emphasis'
	override readonly ElementClass = MfMEmphasis
	override readonly self = this
	override readonly delimiters = [ '*', '_' ]
	override readonly delimiterLength = 1
}
