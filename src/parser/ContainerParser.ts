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

import { ElementOptions } from "../element/Element"
import { MfMElement } from "../element/MfMElement"
import { AnyBlock, Container } from "../element/MfMElements"
import { TextLocation } from "../mbuffer/TextLocation"
import { PersistentRange, TextRange, } from "../mbuffer/TextRange"
import { MfMParser } from "./MfMParser"

export class MfMContainer extends MfMElement<'Container', AnyBlock, Container, ContainerParser> {
	public readonly type = 'Container'

	constructor(
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: ContainerParser,
		public readonly content: AnyBlock[],
	) {
		super(id, options, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class ContainerParser extends MfMParser<'Container', AnyBlock, Container> {
	parse(start: TextLocation, end: TextLocation): Container | null {
		const content: AnyBlock[] = []
		const options: ElementOptions = {}

		const section = this.parsers.Section.parse(start, end)
		if(section) { content.push(section) }
		
		return new MfMContainer(this.idGenerator.nextId(), options, start.persistentRangeUntil(end), this, content)
	}
}