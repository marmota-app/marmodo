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
import { TextRange } from "../mbuffer/TextRange";
import { MfMParser } from "./MfMParser";

export class MfMParagraph implements Paragraph {
	public readonly type = 'Paragraph'

	constructor(
		public readonly id: string,
		public readonly parsedRange: TextRange,
		public readonly parsedWith: ParagraphParser,
		public readonly content: AnyInline[],
	) {}

	asText(): string {
		return this.content
			.map(c => c.asText())
			.join('')
	}
}
export class ParagraphParser extends MfMParser<'Paragraph', Paragraph> {
	parse(text: TextRange): Paragraph | null {
		const content: AnyInline[] = []

		const textElement = this.parsers.Text.parse(text)
		if(textElement != null) { content.push(textElement) }

		return new MfMParagraph(this.idGenerator.nextId(), text, this, content)
	}
}