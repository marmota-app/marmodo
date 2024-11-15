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

import { Element, Parser } from '../element/Element'
import { BlankLineParser } from './BlankLineParser'
import { ContainerParser } from './ContainerParser'
import { ParagraphParser } from './ParagraphParser'
import { SectionParser } from './SectionParser'
import { TextParser } from './TextParser'

export class Parsers {
	private knownParsers: { [key: string]: Parser<any, any, any> } = {}
	private idGenerator = new IdGenerator()

	get Container(): ContainerParser { return this.getParser('Container', () => new ContainerParser(this.idGenerator, this)) }
	get Section(): SectionParser { return this.getParser('Section', () => new SectionParser(this.idGenerator, this)) }

	get Paragraph(): ParagraphParser { return this.getParser('Paragraph', () => new ParagraphParser(this.idGenerator, this)) }

	get Text(): TextParser { return this.getParser('Text', () => new TextParser(this.idGenerator, this)) }
	get BlankLine(): BlankLineParser { return this.getParser('BlankLine', () => new BlankLineParser(this.idGenerator, this)) }

	private getParser<
		TYPE extends string,
		PARSER extends Parser<TYPE, any, any>
	>(
		elementType: TYPE,
		createElementParser: () => PARSER
	): PARSER {
		if(this.knownParsers[elementType] == null) {
			this.knownParsers[elementType] = createElementParser()
		}
		return this.knownParsers[elementType] as PARSER
	}
}

export class IdGenerator {
	private current = 0

	nextId(): ElementId {
		return `elem-${this.nextPureId()}`
	}

	nextLineId(): LineId {
		return `line-${this.nextPureId()}`
	}

	nextTaggedId(tag: string): string {
		return `${tag}-${this.nextPureId()}`
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

export type LineId    = `line-${string}`
export type ElementId = `elem-${string}`

