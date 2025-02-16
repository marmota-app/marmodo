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

import { ParsingContext, UpdateCheckResult } from "../element/Element";
import { MfMElement } from "../element/MfMElement";
import { BlankLine } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { andFalse, MfMParser } from "./MfMParser";

export class MfMBlankLine extends MfMElement<'BlankLine', never, BlankLine, BlankLineParser> implements BlankLine {
	public readonly type = 'BlankLine'
	readonly plainContent: string = ''

	get textContent() {
		//This function does not cache the string yet - an optimization
		//that might be necessary in the future. But not now ;)
		return this.parsedRange.asString()
	}

	get asText(): string {
		return this.parsedRange.asString()
	}
}

export class BlankLineParser extends MfMParser<'BlankLine', never, BlankLine> {
	readonly type = 'BlankLine'
	
	parse(start: TextLocation, end: TextLocation): BlankLine | null {
		const current = start.accessor()

		while(current.isInRange(end) && current.is([' ', '\t'])) {
			current.advance()
		}

		if(current.isInRange(end) && current.is('\r')) {
			current.advance()
			if(current.isInRange(end) && current.is('\n')) {
				current.advance()
			}
			return new MfMBlankLine(this.idGenerator.nextId(), start.persistentRangeUntil(current), this, [], {})
		}
		if(current.isInRange(end) && current.is('\n')) {
			current.advance()
			return new MfMBlankLine(this.idGenerator.nextId(), start.persistentRangeUntil(current), this, [], {})
		}

		return null
	}
	checkUpdate(element: BlankLine, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		//Blank lines can never be updated, since changing blank lines is
		//quite risky! It might change the document structure completely!
		//e.g. when removing a newline or when changing the indentation of
		//a blank line inside a code block.
		return {
			canUpdate: false,
			and: andFalse,
		}
	}
}