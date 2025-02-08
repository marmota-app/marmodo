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

import { AnyInline, Element, ElementOptions, TableColumn } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMParser } from "../MfMParser"
import { IdGenerator, Parsers } from "../Parsers"

export class MfMTableColumn<
	COL_TYPE extends 'TableColumn' | 'HeaderColumn'
> extends MfMElement<COL_TYPE, AnyInline, TableColumn<COL_TYPE>, TableColumnParser<COL_TYPE>> implements TableColumn<COL_TYPE> {
	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableColumnParser<COL_TYPE>,
		public readonly type: COL_TYPE,
		content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith, content)
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
}
export class TableColumnParser<
	COL_TYPE extends 'TableColumn' | 'HeaderColumn'
> extends MfMParser<COL_TYPE, AnyInline, TableColumn<COL_TYPE>> {
	constructor(idGenerator: IdGenerator, parsers: Parsers, public readonly type: COL_TYPE) {
		super(idGenerator, parsers)
	}

	parse(start: TextLocation, end: TextLocation): TableColumn<COL_TYPE> | null {
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
	}
}
