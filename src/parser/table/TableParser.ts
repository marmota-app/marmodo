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

import { BlankLine, Element, ElementOptions, Table, TableDelimiterRow, TableRow } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
import { MfMParser } from "../MfMParser"

export class MfMTable extends MfMElement<'Table', TableRow | TableDelimiterRow | BlankLine, Table, TableParser> implements Table {
	public readonly type = 'Table'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableParser,
		public readonly content: (TableRow | TableDelimiterRow | BlankLine)[],
	) {
		super(id, parsedRange, parsedWith)
	}

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

	override get referenceMap(): { [key: string]: string | Element<any, any, any> | Element<any, any, any>[] | null } {
		return {
			...super.referenceMap,
			'element.headers': this.headers,
			'element.columnDefinitions': this.delimiters,
			'element.rows': this.tableRows,
		}
	}
}
export class TableParser extends MfMParser<'Table', TableRow | TableDelimiterRow | BlankLine, Table> {
	readonly type = 'Table'

	parse(start: TextLocation, end: TextLocation): Table | null {
		const content: (TableRow | TableDelimiterRow | BlankLine)[] = []

		const [delimiters, headers] = this.#readDelimitersAndHeaders(start, end)

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
		while(cur.isBefore(end)) {
			loop.ensure()
			const nextNewline = cur.findNextNewline(end)
			const lineEnd = nextNewline?.end ?? end

			const row = this.parsers.TableRow.parse(cur, lineEnd)
			if(row != null) {
				content.push(row)
				cur = row.parsedRange.end.accessor()
				tableEnd = cur
			} else {
				break;
			}
		}

		tableEnd = this.addBlankLinesTo(content, cur, end).accessor()

		return new MfMTable(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(tableEnd),
			this,
			content
		)
	}

	override startsBlockAtStartOfRange(start: TextLocation, end: TextLocation): boolean {
		const firstNewline = start.findNextNewline(end)
		if(firstNewline) {
			const secondLineEnd = firstNewline.end.findNextNewline(end)?.start ?? end
			if(firstNewline.end.findNext(['|', '-'], secondLineEnd) != null) {
				return this.parse(start, end) != null
			}
		}
		return false
	}

	#readDelimitersAndHeaders(start: TextLocation, end: TextLocation): [TableDelimiterRow | null, TableRow | null] {
		const nextNewline = start.findNextNewline(end)
		if(nextNewline) {
			const possibleDelimitersNewline = nextNewline.end.findNextNewline(end)
			const possibleDelimitersEnd = possibleDelimitersNewline?.end ?? end
			let delimiters = this.parsers.TableDelimiterRow.parse(nextNewline.end, possibleDelimitersEnd)
			if(delimiters) {
				const headers = this.parsers.TableHeaderRow.parse(start, nextNewline.start)

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
			this.parsers.TableDelimiterRow.parse(start, end),
			null
		]
	}
}
