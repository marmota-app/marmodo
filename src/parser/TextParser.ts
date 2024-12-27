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
