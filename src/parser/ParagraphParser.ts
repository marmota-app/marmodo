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

import { AnyInline, Paragraph } from "../element/MfMElements";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { MfMParser } from "./MfMParser";

export class MfMParagraph implements Paragraph {
	public readonly type = 'Paragraph'

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: ParagraphParser,
		public readonly content: AnyInline[],
	) {}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class ParagraphParser extends MfMParser<'Paragraph', AnyInline, Paragraph> {
	parse(start: TextLocation, end: TextLocation): Paragraph | null {
		const content: AnyInline[] = []

		let nextNewline = start.findNext(['\r', '\n'], end)
		while(nextNewline != null) {
			//If it is '\r', try to skip a following '\n'
			if(nextNewline.start.get() === '\r' && nextNewline.end.get() === '\n') {
				nextNewline.end.advance()
			}
			
			//Try to parse a blank line here...
			const nextParseLocation = nextNewline.end
			const blankLine = this.parsers.BlankLine.parse(nextParseLocation, end)

			if(blankLine !== null) {
				const textElement = this.parsers.Text.parse(start, nextNewline.end)
				if(textElement != null) { content.push(textElement) }
				content.push(blankLine)

				return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(blankLine.parsedRange.end), this, content)
			}
			nextNewline = nextParseLocation.findNext(['\r', '\n'], end)
		}

		const textElement = this.parsers.Text.parse(start, end)
		if(textElement != null) { content.push(textElement) }

		return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, content)
	}
}