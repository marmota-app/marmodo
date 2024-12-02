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

import { AnyInline, BlankLine, ElementOptions, Heading, HeadingContent, UpdateCheckResult } from "../element"
import { MfMElement } from "../element/MfMElement"
import { UpdateInfo } from "../mbuffer"
import { TextLocation } from "../mbuffer/TextLocation"
import { PersistentRange } from "../mbuffer/TextRange"
import { finiteLoop } from "../utilities/finiteLoop"
import { MfMParser } from "./MfMParser"

export class MfMHeading extends MfMElement<'Heading', HeadingContent | BlankLine, Heading, HeadingParser> {
	public readonly type = 'Heading'

	constructor(
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: HeadingParser,
		public readonly content: (HeadingContent | BlankLine)[],
		private headingIdentifier: string,
		private headingSpacing: string,
	) {
		super(id, options, parsedRange, parsedWith)
	}

	get level(): number {
		return this.headingIdentifier.length
	}

	get asText(): string {
		return this.headingIdentifier + this.headingSpacing + this.content
			.map(c => c.asText)
			.join('')
	}
}

export class HeadingParser extends MfMParser<'Heading', HeadingContent | BlankLine, Heading> {
	readonly type = 'Heading'

	parse(start: TextLocation, textEnd: TextLocation): Heading | null {
		let end = textEnd
		const nextNewline = start.findNextNewline(end)

		let headingIdentifier = ''
		let cur = start.accessor()
		const loop = finiteLoop(() => [ cur.info() ])
		while(cur.isBefore(end) && cur.get()==='#') {
			loop.ensure()
			headingIdentifier += '#'
			cur.advance()
		}
		if(headingIdentifier.length === 0 || headingIdentifier.length > 6) { return null }

		let headingSpacing = ''
		while(cur.isBefore(end) && cur.isWhitespace()) {
			loop.ensure()
			headingSpacing += cur.get()
			cur.advance()
			if(nextNewline != null && cur.isEqualTo(nextNewline?.start)) {
				headingSpacing += nextNewline.asString()
				cur = nextNewline.end
				end = nextNewline.end
				break;
			}
		}
		if(headingSpacing.length === 0) {
			//Empty headings without a space are an important legacy feature:
			//In older versions of marmota.app, this was the only way to
			//reliably insert a section break, so that might be used in
			//documents.
			const isAtEnd = () => cur.isEqualTo(end)
			const isNewLine = () => cur.get()==='\r' || cur.get()==='\n'
			if(!isAtEnd() && !isNewLine()) {
				return null
			}
		}

		const headingContent: (HeadingContent | BlankLine)[] = []

		if(cur.isBefore(end)) {
			const content = this.parsers['HeadingContent'].parse(cur, end)
			if(content) {
				headingContent.push(content)
				end = content.parsedRange.end
			}
		}

		end = this.addBlankLinesTo(headingContent, end, textEnd)

		return new MfMHeading(
			this.idGenerator.nextId(),
			{},
			start.persistentRangeUntil(end),
			this,
			headingContent,
			headingIdentifier,
			headingSpacing,
		)
	}

	override checkUpdate(element: Heading, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		return this.checkUpdateDoesNotChangeNewlines(element, update)
	}
	override acceptUpdate(original: Heading, updated: Heading): boolean {
		return updated.level === original.level
	}
}

export class MfMHeadingContent extends MfMElement<'HeadingContent', AnyInline, HeadingContent, HeadingContentParser> {
	public readonly type = 'HeadingContent'

	constructor(
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: HeadingContentParser,
		public readonly content: AnyInline[],
	) {
		super(id, options, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class HeadingContentParser extends MfMParser<'HeadingContent', AnyInline, HeadingContent> {
	readonly type = 'HeadingContent'
	
	parse(start: TextLocation, end: TextLocation): HeadingContent | null {
		const nextNewline = start.findNextNewline(end)

		const parseEnd = nextNewline?.end ?? end
		const content: AnyInline[] = []
		const text = this.parsers['Text'].parse(start, parseEnd)
		if(text) {
			content.push(text)
		}

		return new MfMHeadingContent(
			this.idGenerator.nextId(),
			{},
			start.persistentRangeUntil(parseEnd),
			this,
			content
		)
	}

	override checkUpdate(element: HeadingContent, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		return this.checkUpdateDoesNotChangeNewlines(element, update)
	}
}
