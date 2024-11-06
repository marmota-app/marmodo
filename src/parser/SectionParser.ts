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

import { AnyBlock, Section } from "../element/MfMElements";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { finiteLoop } from "../utilities/finiteLoop";
import { MfMParser } from "./MfMParser";

export class MfMSection implements Section {
	public readonly type = 'Section'

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: SectionParser,
		public readonly content: AnyBlock[],
	) {}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}

export class SectionParser extends MfMParser<'Section', AnyBlock, Section> {
	parse(start: TextLocation, end: TextLocation): Section | null {
		const content: AnyBlock[] = []
		
		let nextParseLocation = start
		const fl = finiteLoop(() => [ nextParseLocation ])
		while(nextParseLocation.isBefore(end)) {
			fl.ensure()
			const paragraph = this.parsers.Paragraph.parse(nextParseLocation, end)
			if(paragraph) {
				content.push(paragraph)
				nextParseLocation = paragraph.parsedRange.end
			} else {
				throw new Error(`could not parse content at ${nextParseLocation.info()}`)
			}
		}
		
		return new MfMSection(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, content)
	}
}
