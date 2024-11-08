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
import { Text } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { MfMParser } from "./MfMParser";

export class MfMText extends MfMElement<'Text', never, Text, TextParser> implements Text {
	readonly type = 'Text'
	readonly content: never[] = []

	get textContent() {
		//This function does not cache the string yet - an optimization
		//that might be necessary in the future. But not now ;)
		return this.parsedRange.asString()
	}

	get asText(): string {
		return this.parsedRange.asString()
	}
}
export class TextParser extends MfMParser<'Text', never, Text> {
	parse(start: TextLocation, end: TextLocation): Text | null {
		return new MfMText(this.idGenerator.nextId(), start.persistentRangeUntil(end), this)
	}
	checkUpdate(element: Text, update: UpdateInfo): UpdateCheckResult {
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
}
