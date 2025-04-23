/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { AnyInline, BlankLine, ElementOptions, Heading, HeadingContent, Options, ParsingContext, UpdateCheckResult } from "../element"
import { EMPTY_OPTIONS, MfMElement } from "../element/MfMElement"
import { UpdateInfo } from "../mbuffer"
import { TextLocation } from "../mbuffer/TextLocation"
import { PersistentRange } from "../mbuffer/TextRange"
import { finiteLoop } from "../utilities/finiteLoop"
import { MfMParser } from "./MfMParser"

export class MfMHeading extends MfMElement<'Heading', HeadingContent | BlankLine | Options, Heading, HeadingParser> {
	public readonly type = 'Heading'

	constructor(
		id: string,
		parsedRange: PersistentRange,
		parsedWith: HeadingParser,
		content: (HeadingContent | BlankLine | Options)[],
		private headingIdentifier: string,
		private headingSpacing: string,
		parsingContext: ParsingContext,
	) {
		super(id, parsedRange, parsedWith, content, parsingContext)
	}

	get level(): number {
		return this.headingIdentifier.length
	}

	get asText(): string {
		if(this.content.length>0 && this.content[0].type==='Options') {
			return this.headingIdentifier + this.content[0].asText + this.headingSpacing + this.content
				.filter((_, i) => i>0)
				.map(c => c.asText)
				.join('')
		}
		return this.headingIdentifier + this.headingSpacing + this.content
			.map(c => c.asText)
			.join('')
	}

	override get options(): ElementOptions {
		if(this.content.length>0 && this.content[0].type==='Options') {
			return this.content[0]
		}
		return EMPTY_OPTIONS
	}

	override get referenceMap(): { [key: string]: string | number | null; } {
		return {
			...super.referenceMap,
			'heading.level': this.level,
		}
	}
}

export class HeadingParser extends MfMParser<'Heading', HeadingContent | BlankLine | Options, Heading> {
	readonly type = 'Heading'

	parse(start: TextLocation, textEnd: TextLocation, context: ParsingContext): Heading | null {
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

		const headingContent: (HeadingContent | BlankLine | Options)[] = []
		let hasCurlyBracket = cur.isBefore(end) && cur.get() === '{'
		if(hasCurlyBracket) {
			const options = this.parsers.Options.parse(cur, end, context)
			if(options != null) {
				headingContent.push(options)
				cur = options.parsedRange.end.accessor()
			}
		}

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
		//If there is a curly bracket after the heading identifier, we don't
		//necessarily need whitespace here.
		if(!hasCurlyBracket && headingSpacing.length === 0) {
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

		if(cur.isBefore(end)) {
			const content = this.parsers['HeadingContent'].parse(cur, end, context)
			if(content) {
				headingContent.push(content)
				end = content.parsedRange.end
			}
		}

		end = this.addBlankLinesTo(headingContent, end, textEnd)

		return new MfMHeading(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(end),
			this,
			headingContent,
			headingIdentifier,
			headingSpacing,
			context,
		)
	}

	override checkUpdate(element: Heading, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		return this.checkUpdateDoesNotChangeNewlines(element, update)
	}
	override acceptUpdate(original: Heading, updated: Heading): boolean {
		return updated.level === original.level
	}

	override startsBlockAtStartOfRange(start: TextLocation, end: TextLocation): boolean {
		if(start.startsWith('#', end)) {
			return this.parse(start, end, {}) != null
		}
		return false
	}
}

export class MfMHeadingContent extends MfMElement<'HeadingContent', AnyInline, HeadingContent, HeadingContentParser> implements HeadingContent {
	public readonly type = 'HeadingContent'

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}

	get plainContent() {
		return this.content.map(c => c.plainContent).join('')
	}
}
export class HeadingContentParser extends MfMParser<'HeadingContent', AnyInline, HeadingContent> {
	readonly type = 'HeadingContent'
	
	parse(start: TextLocation, end: TextLocation, context: ParsingContext): HeadingContent | null {
		const nextNewline = start.findNextNewline(end)

		const parseEnd = nextNewline?.end ?? end
		const content: AnyInline[] = []
		const text = this.parsers['Text'].parse(start, parseEnd, context)
		if(text) {
			content.push(text)
		}

		return new MfMHeadingContent(
			this.idGenerator.nextId(),
			start.persistentRangeUntil(parseEnd),
			this,
			content,
			context,
		)
	}

	override checkUpdate(element: HeadingContent, update: UpdateInfo, documentEnd: TextLocation): UpdateCheckResult {
		return this.checkUpdateDoesNotChangeNewlines(element, update)
	}
}
