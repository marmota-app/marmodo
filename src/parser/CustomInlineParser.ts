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

import { AnyInline, CustomInline, ElementOptions, Options, Text } from "../element"
import { EMPTY_OPTIONS, MfMElement } from "../element/MfMElement"
import { TextLocation } from "../mbuffer/TextLocation"
import { PersistentRange, TextRange } from "../mbuffer/TextRange"
import { MfMInlineParser, MfMParser } from "./MfMParser"

export class MfMCustomInline extends MfMElement<'CustomInline', Text | Options, CustomInline, CustomInlineParser> implements CustomInline {
	readonly type = 'CustomInline'
	public customContent: string = ''
	public contentType: 'value' | 'error' = 'error'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: CustomInlineParser,
		readonly content: (Text | Options)[]
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		if(this.content.length === 0) { return '' }
		
		return '{{' + this.content[0].asText + '}}' + (this.content.length === 2? this.content[1].asText : '')
	}

	get plainContent(): string {
		if(this.content.length > 0) {
			return this.content[0].plainContent
		}
		return ''
	}
	
	override get referenceMap(): { [key: string]: string; } {
		return {
			...super.referenceMap,
			'element.textContent': this.plainContent,
			'element.customContent': this.customContent,
			'element.contentType': this.contentType,
		}
	}

	override get options() {
		if(this.content.length === 2) {
			return this.content[1] as ElementOptions
		}
		return EMPTY_OPTIONS
	}
}
export class CustomInlineParser extends MfMInlineParser<'CustomInline', Text | Options, CustomInline> {
	readonly type = 'CustomInline'
	
	parse(start: TextLocation, end: TextLocation): CustomInline | null {
		if(start.startsWith('{{', end)) {
			const startingDelimiter = start.findNext('{{', end)
			if(startingDelimiter == null) { return null }
			const endingDelimiter = start.findNext('}}', end)
			if(endingDelimiter == null) { return null }

			const content: (Text | Options)[] = []
			let contentEnd: TextLocation = endingDelimiter.end

			const text = this.parsers.Text.parse(startingDelimiter.end, endingDelimiter.start)
			if(text == null) { return null }
			content.push(text)

			if(endingDelimiter.end.isBefore(end) && endingDelimiter.end.get() === '{') {
				const options = this.parsers.Options.parse(endingDelimiter.end, end)
				if(options !== null) {
					content.push(options)
					contentEnd = options.parsedRange.end
				}
			}

			const result = new MfMCustomInline(
				this.idGenerator.nextId(),
				start.persistentRangeUntil(contentEnd),
				this,
				content
			)
			this.parsers.elementChanged('CustomInline', result)
			return result
		}

		return null
	}

	override nextPossibleStart(start: TextLocation, end: TextLocation): TextLocation | null {
		return start.findNext('{{', end)?.start ?? null
	}
}
