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

import { Element, Parser } from "../../src/element/Element"
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
		canBeParsed(reason = '') {
			it(`can parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const updated = parseAndUpdate(parser, originalText, update)

				const expectedTextContent = new TextContent(originalText)
				expectedTextContent.update(update)
				const expectedElement = parser.parse(expectedTextContent.start(), expectedTextContent.end())

				expect(updated).not.toBeNull()
				expect(updated!.parsedRange.asString()).toEqual(expectedElement?.parsedRange.asString())
			})
		},
		cannotBeParsed(reason = '') {
			it(`CANNOT parse update ["${update.text}", ${update.rangeOffset}+${update.rangeLength}] to content "${replaceWhitespace(originalText)}"${reason.length>0? ' - '+reason : ''}`, () => {
				const updated = parseAndUpdate(parser, originalText, update)
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
		canBeParsed(reason = '') {
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
				const expectedElement = parser.parse(expectedTextContent.start(), expectedTextContent.end())

				expect(updated).not.toBeNull()
				expect(updated!.parsedRange.asString()).toEqual(expectedElement?.parsedRange.asString())
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

function parseAndUpdate<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(parser: Parser<TYPE, CONTENT, ELEMENT>, originalText: string, update: ContentUpdate): ELEMENT | null {
	const [text, original] = parse(parser, originalText)
	return updateElement(text, original, update)
}

function parse<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
>(parser: Parser<TYPE, CONTENT, ELEMENT>, originalText: string): [TextContent, ELEMENT] {
	const text = new TextContent(originalText)

	const original = parser.parse(text.start(), text.end())
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
