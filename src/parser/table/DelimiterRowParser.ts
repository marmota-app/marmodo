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


import { AnyInline, ElementOptions, Options, TableDelimiterColumn, TableDelimiterRow, Text } from "../../../src/element"
import { EMPTY_OPTIONS, MfMElement } from "../../../src/element/MfMElement"
import { TextLocation } from "../../../src/mbuffer/TextLocation"
import { PersistentRange } from "../../../src/mbuffer/TextRange"
import { MfMParser } from "../../../src/parser/MfMParser"
import { finiteLoop } from "../../utilities/finiteLoop"

export class MfMTableDelimiterColumn extends MfMElement<'TableDelimiterColumn', Options, TableDelimiterColumn, TableDelimiterColumnParser> implements TableDelimiterColumn {
	public readonly type = 'TableDelimiterColumn'
	public readonly content: Options[] = []

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableDelimiterColumnParser,
		public readonly alignment: 'left' | 'center' | 'right',
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
export class TableDelimiterColumnParser extends MfMParser<'TableDelimiterColumn', AnyInline, TableDelimiterColumn> {
	readonly type = 'TableDelimiterColumn'

	parse(start: TextLocation, end: TextLocation): TableDelimiterColumn | null {
		let delimiterEnd = start.accessor()
		if(delimiterEnd.is('|')) { delimiterEnd.advance() }

		let parseState: 'start' | 'left' | 'hyphens' | 'right' | 'end' = 'start'
		const nextState: { [key in 'start' | 'left' | 'hyphens' | 'right' | 'end']: {
			[key in ' ' | '\t' | '-' | ':' ]: 'start' | 'left' | 'hyphens' | 'right' | 'end' | '-illegal-'
		}} = {
			'start': {
				' ': 'start',
				'\t': 'start',
				'-': 'hyphens',
				':': 'left',
			},
			'left': {
				' ': '-illegal-',
				'\t': '-illegal-',
				'-': 'hyphens',
				':': '-illegal-',
			},
			'hyphens': {
				' ': 'end',
				'\t': 'end',
				'-': 'hyphens',
				':': 'right',
			},
			'right': {
				' ': 'end',
				'\t': 'end',
				'-': '-illegal-',
				':': '-illegal-',
			},
			'end': {
				' ': 'end',
				'\t': 'end',
				'-': '-illegal-',
				':': '-illegal-',
			},
		}
		let alignment: 'left' | 'center' | 'right' | undefined = undefined
		while(delimiterEnd.isBefore(end) && !delimiterEnd.is('|')) {
			const currentChar = delimiterEnd.get() as ' ' | '\t' | ':' | '-'
			const next: 'start' | 'left' | 'hyphens' | 'right' | 'end' | '-illegal-' = nextState[parseState][currentChar]

			if(next == null || next === '-illegal-') { return null }
			parseState = next

			if(parseState === 'left') { alignment = 'left' }
			if(parseState === 'right') { alignment = alignment===undefined? 'right' : 'center' }

			delimiterEnd.advance()
		}

		if(parseState === 'hyphens' || parseState==='right' || parseState==='end') {
			const result = new MfMTableDelimiterColumn(
				this.idGenerator.nextId(),
				start.persistentRangeUntil(delimiterEnd),
				this,
				alignment ?? 'left',
			)
			return result
		}
		return null
	}

	override acceptUpdate(original: TableDelimiterColumn, updated: TableDelimiterColumn): boolean {
		return original.alignment === updated.alignment
	}
}

export class MfMTableDelimiterRow extends MfMElement<'TableDelimiterRow', TableDelimiterColumn | Options | Text, TableDelimiterRow, TableDelimiterRowParser> implements TableDelimiterRow {
	public readonly type = 'TableDelimiterRow'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableDelimiterRowParser,
		public readonly content: (TableDelimiterColumn | Options | Text)[],
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get options(): ElementOptions {
		if(this.content[this.content.length-1].type === 'Options') {
			return this.content[this.content.length-1] as ElementOptions
		}
		return EMPTY_OPTIONS
	}

	get columns(): TableDelimiterColumn[] {
		return this.content.filter(c => c.type==='TableDelimiterColumn')
	}
}
export class TableDelimiterRowParser extends MfMParser<'TableDelimiterRow', TableDelimiterColumn | Options | Text, TableDelimiterRow> {
	readonly type = 'TableDelimiterRow'

	parse(start: TextLocation, end: TextLocation): TableDelimiterRow | null {
		let cur = start
		const content: (TableDelimiterColumn | Options | Text)[] = []

		const nextNewline = start.findNextNewline(end)
		const contentEnd = nextNewline?.start ?? end
		const rowEnd = nextNewline?.end ?? end

		const loop = finiteLoop(() => [ cur.info(), ])
		while(cur.isBefore(contentEnd)) {
			loop.ensure()
			const col = this.parsers.TableDelimiterColumn.parse(cur, contentEnd)
			if(col != null) {
				content.push(col)
				cur = col.parsedRange.end
			} else {
				break
			}
		}

		let current = cur.accessor()
		if(current.isBefore(contentEnd)) {
			if(current.get() !== '|') { return null }
			current.advance()
			if(current.get() === '{') {
				const options = this.parsers.Options.parse(current, contentEnd)
				if(options) {
					content.push(options)
					current = options.parsedRange.end.accessor()
				} else {
					const text = this.parsers.Text.parse(current, contentEnd)
					content.push(text!)
					current = contentEnd.accessor()
				}
			}
			while(current.isBefore(contentEnd) && current.isWhitespace()) {
				current.advance()
			}
			if(!current.isEqualTo(contentEnd)) { return null }
		}

		const result = new MfMTableDelimiterRow(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(rowEnd),
			this,
			content,
		)
		if(result.columns.length === 0) { return null }
		return result
	}
}
