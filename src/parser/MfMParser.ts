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

import { allBlockStarts, BlankLine } from "../element"
import { Element, Parser, UpdateCheckResult } from "../element/Element"
import { UpdateInfo } from "../mbuffer/TextContent"
import { TextLocation } from "../mbuffer/TextLocation"
import { IdGenerator, Parsers } from './Parsers'

export function andFalse(_: UpdateCheckResult): UpdateCheckResult {
	return { canUpdate: false, and: andFalse }
}
export function andOther(other: UpdateCheckResult): UpdateCheckResult {
	return other
}

export abstract class MfMParser<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
> implements Parser<TYPE, CONTENT, ELEMENT> {
	abstract type: TYPE
	constructor(protected readonly idGenerator: IdGenerator, protected readonly parsers: Parsers) {}

	abstract parse(start: TextLocation, end: TextLocation): ELEMENT | null;

	checkUpdate(element: ELEMENT, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		return {
			canUpdate: true,
			rangeStart: element.parsedRange.start,
			rangeEnd: documentEnd,
			and: (otherResult: UpdateCheckResult)=>otherResult,
		}
	}

	acceptUpdate(original: ELEMENT, updated: ELEMENT): boolean {
		return true
	}

	protected checkUpdateDoesNotChangeNewlines(element: ELEMENT, update: UpdateInfo): UpdateCheckResult {
		if(
			update.replacedText.indexOf('\n') >= 0 || update.replacedText.indexOf('\r') >= 0 ||
			update.newText.indexOf('\n') >= 0 || update.newText.indexOf('\r') >= 0
		) {
			return {
				canUpdate: false,
				and: andFalse,
			}
		}

		return {
			canUpdate: true,
			rangeStart: element.parsedRange.start,
			rangeEnd: element.parsedRange.end,
			and: andOther,
		}
	}

	protected addBlankLinesTo(content: any[], fromLocation: TextLocation, textEnd: TextLocation, onBlankLineFound = () => {}): TextLocation {
		let nextParseLocation = fromLocation
		let blankLine = this.parsers.BlankLine.parse(nextParseLocation, textEnd)
		if(blankLine != null) {
			onBlankLineFound()
		}
		while(blankLine != null) {
			content.push(blankLine)
			nextParseLocation = blankLine.parsedRange.end

			blankLine = this.parsers.BlankLine.parse(nextParseLocation, textEnd)
		}
		return nextParseLocation
	}

	protected lineStartsNewBlock(start: TextLocation, end: TextLocation): boolean {
		for(const parser of this.parsers.allBlocks) {
			//Paragraphs cannot interrupt other block-level elements.
			//But should we delegate this to the parser? Maybe...
			const canInterruptElement = parser.type !== 'Paragraph'
			if(canInterruptElement) {
				if(parser.startsBlockAtStartOfRange(start, end)) { return true }
			}
		}
		return false
	}

	startsBlockAtStartOfRange(start: TextLocation, end: TextLocation) {
		//That's the only general implementation, but it's also very slow,
		//so concrete block parsers should override this!
		return this.parse(start, end) != null
	}
}

export abstract class MfMInlineParser<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
> extends MfMParser<TYPE, CONTENT, ELEMENT> {
	abstract nextPossibleStart(start: TextLocation, end: TextLocation): TextLocation | null
	override startsBlockAtStartOfRange(start: TextLocation, end: TextLocation): boolean {
		return false
	}
}
