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


import { AnyInline, ElementOptions, Options, TableDelimiterColumn, TableDelimiterRow } from "../../../src/element"
import { EMPTY_OPTIONS, MfMElement } from "../../../src/element/MfMElement"
import { TextLocation } from "../../../src/mbuffer/TextLocation"
import { PersistentRange } from "../../../src/mbuffer/TextRange"
import { MfMParser } from "../../../src/parser/MfMParser"

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

		const result = new MfMTableDelimiterColumn(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(delimiterEnd),
			this,
			alignment ?? 'left',
		)
		return result
	}
}

export class MfMTableDelimiterRow extends MfMElement<'TableDelimiterRow', TableDelimiterColumn, TableDelimiterRow, TableDelimiterRowParser> implements TableDelimiterRow {
	public readonly type = 'TableDelimiterRow'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: TableDelimiterRowParser,
		public readonly content: TableDelimiterColumn[],
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}

	override get options(): ElementOptions {
		return EMPTY_OPTIONS
	}

}
export class TableDelimiterRowParser extends MfMParser<'TableDelimiterRow', TableDelimiterColumn, TableDelimiterRow> {
	readonly type = 'TableDelimiterRow'

	parse(start: TextLocation, end: TextLocation): TableDelimiterRow | null {
		return null
	}
}
