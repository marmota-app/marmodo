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
import { BlankLine } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { andFalse, MfMParser } from "./MfMParser";

export class MfMBlankLine extends MfMElement<'BlankLine', never, BlankLine, BlankLineParser> implements BlankLine {
	public readonly type = 'BlankLine'
	readonly content: never[] = []
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
			return new MfMBlankLine(this.idGenerator.nextId(), start.persistentRangeUntil(current), this)
		}
		if(current.isInRange(end) && current.is('\n')) {
			current.advance()
			return new MfMBlankLine(this.idGenerator.nextId(), start.persistentRangeUntil(current), this)
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