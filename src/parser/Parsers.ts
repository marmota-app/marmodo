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

import { AnyInline } from '../element'
import { Parser } from '../element/Element'
import { TextLocation } from '../mbuffer/TextLocation'
import { finiteLoop } from '../utilities/finiteLoop'
import { BlankLineParser } from './BlankLineParser'
import { ContainerParser } from './ContainerParser'
import { HeadingContentParser, HeadingParser } from './HeadingParser'
import { MfMInlineParser } from './MfMParser'
import { ParagraphParser } from './ParagraphParser'
import { SectionParser } from './SectionParser'
import { TextParser } from './TextParser'
import { EmphasisParser } from './delimitedinline/EmphasisParser'
import { StrongEmphasisParser } from './delimitedinline/StrongEmphasisParser'
import { OptionParser } from './options/OptionParser'
import { OptionsParser } from './options/OptionsParser'

interface ParseLocation {
	parser: Parser<any, any, any>,
	start: TextLocation,
}
export class Parsers {
	private knownParsers: { [key: string]: Parser<any, any, any> } = {}
	private idGenerator = new IdGenerator()

	get Container(): ContainerParser { return this.getParser('Container', () => new ContainerParser(this.idGenerator, this)) }
	get Section(): SectionParser { return this.getParser('Section', () => new SectionParser(this.idGenerator, this)) }

	get Heading(): HeadingParser { return this.getParser('Heading', () => new HeadingParser(this.idGenerator, this)) }
	get Paragraph(): ParagraphParser { return this.getParser('Paragraph', () => new ParagraphParser(this.idGenerator, this)) }

	get HeadingContent(): HeadingContentParser { return this.getParser('HeadingContent', () => new HeadingContentParser(this.idGenerator, this)) }
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

			this.Paragraph,
		]
	}

	get allParsableInlines(): MfMInlineParser<any, any, any>[] {
		return [
			this.StrongEmphasis,
			this.Emphasis,
		]
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

