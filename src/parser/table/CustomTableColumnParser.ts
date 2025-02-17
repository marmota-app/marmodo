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
import { AnyInline, CustomElement, ElementOptions, ParsingContext, TableColumn } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMParser } from "../MfMParser"
import { IdGenerator, Parsers } from "../Parsers"

export class MfMCustomTableColumn extends MfMElement<'CustomTableColumn', AnyInline, TableColumn<'CustomTableColumn'>, CustomTableColumnParser> implements TableColumn<'CustomTableColumn'>, CustomElement {
	public readonly type = 'CustomTableColumn'
	public tableColumn: number = 0

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: CustomTableColumnParser,
		content: AnyInline[],
		parsingContext: ParsingContext,
		public readonly evaluation?: SxEvaluation,
	) {
		super(id, parsedRange, parsedWith, content, parsingContext)
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		return EMPTY_OPTIONS
	}

	get textContent(): string {
		return this.asText
	}
	get plainContent(): string {
		return this.content.map(c => c.plainContent).join('')
	}

	override get referenceMap() {
		return {
			...super.referenceMap,
			'element.textContent': this.plainContent,
			tableColumn: this.tableColumn,
		}
	}
}
export class CustomTableColumnParser extends MfMParser<'CustomTableColumn', AnyInline, TableColumn<'CustomTableColumn'>> {
	public readonly type = 'CustomTableColumn'

	constructor(idGenerator: IdGenerator, parsers: Parsers) {
		super(idGenerator, parsers)
	}

	parse(start: TextLocation, end: TextLocation, context: ParsingContext): TableColumn<'CustomTableColumn'> | null {
		const contentStart = start.accessor()
		if(!contentStart.is('|')) { return null }

		contentStart.advance()
		if(!contentStart.is('{')) { return null }
		contentStart.advance()
		if(!contentStart.is('{')) { return null }
		contentStart.advance()

		const contentEnd = contentStart.findNext('}}', end)
		if(contentEnd == null) { return null }
		if(!contentEnd.end.is('|')) { return null }

		const text = this.parsers.Text.parse(contentStart, contentEnd.start, context)
		if(text == null) { return null }

		const evaluation = context.sxContext?.createEvaluation(text.asText)
		return new MfMCustomTableColumn(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(contentEnd.end),
			this,
			[ text ],
			context,
			evaluation,
		)

		/*
		const content: AnyInline[] = []
		const contentStart = start.accessor()
		if(contentStart.is('|')) { contentStart.advance() }

		const nextNewline = contentStart.findNextNewline(end)
		const lineEnd = nextNewline?.start ?? end

		const pipePosition = contentStart.findNext('|', lineEnd)
		const contentEnd = pipePosition?.start ?? lineEnd

		const innerContent = this.parsers.parseInlines(contentStart, contentEnd, contentEnd)
		content.push(...innerContent)

		return new MfMTableColumn(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(contentEnd),
			this,
			this.type,
			content,
		)
		*/
	}
}
