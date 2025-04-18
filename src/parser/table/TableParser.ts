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

import { BlankLine, Element, ElementOptions, ParsingContext, Table, TableDelimiterRow, TableRow } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { finiteLoop } from "../../utilities/finiteLoop"
import { MfMParser } from "../MfMParser"
import { MfMTableRow } from "./TableRowParser"
import { TableSxContext } from "./TableSxContext"

export class MfMTable extends MfMElement<'Table', TableRow | TableDelimiterRow | BlankLine, Table, TableParser> implements Table {
	public readonly type = 'Table'
	public lastRow = 0
	public lastColumn = 0

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		return this.delimiters.options
	}

	get textContent(): string {
		return this.asText
	}

	get delimiters(): TableDelimiterRow {
		if(this.content[0].type === 'TableRow') {
			return this.content[1] as TableDelimiterRow
		}
		return this.content[0] as TableDelimiterRow
	}
	get headers(): TableRow | null {
		if(this.content[0].type === 'TableRow') {
			return this.content[0]
		}
		return null
	}
	get tableRows(): TableRow[] {
		const startRow = this.content[0].type === 'TableRow'? 2 : 1
		return this.content.filter((r, i) => i>=startRow && r.type==='TableRow') as TableRow[]
	}

	get columns(): number {
		return this.delimiters.columns.length
	}
	get rows(): number {
		return this.tableRows.length
	}

	override get referenceMap(): { [key: string]: string | number | boolean | Element<any, any, any> | Element<any, any, any>[] | null } {
		return {
			...super.referenceMap,
			'element.headers': this.headers,
			'element.columnDefinitions': this.delimiters,
			'element.rows': this.tableRows,
			'lastRow': this.lastRow,
			'lastColumn': this.lastColumn,
		}
	}
}
export class TableParser extends MfMParser<'Table', TableRow | TableDelimiterRow | BlankLine, Table> {
	readonly type = 'Table'

	parse(start: TextLocation, end: TextLocation, _context: ParsingContext): Table | null {
		const content: (TableRow | TableDelimiterRow | BlankLine)[] = []
		const tableSxContext = _context.sxContext? new TableSxContext(_context.sxContext) : undefined
		const tableContext: ParsingContext = { ..._context, sxContext: tableSxContext}

		const [delimiters, headers] = this.#readDelimitersAndHeaders(start, end, tableContext)

		if(headers != null) {
			content.push(headers)
		}
		if(delimiters == null) {
			return null
		}
		content.push(delimiters)

		let cur = delimiters.parsedRange.end.accessor()
		const loop = finiteLoop(() => [ cur.info() ])
		let tableEnd = cur
		let tableRow = 0

		while(cur.isBefore(end)) {
			loop.ensure()
			const nextNewline = cur.findNextNewline(end)
			const lineEnd = nextNewline?.end ?? end

			const row = this.parsers.TableRow.parse(cur, lineEnd, tableContext)
			if(row != null) {
				(row as MfMTableRow).tableRow = tableRow
				tableRow++
				content.push(row)
				cur = row.parsedRange.end.accessor()
				tableEnd = cur
			} else {
				break;
			}
		}

		tableEnd = this.addBlankLinesTo(content, cur, end).accessor()

		const result = new MfMTable(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(tableEnd),
			this,
			content,
			tableContext,
		)
		result.lastRow = result.rows-1
		result.lastColumn = result.columns-1

		if(tableSxContext != null) { tableSxContext.table = result }

		return result
	}

	override startsBlockAtStartOfRange(start: TextLocation, end: TextLocation): boolean {
		const firstNewline = start.findNextNewline(end)
		if(firstNewline) {
			const secondLineEnd = firstNewline.end.findNextNewline(end)?.start ?? end
			if(firstNewline.end.findNext(['|', '-'], secondLineEnd) != null) {
				return this.parse(start, end, {}) != null
			}
		}
		return false
	}

	#readDelimitersAndHeaders(start: TextLocation, end: TextLocation, context: ParsingContext): [TableDelimiterRow | null, TableRow | null] {
		const nextNewline = start.findNextNewline(end)
		if(nextNewline) {
			const possibleDelimitersNewline = nextNewline.end.findNextNewline(end)
			const possibleDelimitersEnd = possibleDelimitersNewline?.end ?? end
			let delimiters = this.parsers.TableDelimiterRow.parse(nextNewline.end, possibleDelimitersEnd, context)
			if(delimiters) {
				const headers = this.parsers.TableHeaderRow.parse(start, nextNewline.start, context)

				if(headers == null || headers.columns.length===0) {
					return [
						null,
						null
					]
				}
				return [
					delimiters,
					headers
				]
			}
		}

		return [
			this.parsers.TableDelimiterRow.parse(start, end, context),
			null
		]
	}
}
