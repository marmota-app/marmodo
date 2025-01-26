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

import { AnyInline, ContainerInline, Element, ElementOptions } from "../../element"
import { EMPTY_OPTIONS, MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMInlineParser, MfMParser } from "../MfMParser"
import { findNextDelimiterRun } from "./DelimiterRun"

export abstract class DelimitedMfMElement<
	TYPE extends string,
	ELEMENT extends DelimitedMfMElement<TYPE, ELEMENT, PARSER>,
	PARSER extends DelimitedInlineParser<TYPE, ELEMENT, PARSER>,
> extends MfMElement<TYPE, AnyInline, ELEMENT, PARSER> {
	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: PARSER,
		public readonly delimiter: string,
		content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith, content)
	}

	get asText(): string {
		return this.delimiter +
			this.content.map(c => c.asText).join('') +
			this.delimiter
	}

	get plainContent() {
		return this.content.map(c => c.plainContent).join('')
	}

	override get options(): ElementOptions {
		if(this.content.length > 0 && this.content[0].type==='Options') {
			return this.content[0]
		}
		return EMPTY_OPTIONS
	}
}

export abstract class DelimitedInlineParser<
	TYPE extends string,
	ELEMENT extends ContainerInline<TYPE, ELEMENT>,
	PARSER extends DelimitedInlineParser<TYPE, ELEMENT, PARSER>,
> extends MfMInlineParser<TYPE, AnyInline, ELEMENT> {
	abstract readonly type: TYPE
	abstract readonly ElementClass: new (
		id: string,
		parsedRange: PersistentRange,
		parsedWith: PARSER,
		delimiter: string,
		content: AnyInline[],
	) => ELEMENT
	abstract readonly self: PARSER
	abstract readonly delimiters: string[]
	abstract readonly delimiterLength: number

	parse(start: TextLocation, end: TextLocation): ELEMENT | null {
		const startDelimiter = findNextDelimiterRun(this.delimiters, start, end, {
			minLength: this.delimiterLength,
			maxStartIndex: 0,
			leftFlanking: true,
		})

		if(startDelimiter != null) {
			const contentStart = startDelimiter[0].accessor()
			for(let i=0; i<this.delimiterLength; i++) { contentStart.advance() }

			const endDelimiter = findNextDelimiterRun([ startDelimiter[2].delimiterChar ], contentStart, end, {
				rightFlanking: true,
				minLength: this.delimiterLength,
			})

			if(endDelimiter != null) {
				const contentEnd = endDelimiter[0]

				//This delimited inline could be part of a longer delimiter run.
				//So, maxDelimiterEnd marks the last position in the delimiter
				//run that could end this element.
				//Inner elements could - but don't necessarily have to - reach
				//up to that max delimiter end, so we parse until there.
				const maxDelimiterEnd = endDelimiter[1].accessor()
				for(let i=0; i<this.delimiterLength; i++) { maxDelimiterEnd.backoff() }

				//The real end of the content is the last position of the
				//parsed content. And the real delimiter end is then delimiterLength
				//after that (this is guaranteed to be within the ending
				//delimiter run).
				const content: AnyInline[] = []
				let innerContentStart = contentStart
				if(contentStart.get() === '{') {
					const options = this.parsers.Options.parse(contentStart, contentEnd)
					if(options != null) {
						content.push(options)
						innerContentStart = options.parsedRange.end.accessor()
					}
				}
				const innerContent = this.parsers.parseInlines(innerContentStart, contentEnd, maxDelimiterEnd)
				content.push(...innerContent)

				const parsedContentEnd = content[content.length-1].parsedRange.end
				const parsedDelimiterEnd = parsedContentEnd.accessor()
				for(let i=0; i<this.delimiterLength; i++) { parsedDelimiterEnd.advance() }

				return new this.ElementClass(
					this.idGenerator.nextId(),
					start.persistentRangeUntil(parsedDelimiterEnd),
					this.self,
					startDelimiter[0].stringUntil(contentStart),
					content
				)
			}
		}

		return null
	}

	nextPossibleStart(start: TextLocation, end: TextLocation): TextLocation | null {
		const possibleStart = findNextDelimiterRun(this.delimiters, start, end, {
			minLength: this.delimiterLength,
			leftFlanking: true,
		})

		return possibleStart?.[0] ?? null
	}
}
