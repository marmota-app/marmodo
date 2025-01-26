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

import { AnyInline } from '../element'
import { Element, ElementUpdateRegistration, Parser } from '../element/Element'
import { TextLocation } from '../mbuffer/TextLocation'
import { finiteLoop } from '../utilities/finiteLoop'
import { BlankLineParser } from './BlankLineParser'
import { ContainerParser } from './ContainerParser'
import { CustomInlineParser } from './CustomInlineParser'
import { HeadingContentParser, HeadingParser } from './HeadingParser'
import { MfMInlineParser } from './MfMParser'
import { ParagraphParser } from './ParagraphParser'
import { SectionParser } from './SectionParser'
import { TextParser } from './TextParser'
import { EmphasisParser } from './delimitedinline/EmphasisParser'
import { StrongEmphasisParser } from './delimitedinline/StrongEmphasisParser'
import { OptionParser } from './options/OptionParser'
import { OptionsParser } from './options/OptionsParser'
import { CustomTableColumnParser } from './table/CustomTableColumnParser'
import { TableDelimiterColumnParser, TableDelimiterRowParser } from './table/DelimiterRowParser'
import { TableColumnParser } from './table/TableColumnParser'
import { TableParser } from './table/TableParser'
import { TableRowParser } from './table/TableRowParser'

interface ParseLocation {
	parser: Parser<any, any, any>,
	start: TextLocation,
}
export class Parsers {
	#changedListeners: { [key: string]: { [key: string]: (e: Element<any, any, any>)=>unknown}} = {}
	#changeEventsEnabled = true

	private knownParsers: { [key: string]: Parser<any, any, any> } = {}
	private idGenerator = new IdGenerator()

	get Container(): ContainerParser { return this.getParser('Container', () => new ContainerParser(this.idGenerator, this)) }
	get Section(): SectionParser { return this.getParser('Section', () => new SectionParser(this.idGenerator, this)) }

	get Heading(): HeadingParser { return this.getParser('Heading', () => new HeadingParser(this.idGenerator, this)) }
	get Paragraph(): ParagraphParser { return this.getParser('Paragraph', () => new ParagraphParser(this.idGenerator, this)) }

	get TableDelimiterColumn(): TableDelimiterColumnParser { return this.getParser('TableDelimiterColumn', () => new TableDelimiterColumnParser(this.idGenerator, this)) }
	get TableDelimiterRow(): TableDelimiterRowParser { return this.getParser('TableDelimiterRow', () => new TableDelimiterRowParser(this.idGenerator, this)) }
	get TableColumn(): TableColumnParser<'TableColumn'> { return this.getParser('TableColumn', () => new TableColumnParser(this.idGenerator, this, 'TableColumn')) }
	get HeaderColumn(): TableColumnParser<'HeaderColumn'> { return this.getParser('HeaderColumn', () => new TableColumnParser(this.idGenerator, this, 'HeaderColumn')) }
	get CustomTableColumn(): CustomTableColumnParser { return this.getParser('CustomTableColumn', () => new CustomTableColumnParser(this.idGenerator, this)) }
	get TableRow(): TableRowParser { return this.getParser('TableRow', () => new TableRowParser(this.idGenerator, this)) }
	get TableHeaderRow(): TableRowParser { return this.getParser('TableHeaderRow', () => new TableRowParser(this.idGenerator, this, true)) }
	get Table(): TableParser { return this.getParser('Table', () => new TableParser(this.idGenerator, this)) }

	get HeadingContent(): HeadingContentParser { return this.getParser('HeadingContent', () => new HeadingContentParser(this.idGenerator, this)) }
	get CustomInline(): CustomInlineParser { return this.getParser('CustomInline', () => new CustomInlineParser(this.idGenerator, this)) }
	get Text(): TextParser { return this.getParser('Text', () => new TextParser(this.idGenerator, this)) }
	get BlankLine(): BlankLineParser { return this.getParser('BlankLine', () => new BlankLineParser(this.idGenerator, this)) }

	get StrongEmphasis(): StrongEmphasisParser { return this.getParser('StrongEmphasis', () => new StrongEmphasisParser(this.idGenerator, this)) }
	get Emphasis(): EmphasisParser { return this.getParser('Emphasis', () => new EmphasisParser(this.idGenerator, this)) }

	get FirstOption(): OptionParser { return this.getParser('FirstOption', () => new OptionParser(this.idGenerator, this, true)) }
	get Option(): OptionParser { return this.getParser('Option', () => new OptionParser(this.idGenerator, this, false)) }
	get Options(): OptionsParser { return this.getParser('Options', () => new OptionsParser(this.idGenerator, this)) }

	get allBlocks(): Parser<any, any, any>[] {
		return [
			this.Heading,

			this.Table,
			this.Paragraph,
		]
	}

	get allParsableInlines(): MfMInlineParser<any, any, any>[] {
		return [
			this.StrongEmphasis,
			this.Emphasis,
			
			this.CustomInline,
		]
	}

	onElementChanged(type: string, callback: (e: Element<any, any, any>)=>unknown): ElementUpdateRegistration {
		const id = this.idGenerator.nextTaggedId('element-created')
		if(this.#changedListeners[type] == null) {
			this.#changedListeners[type] = {}
		}
		this.#changedListeners[type][id] = callback

		return {
			id,
			unsubscribe: () => {
				delete this.#changedListeners[type][id]
			}
		}
	}
	elementChanged(type: string, element: Element<any, any, any>) {
		if(!this.#changeEventsEnabled) { return }

		if(this.#changedListeners[type] != null) {
			Object.keys(this.#changedListeners[type]).forEach(k => this.#changedListeners[type][k](element))
		}
	}
	withSuppressedChangedEvents<T>(runnable: () => T): T {
		this.#changeEventsEnabled = false
		const result = runnable()
		this.#changeEventsEnabled = true
		return result
	}
	
	parseInlines(start: TextLocation, end: TextLocation, delimiterEnd: TextLocation): AnyInline[] {
		let parseLocation = start.accessor()
		let lastElementLocation = parseLocation
		const result: AnyInline[] = []

		const loop = finiteLoop(() => [ parseLocation.info() ])
		while(parseLocation.isBefore(end)) {
			loop.ensure()

			const nextLocation: ParseLocation | null = this.allParsableInlines.reduce(
				(prev: ParseLocation | null, cur) => {
					const next = cur.nextPossibleStart(parseLocation, end)
					if(next != null) {
						if(prev != null && prev.start.isAtMost(next)) {
							return prev
						}
						return {
							parser: cur,
							start: next,
						}
	
					}
					return prev
				},
				null as (ParseLocation | null)
			)

			if(nextLocation) {
				let inline = nextLocation.parser.parse(nextLocation.start, delimiterEnd)
				if(inline == null) {
					//If the preferred parser did not find anything at this
					//location, maybe another of the inline parsers can match
					//here (for longer delimiter runs)
					for(let p of this.allParsableInlines) {
						inline = p.parse(nextLocation.start, delimiterEnd)
						if(inline != null) { break }
					}
				}

				if(inline != null) {
					if(nextLocation.start.isAfter(parseLocation)) {
						result.push(this.Text.parse(parseLocation, nextLocation.start)!)
					}
					result.push(inline)
					parseLocation = inline.parsedRange.end.accessor()
					lastElementLocation = parseLocation
				} else {
					parseLocation = nextLocation.start.accessor()
					parseLocation.advance()	
				}
			} else {
				break
			}
		}

		if(parseLocation.isBefore(end)) {
			result.push(this.Text.parse(lastElementLocation, end)!)
		}

		return result
	}

	private getParser<
		TYPE extends string,
		PARSER extends Parser<any, any, any>
	>(
		elementType: TYPE,
		createElementParser: () => PARSER
	): PARSER {
		if(this.knownParsers[elementType] == null) {
			this.knownParsers[elementType] = createElementParser()
		}
		return this.knownParsers[elementType] as PARSER
	}
}

export class IdGenerator {
	private current = 0

	nextId(): ElementId {
		return `elem-${this.nextPureId()}`
	}

	nextLineId(): LineId {
		return `line-${this.nextPureId()}`
	}

	nextTaggedId(tag: string): string {
		return `${tag}-${this.nextPureId()}`
	}
	
	private nextPureId(): string {
		const id = String(this.current)
			.padStart(16, '0')
			.split(/(....)/)
			.filter(s => s !== '')
			.join('-')

		this.current++
		return id
	}
}

export type LineId    = `line-${string}`
export type ElementId = `elem-${string}`

