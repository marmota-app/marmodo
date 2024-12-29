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

import { UpdateCheckResult } from "../element/Element";
import { MfMElement } from "../element/MfMElement";
import { allBlockStarts, Text } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { andFalse, andOther, MfMParser } from "./MfMParser";

export class MfMText extends MfMElement<'Text', never, Text, TextParser> implements Text {
	readonly type = 'Text'

	get textContent() {
		//This function does not cache the string yet - an optimization
		//that might be necessary in the future. But not now ;)
		return this.parsedRange.asString()
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	get plainContent(): string {
		return this.textContent
	}
	
	override get referenceMap(): { [key: string]: string; } {
		return {
			...super.referenceMap,
			'element.textContent': this.textContent,
		}
	}
}
export class TextParser extends MfMParser<'Text', never, Text> {
	readonly type = 'Text'
	
	parse(start: TextLocation, end: TextLocation): Text | null {
		return new MfMText(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, [])
	}
	checkUpdate(element: Text, update: UpdateInfo): UpdateCheckResult {
		return this.checkUpdateDoesNotChangeNewlines(element, update).and(this.#checkUpdateDoesNotAddPunctuation(element, update))
	}

	acceptUpdate(original: Text, updated: Text): boolean {
		if(this.#containsAnyAfterNewline(allBlockStarts, updated)) {
			return false
		}
		return true
	}
	#containsAnyAfterNewline(texts: string[], element: Text): boolean {
		const updatedText = element.asText

		for(const text of texts) {
			const index = updatedText.indexOf(text)
			if(index === 0) {
				return true
			}
			if(index > 0 && (updatedText.charAt(index-1)==='\r' || updatedText.charAt(index-1)==='\n')) {
				return true
			}
		}

		return false
	}
	#checkUpdateDoesNotAddPunctuation(element: Text, update: UpdateInfo): UpdateCheckResult {
		for(let i=0; i<update.newText.length; i++) {
			const ch = update.newText.charAt(i)
			switch(ch) {
				case '=': case '*': case '_': case '[': case ']':
				case '!': case '~': case '`': case '{': case '}':
				case ';': case '|':
					return { canUpdate: false, and: andFalse, }
			}
		}
		return {
			canUpdate: true,
			rangeStart: element.parsedRange.start,
			rangeEnd: element.parsedRange.end,
			and: andOther,
		}
	}
}
