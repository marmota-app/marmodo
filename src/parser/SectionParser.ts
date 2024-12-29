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

import { ElementOptions } from "../element/Element";
import { EMPTY_OPTIONS, MfMElement } from "../element/MfMElement";
import { AnyBlock, Heading, Section } from "../element/MfMElements";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { finiteLoop } from "../utilities/finiteLoop";
import { MfMParser } from "./MfMParser";

export class MfMSection extends MfMElement<'Section', AnyBlock, Section, SectionParser> {
	public readonly type = 'Section'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: SectionParser,
		public readonly level: number,
		content: AnyBlock[],
	) {
		super(id, parsedRange, parsedWith, content)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}

	override get options(): ElementOptions {
		if(this.content.length > 0) {
			if(this.content[0].type==='Heading') {
				return this.content[0].options
			}
		}
		return EMPTY_OPTIONS
	}
}

export class SectionParser extends MfMParser<'Section', AnyBlock, Section> {
	readonly type = 'Section'
	
	parse(start: TextLocation, end: TextLocation): Section | null {
		const [sectionLevel, content, parsedEnd] = this.#parseSectionContent(start, end)
		
		return new MfMSection(this.idGenerator.nextId(), start.persistentRangeUntil(parsedEnd), this, sectionLevel, content)
	}

	#parseSectionContent(start: TextLocation, end: TextLocation): [number, AnyBlock[], TextLocation] {
		const content: AnyBlock[] = []
		let sectionLevel = 1
		
		//TODO horizontal rules also start sections. also, if a horizontal
		//     rule is immediately followed by a heading of the same level,
		//     the heading does NOTcreate a section
		let nextParseLocation = start
		const fl = finiteLoop(() => [ nextParseLocation.info() ])
		while(nextParseLocation.isBefore(end)) {
			fl.ensure()
			let elementParsed = false

			for(let parser of this.parsers.allBlocks) {
				const parsedElement = parser.parse(nextParseLocation, end)
				if(parsedElement) {
					if(parsedElement.type === 'Heading') {
						const heading = parsedElement as Heading

						if(content.length === 0) {
							sectionLevel = heading.level
							content.push(parsedElement)
							nextParseLocation = parsedElement.parsedRange.end
							elementParsed = true
							break
						} else if(heading.level <= sectionLevel) {
							return [sectionLevel, content, nextParseLocation]
						} else {
							const innerSection = this.parsers.Section.parse(nextParseLocation, end)
							if(innerSection) {
								content.push(innerSection)
								nextParseLocation = innerSection.parsedRange.end
								elementParsed = true
								break
							}
						}
					} else {
						content.push(parsedElement)
						nextParseLocation = parsedElement.parsedRange.end
						elementParsed = true
						break
					}
				}
			}
			if(!elementParsed) {
				throw new Error(`could not parse content at ${nextParseLocation.info()}`)
			}
		}

		return [ sectionLevel, content, nextParseLocation ]
	}

	acceptUpdate(original: Section, updated: Section): boolean {
		return updated.level===original.level && super.acceptUpdate(original, updated)
	}
}
