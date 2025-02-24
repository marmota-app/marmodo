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

import { SxContext } from "../../src/sx/SxContext"
import { Element, Parser, ParsingContext } from "../../src/element/Element"
import { ContentUpdate } from "../../src/mbuffer/ContentUpdate"
import { TextContent } from "../../src/mbuffer/TextContent"
import { UpdateParser } from "../../src/update/UpdateParser"
import { replaceWhitespace } from "../replaceWhitespace"

const updateParser = new UpdateParser()

export function expectUpdate<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(parser: Parser<TYPE, CONTENT, ELEMENT>, originalText: string, update: ContentUpdate) {
	return {
		canBeParsed(reason = '', assertions: (updated: ELEMENT) => unknown = ()=>{}) {
			it(`can parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const { updated } = parseAndUpdate(parser, originalText, update)

				const expectedTextContent = new TextContent(originalText)
				expectedTextContent.update(update)
				const expectedElement = parser.parse(expectedTextContent.start(), expectedTextContent.end(), {})

				expect(updated).not.toBeNull()
				expect(updated!.parsedRange.asString()).toEqual(expectedElement?.parsedRange.asString())

				assertions(updated!)
			})
		},
		cannotBeParsed(reason = '') {
			it(`CANNOT parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const { updated } = parseAndUpdate(parser, originalText, update)
				expect(updated).toBeNull()
			})
		},
		skip: {
			canBeParsed() {
				it.skip(`can parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"`, () => {})
			},
			cannotBeParsed() {
				it.skip(`CANNOT parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"`, () => {})
			},
		}
	}
}

export function expectUpdates<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(parser: Parser<TYPE, CONTENT, ELEMENT>, originalText: string, updates: ContentUpdate[]) {
	return {
		canBeParsed(reason = '', assertions: (updated: ELEMENT) => unknown = ()=>{}) {
			it(`can parse update [${updates.map(u => `"${u.text}", ${u.rangeOffset}+${u.rangeLength}`).join(', ')}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const [text, original] = parse(parser, originalText)
				const updated = updates.reduce((prev: ELEMENT | null, update) => {
					if(prev != null) {
						return updateElement(text, prev, update)
					}
					return null
				}, original)

				const expectedTextContent = new TextContent(originalText)
				updates.forEach(update => expectedTextContent.update(update))
				const expectedElement = parser.parse(expectedTextContent.start(), expectedTextContent.end(), {})

				expect(updated).not.toBeNull()
				expect(updated!.parsedRange.asString()).toEqual(expectedElement?.parsedRange.asString())

				assertions(updated!)
			})
		},
		cannotBeParsed(reason = '') {
			it(`CANNOT parse update [${updates.map(u => `"${u.text}", ${u.rangeOffset}+${u.rangeLength}`).join(', ')}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const [text, original] = parse(parser, originalText)
				const updated = updates.reduce((prev: ELEMENT | null, update) => {
					if(prev != null) {
						return updateElement(text, prev, update)
					}
					return null
				}, original)

				expect(updated).toBeNull()
			})
		},
		skip: {
			canBeParsed() {
				it.skip(`can parse update [${updates.map(u => `"${u.text}", ${u.rangeOffset}+${u.rangeLength}`).join(', ')}] to content "${replaceWhitespace(originalText)}"`, () => {})
			},
			cannotBeParsed() {
				it.skip(`CANNOT parse update [${updates.map(u => `"${u.text}", ${u.rangeOffset}+${u.rangeLength}`).join(', ')}] to content "${replaceWhitespace(originalText)}"`, () => {})
			},
		}
	}
}

export function parseAndUpdate<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(
	parser: Parser<TYPE, CONTENT, ELEMENT>,
	originalText: string,
	update: ContentUpdate,
	context: ParsingContext = { sxContext: new SxContext(), },
): { original: ELEMENT | null, updated: ELEMENT | null } {
	const [text, original] = parse(parser, originalText, context)
	const updated = updateElement(text, original, update)
	return { original, updated }
}

function parse<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(
	parser: Parser<TYPE, CONTENT, ELEMENT>,
	originalText: string,
	context: ParsingContext = { sxContext: new SxContext(), },
): [TextContent, ELEMENT] {
	const text = new TextContent(originalText)

	const original = parser.parse(text.start(), text.end(), context)
	if(original == null) { throw new Error(`Could not parse string "${originalText}" with parser ${parser}`) }

	return [text, original]
}
function updateElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(text: TextContent, original: ELEMENT, update: ContentUpdate) {
	const ui = text.update(update)
	const updated = updateParser.parseUpdate(ui, original, text.end())

	return updated
}
