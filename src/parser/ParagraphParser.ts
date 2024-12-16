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

import { ElementOptions } from "../element/Element";
import { MfMElement } from "../element/MfMElement";
import { AnyInline, Paragraph } from "../element/MfMElements";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { MfMParser } from "./MfMParser";

export class MfMParagraph extends MfMElement<'Paragraph', AnyInline, Paragraph, ParagraphParser> implements Paragraph {
	public readonly type = 'Paragraph'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: ParagraphParser,
		public readonly content: AnyInline[],
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class ParagraphParser extends MfMParser<'Paragraph', AnyInline, Paragraph> {
	readonly type = 'Paragraph'

	parse(start: TextLocation, end: TextLocation): Paragraph | null {
		let nextNewline = start.findNextNewline(end)
		while(nextNewline != null) {
			//Try to parse a blank line here, and also end the paragraph on
			//a new block
			const nextParseLocation = nextNewline.end
			
			if(this.lineStartsNewBlock(nextParseLocation, end)) {
				const completeContent = this.parsers.parseInlines(start, nextNewline!.end, nextNewline!.end)
				return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(nextNewline.end), this, completeContent)
			}

			const content: AnyInline[] = []
			const blankLinesEnd = this.addBlankLinesTo(content, nextParseLocation, end, () => {
				const completeContent = this.parsers.parseInlines(start, nextNewline!.end, nextNewline!.end)
				content.push(...completeContent)
			})
			if(!blankLinesEnd.isEqualTo(nextParseLocation)) {
				return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(blankLinesEnd), this, content)
			}

			nextNewline = nextParseLocation.findNextNewline(end)
		}

		const completeContent = this.parsers.parseInlines(start, end, end)
		return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, completeContent)
	}
}
