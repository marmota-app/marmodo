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

import { AnyInline, ElementOptions, Options, TableColumn, TableRow, Text } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
import { MfMParser } from "../MfMParser"
import { IdGenerator, Parsers } from "../Parsers"
import { MfMCustomTableColumn } from "./CustomTableColumnParser"
import { MfMTableColumn } from "./TableColumnParser"

export class MfMTableRow extends MfMElement<'TableRow', TableColumn<any> | Options | Text, TableRow, TableRowParser> implements TableRow {
	public readonly type = 'TableRow'
	public tableRow: number = 0

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: TableRowParser,
		public readonly content: (TableColumn<any> | Options | Text)[],
	) {
		super(id, parsedRange, parsedWith, content)
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		return EMPTY_OPTIONS
	}
	get columns(): TableColumn<any>[] {
		return this.content.filter(c => c.type==='TableColumn' || c.type==='HeaderColumn' || c.type==='CustomTableColumn') as TableColumn<any>[]
	}

	get textContent(): string {
		return this.asText
	}

	override get referenceMap() {
		return {
			...super.referenceMap,
			tableRow: this.tableRow,
		}
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
		let tableColumn = 0
		while(cur.isBefore(columnsEnd)) {
			loop2.ensure()
			const customCol = this.parsers.CustomTableColumn.parse(cur, columnsEnd)
			if(customCol != null) {
				(customCol as MfMCustomTableColumn).tableColumn = tableColumn
				tableColumn++
				content.push(customCol)
				cur = customCol.parsedRange.end.accessor()
		} else {
				const column = colParser.parse(cur, columnsEnd)
				if(column != null) {
					tableColumn++
					content.push(column)
					cur = column.parsedRange.end.accessor()
				} else {
					break
				}
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
