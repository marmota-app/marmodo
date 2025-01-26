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

import { ElementOptions, UpdateCheckResult } from "../element/Element";
import { EMPTY_OPTIONS, MfMElement } from "../element/MfMElement";
import { AnyInline, Paragraph } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, TextRange, } from "../mbuffer/TextRange";
import { andFalse, MfMParser } from "./MfMParser";

export class MfMParagraph extends MfMElement<'Paragraph', AnyInline, Paragraph, ParagraphParser> implements Paragraph {
	public readonly type = 'Paragraph'

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}

	override get options(): ElementOptions {
		if(this.content.length>0 && this.content[0].type==='Options') {
			return this.content[0]
		}
		return EMPTY_OPTIONS
	}

}
export class ParagraphParser extends MfMParser<'Paragraph', AnyInline, Paragraph> {
	readonly type = 'Paragraph'

	parse(start: TextLocation, end: TextLocation): Paragraph | null {
		const content: AnyInline[] = []
		if(start.accessor().get() === '{') {
			const options = this.parsers.Options.parse(start, end)
			if(options != null) {
				content.push(options)
				start = options.parsedRange.end.accessor()
			}
		}

		if(this.lineStartsNewBlock(start, end)) {
			//This cannot be a paragraph when the first line already starts
			//a new block!
			//Also, a situation like this can only occur when parsing an
			//update, where the user changes the first line of the paragraph
			//so that it starts a new block.
			return null
		}

		let nextNewline = start.findNextNewline(end)
		while(nextNewline != null) {
			//Try to parse a blank line here, and also end the paragraph on
			//a new block
			const nextParseLocation = nextNewline.end
			
			if(this.lineStartsNewBlock(nextParseLocation, end)) {
				const completeContent = this.parsers.parseInlines(start, nextNewline!.end, nextNewline!.end)
				content.push(...completeContent)
				return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(nextNewline.end), this, content)
			}

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
		content.push(...completeContent)
		return new MfMParagraph(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, content)
	}
}
