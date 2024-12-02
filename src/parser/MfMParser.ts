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

import { allBlockStarts, BlankLine } from "../element"
import { Element, Parser, UpdateCheckResult } from "../element/Element"
import { UpdateInfo } from "../mbuffer/TextContent"
import { TextLocation } from "../mbuffer/TextLocation"
import { IdGenerator, Parsers } from './Parsers'

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
			}
		}

		return {
			canUpdate: true,
			rangeStart: element.parsedRange.start,
			rangeEnd: element.parsedRange.end,
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
		if(start.startsWith(allBlockStarts, end)) {
			for(const parser of this.parsers.allBlocks) {
				//Paragraphs cannot interrupt other block-level elements.
				//But should we delegate this to the parser? Maybe...
				const canInterruptElement = parser.type !== 'Paragraph'
				if(canInterruptElement) {
					const element = parser.parse(start, end)
					if(element != null) { return true }
				}
			}
		}
		return false
	}
}
