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

import { UpdateInfo } from "src/mbuffer"
import { AnyInline, Option, ParsingContext, UpdateCheckResult } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { andFalse, MfMParser } from "../MfMParser"
import { IdGenerator, Parsers } from "../Parsers"
import { MfMText } from "../TextParser"

export class MfMOption extends MfMElement<'Option', AnyInline, Option, OptionParser> implements Option {
	public readonly type = 'Option'
	readonly plainContent: string = ''

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: OptionParser,
		public readonly valid: boolean,
		parsingContext: ParsingContext,
	) {
		super(id, parsedRange, parsedWith, [], parsingContext)
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

	parse(start: TextLocation, end: TextLocation, context: ParsingContext): Option | null {
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
			context,
		)

		if(equalsPosition) {
			const secondTextStart = equalsPosition.accessor()
			secondTextStart.advance()
			if(secondTextStart.findNext('=', optionEnd)) {
				//cannot contain a second equals sign
				//TODO except when it's escaped! But this should be done at the findNext level...
				return null
			}

			const firstText = this.parsers.Text.parse(start, equalsPosition, context)
			if(firstText != null) {
				option.content.push(firstText)
			}
			const secondText = this.parsers.Text.parse(secondTextStart, optionEnd, context)
			if(secondText) {
				option.content.push(secondText)
			}
		} else {
			if(optionEnd.isEqualTo(start)) { return null }

			const firstText = this.parsers.Text.parse(start, optionEnd, context)
			if(firstText != null) {
				option.content.push(firstText)
			}
		}

		return option
	}
}
