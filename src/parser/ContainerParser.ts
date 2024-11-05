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

import { AnyBlock, Container } from "../element/MfMElements"
import { TextRange, Range, } from "../mbuffer/TextRange"
import { MfMParser } from "./MfMParser"

export class MfMContainer implements Container {
	public readonly type = 'Container'

	constructor(
		public readonly id: string,
		public readonly parsedRange: TextRange,
		public readonly parsedWith: ContainerParser,
		public readonly content: AnyBlock[],
	) {}

	asText(): string {
		return this.content
			.map(c => c.asText())
			.join('')
	}
}
export class ContainerParser extends MfMParser<'Container', AnyBlock, Container> {
	parse(text: Range): Container | null {
		const content: AnyBlock[] = []

		const section = this.parsers.Section.parse(text)
		if(section) { content.push(section) }
		
		return new MfMContainer(this.idGenerator.nextId(), text.fullTextRange(), this, content)
	}
}