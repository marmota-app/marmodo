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

import { AnyInline, ElementOptions, Options, TableColumn, TableRow, Text } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
import { MfMParser } from "../MfMParser"

export class MfMTableColumn extends MfMElement<'TableColumn', AnyInline, TableColumn, TableColumnParser> implements TableColumn {
	public readonly type = 'TableColumn'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableColumnParser,
		public readonly content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith)
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
}
export class TableColumnParser extends MfMParser<'TableColumn', AnyInline, TableColumn> {
	readonly type = 'TableColumn'

	parse(start: TextLocation, end: TextLocation): TableColumn | null {
		const content: AnyInline[] = []
		const contentStart = start.accessor()
		if(contentStart.is('|')) { contentStart.advance() }

		const pipePosition = contentStart.findNext('|', end)
		const contentEnd = pipePosition?.start ?? end

		const innerContent = this.parsers.parseInlines(contentStart, contentEnd, contentEnd)
		content.push(...innerContent)

		return new MfMTableColumn(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(contentEnd),
			this,
			content,
		)
	}
}

export class MfMTableRow extends MfMElement<'TableRow', TableColumn | Options | Text, TableRow, TableRowParser> implements TableRow {
	public readonly type = 'TableRow'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableRowParser,
		public readonly content: (TableColumn | Options | Text)[],
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		return EMPTY_OPTIONS
	}
	get columns(): TableColumn[] {
		return this.content.filter(c => c.type==='TableColumn')
	}

	get textContent(): string {
		return this.asText
	}
}
export class TableRowParser extends MfMParser<'TableRow', TableColumn | Options | Text, TableRow> {
	readonly type = 'TableRow'

	parse(start: TextLocation, end: TextLocation): TableRow | null {
		const content: (TableColumn | Options | Text)[] = []
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

		const loop2 = finiteLoop(() => [ cur.info() ])
		while(cur.isBefore(columnsEnd)) {
			loop2.ensure()
			const column = this.parsers.TableColumn.parse(cur, columnsEnd)
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
		
		if(result.columns.length === 0) {
			return null
		}
		return result
	}
}
