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
import { MfMInlineParser } from "./MfMParser"
import { PersistentRange } from "src/mbuffer/TextRange"
import { MfMOptions } from "./options/OptionsParser"

export class MfMCustomInline extends MfMElement<'CustomInline', Text | Options, CustomInline, CustomInlineParser> implements CustomInline, CustomElement {
	readonly type = 'CustomInline'
	private lastRegisteredName: string | null | undefined = null

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: CustomInlineParser,
		content: (Text | Options)[],
		parsingContext: ParsingContext,
		public readonly evaluation?: SxEvaluation,
	) {
		super(id, parsedRange, parsedWith, content, parsingContext)

		this.#registerInContext()
		this.onSubtreeUpdate(() => {
			this.#registerInContext()
		})
	}

	#registerInContext() {
		if(this.content.length === 2) {
			const options = this.content[1] as MfMOptions

			const evaluationName = options.get('default')
			if(this.lastRegisteredName != null) {
				this.parsingContext.sxContext?.unregisterNamed(this.lastRegisteredName, this.id)
			}
			if(evaluationName && this.evaluation != null) {
				this.parsingContext.sxContext?.registerNamed(this.evaluation, evaluationName, this.id)
			}

			this.lastRegisteredName = options.get('default')
		} else {
			this.lastRegisteredName = null
		}
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

	override get referenceMap(): { [key: string]: string | null; } {
		const evalResult = this.evaluation?.result

		return {
			...super.referenceMap,
			'element.textContent': this.plainContent,
			'sx.result': evalResult?.resultType === 'value'? evalResult.asString : '-no result-',
			'sx.resultType': evalResult?.resultType ?? null,
			'sx.errorMessage': evalResult?.resultType === 'error'? evalResult.message : null,
		}
	}

	override get options() {
		if(this.content.length === 2) {
			return this.content[1] as ElementOptions
		}
		return EMPTY_OPTIONS
	}

	updateSxResults(evaluationId: string) {
		const lastResult = this.evaluation?.result
		const newResult = this.evaluation?.evaluate(evaluationId)

		if(lastResult != null) {
			if(lastResult.resultType !== newResult?.resultType) {
				this.updateParsed()
			}
			if(lastResult.resultType === 'value' && newResult?.resultType === 'value' && lastResult.asString !== newResult.asString) {
				this.updateParsed()
			}
		}
	}

	override removeFromTree(): void {
		super.removeFromTree()
		if(this.lastRegisteredName != null) {
			//if(exchangedFor?.lastRegisteredName !== this.lastRegisteredName) {
				this.parsingContext.sxContext?.unregisterNamed(this.lastRegisteredName, this.id)
			//}
		}
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
			text.allowUpdate = false
			content.push(text)

			const evaluation = context.sxContext?.createEvaluation(text.asText)
			if(endingDelimiter.end.isBefore(end) && endingDelimiter.end.get() === '{') {
				const options = this.parsers.Options.parse(endingDelimiter.end, end, context)
				if(options !== null) {
					content.push(options)
					contentEnd = options.parsedRange.end
				}
			}

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
