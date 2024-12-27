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

import { AnyInline, Option } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMParser } from "../MfMParser"
import { IdGenerator, Parsers } from "../Parsers"

export class MfMOption extends MfMElement<'Option', AnyInline, Option, OptionParser> implements Option {
	public readonly type = 'Option'
	readonly plainContent: string = ''

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: OptionParser,
		public readonly valid: boolean,
	) {
		super(id, parsedRange, parsedWith, [])
	}

	get key() {
		if(this.content.length===2) {
			return this.content[0].asText.trim()
		}
		return 'default'
	}
	get value() {
		if(this.content.length === 2) {
			return this.content[1].asText.trim()
		}
		return this.content[0].asText.trim()
	}

	get textContent(): string {
		return this.parsedRange.asString()
	}
	get asText(): string {
		return this.parsedRange.asString()
	}
}

export class OptionParser extends MfMParser<'Option', AnyInline, Option> {
	readonly type = 'Option'

	constructor(idGenerator: IdGenerator, parsers: Parsers, private readonly supportsDefault: boolean = false) {
		super(idGenerator, parsers)
	}
	
	parse(start: TextLocation, end: TextLocation): Option | null {
		const cur = start.accessor()

		const foundRange = cur.findNext([';', '}', '\r', '\n'], end)
		const optionEnd = foundRange?.start ?? end
		const rangeEnd = optionEnd.accessor()
		if(rangeEnd.isBefore(end) && rangeEnd.get() === ';') { rangeEnd.advance() }

		const foundEquals = cur.findNext('=', optionEnd)
		const equalsPosition = foundEquals?.start

		const isValidOption = this.supportsDefault || equalsPosition!=null

		const option = new MfMOption(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(rangeEnd),
			this,
			isValidOption,
		)

		if(equalsPosition) {
			const secondTextStart = equalsPosition.accessor()
			secondTextStart.advance()
			if(secondTextStart.findNext('=', optionEnd)) {
				//cannot contain a second equals sign
				//TODO except when it's escaped! But this should be done at the findNext level...
				return null
			}

			const firstText = this.parsers.Text.parse(start, equalsPosition)
			if(firstText != null) {
				option.content.push(firstText)
			}
			const secondText = this.parsers.Text.parse(secondTextStart, optionEnd)
			if(secondText) {
				option.content.push(secondText)
			}
		} else {
			if(optionEnd.isEqualTo(start)) { return null }
			
			const firstText = this.parsers.Text.parse(start, optionEnd)
			if(firstText != null) {
				option.content.push(firstText)
			}
		}

		return option
	}
}
