/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

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

import { AnyInline, ElementOptions, Options, TableColumn, TableRow, Text } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
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

export class MfMTableRow extends MfMElement<'TableRow', TableColumn<any> | Options | Text, TableRow, TableRowParser> implements TableRow {
	public readonly type = 'TableRow'

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		return EMPTY_OPTIONS
	}
	get columns(): TableColumn<any>[] {
		return this.content.filter(c => c.type==='TableColumn' || c.type==='HeaderColumn') as TableColumn<any>[]
	}

	get textContent(): string {
		return this.asText
	}
}
export class TableRowParser extends MfMParser<'TableRow', TableColumn<any> | Options | Text, TableRow> {
	readonly type = 'TableRow'

	constructor(idGenerator: IdGenerator, parsers: Parsers, private readonly isHeaderRow = false) {
		super(idGenerator, parsers)
	}

	parse(start: TextLocation, end: TextLocation): TableRow | null {
		const content: (TableColumn<any> | Options | Text)[] = []
		let cur = start.accessor()

		const nextNewline = start.findNextNewline(end)
		const contentEnd = nextNewline?.start ?? end
		const lineEnd = nextNewline?.end ?? end

		let lastPipe: TextLocation | null = null
		let nextPipe = cur.findNext('|', contentEnd)
		const loop1 = finiteLoop(() => [ nextPipe?.start.info() ])
		while(nextPipe !== null) {
			loop1.ensure()
			lastPipe = nextPipe.start
			const nextSearchPosition = lastPipe.accessor()
			nextSearchPosition.advance()
			nextPipe = nextSearchPosition.findNext('|', contentEnd)
		}
		
		let options: Options | null = null
		let text: Text | null = null
		let columnsEnd = contentEnd
		if(lastPipe) {
			const current = lastPipe.accessor()
			current.advance()
			if(current.isEqualTo(contentEnd)) {
				columnsEnd = lastPipe
			} else if(current.get() === '{') {
				options = this.parsers.Options.parse(current, contentEnd)
				if(options === null) {
					text = this.parsers.Text.parse(current, contentEnd)
				}
				columnsEnd = lastPipe
			}
		}

		const colParser = this.isHeaderRow? this.parsers.HeaderColumn : this.parsers.TableColumn
		const loop2 = finiteLoop(() => [ cur.info() ])
		while(cur.isBefore(columnsEnd)) {
			loop2.ensure()
			const column = colParser.parse(cur, columnsEnd)
			if(column != null) {
				content.push(column)
				cur = column.parsedRange.end.accessor()
			} else {
				break
			}
		}

		if(options != null) {
			content.push(options)
		} else if(text != null) {
			content.push(text)
		}

		const result = new MfMTableRow(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(lineEnd),
			this,
			content,
		)
		
		if(result.columns.length === 0 && lastPipe == null) {
			return null
		}
		return result
	}
}
