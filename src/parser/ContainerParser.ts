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

import { MfMElement } from "../element/MfMElement"
import { AnyBlock, Container } from "../element/MfMElements"
import { TextLocation } from "../mbuffer/TextLocation"
import { PersistentRange } from "../mbuffer/TextRange"
import { finiteLoop } from "../utilities/finiteLoop"
import { MfMParser } from "./MfMParser"

export class MfMContainer extends MfMElement<'Container', AnyBlock, Container, ContainerParser> {
	public readonly type = 'Container'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: ContainerParser,
		public readonly content: AnyBlock[],
	) {
		super(id, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class ContainerParser extends MfMParser<'Container', AnyBlock, Container> {
	readonly type = 'Container'
	
	parse(start: TextLocation, end: TextLocation): Container | null {
		const content: AnyBlock[] = []
		let nextParseLocation = start

		const loop = finiteLoop(() => [ nextParseLocation.info() ])
		while(nextParseLocation.isBefore(end)) {
			loop.ensure()
			const section = this.parsers.Section.parse(nextParseLocation, end)
			if(section == null) {
				throw new Error(`Could not parse section at location ${nextParseLocation.info()}`)
			}
			content.push(section)
			nextParseLocation = section.parsedRange.end
		}
		
		return new MfMContainer(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, content)
	}
}