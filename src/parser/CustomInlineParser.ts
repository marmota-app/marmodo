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

import { SxEvaluation } from "src/sx/SxEvaluation"
import { CustomElement, CustomInline, ElementOptions, Options, ParsingContext, Text } from "../element"
import { EMPTY_OPTIONS, MfMElement } from "../element/MfMElement"
import { TextLocation } from "../mbuffer/TextLocation"
import { MfMInlineParser, MfMParser } from "./MfMParser"
import { PersistentRange } from "src/mbuffer/TextRange"

export class MfMCustomInline extends MfMElement<'CustomInline', Text | Options, CustomInline, CustomInlineParser> implements CustomInline, CustomElement {
	readonly type = 'CustomInline'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: CustomInlineParser,
		content: (Text | Options)[],
		parsingContext: ParsingContext,
		public readonly evaluation?: SxEvaluation,
	) {
		super(id, parsedRange, parsedWith, content, parsingContext)
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

	parse(start: TextLocation, end: TextLocation, context: ParsingContext): CustomInline | null {
		if(start.startsWith('{{', end)) {
			const startingDelimiter = start.findNext('{{', end)
			if(startingDelimiter == null) { return null }
			const endingDelimiter = start.findNext('}}', end)
			if(endingDelimiter == null) { return null }

			const content: (Text | Options)[] = []
			let contentEnd: TextLocation = endingDelimiter.end

			const text = this.parsers.Text.parse(startingDelimiter.end, endingDelimiter.start, context)
			if(text == null) { return null }
			content.push(text)

			if(endingDelimiter.end.isBefore(end) && endingDelimiter.end.get() === '{') {
				const options = this.parsers.Options.parse(endingDelimiter.end, end, context)
				if(options !== null) {
					content.push(options)
					contentEnd = options.parsedRange.end
				}
			}

			const evaluation = context.sxContext?.createEvaluation(text.asText)
			const result = new MfMCustomInline(
				this.idGenerator.nextId(),
				start.persistentRangeUntil(contentEnd),
				this,
				content,
				context,
				evaluation,
			)
			return result
		}

		return null
	}

	override nextPossibleStart(start: TextLocation, end: TextLocation): TextLocation | null {
		return start.findNext('{{', end)?.start ?? null
	}
}
