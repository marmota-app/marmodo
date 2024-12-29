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

import { AnyInline } from "../../element";
import { ElementOptions } from "../../element/Element";
import { PersistentRange } from "../../mbuffer/TextRange";
import { DelimitedInlineParser, DelimitedMfMElement } from "./DelimitedInlineParser";

export class MfMStrongEmphasis extends DelimitedMfMElement<'StrongEmphasis', MfMStrongEmphasis, StrongEmphasisParser> {
	readonly type = 'StrongEmphasis'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: StrongEmphasisParser,
		delimiter: string,
		content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith, delimiter, content)
	}
}
export class StrongEmphasisParser extends DelimitedInlineParser<'StrongEmphasis', MfMStrongEmphasis, StrongEmphasisParser> {
	override readonly type = 'StrongEmphasis'
	override readonly ElementClass = MfMStrongEmphasis
	override readonly self = this
	override readonly delimiters = [ '*', '_' ]
	override readonly delimiterLength = 2
}
