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

import { Element, Parser } from "../element/Element"
import { TextRange } from "../mbuffer/TextRange"

export type LineId    = `line-${string}`
export type ElementId = `elem-${string}`

export class IdGenerator {
	private current = 0

	nextId(): ElementId {
		return `elem-${this.nextPureId()}`
	}

	nextLineId(): LineId {
		return `line-${this.nextPureId()}`
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

export abstract class MfMParser<
	TYPE extends string,
	ELEMENT extends Element<TYPE, ELEMENT>,
> implements Parser<TYPE, ELEMENT> {
	constructor(protected readonly idGenerator: IdGenerator) {}

	abstract parse(text: TextRange): Element<TYPE, ELEMENT> | null;
}