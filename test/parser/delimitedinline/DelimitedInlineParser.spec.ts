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

import { TextContent } from "../../../src/mbuffer";
import { Parsers } from "../../../src/parser/Parsers";
import { parseAll } from "../../parse";

interface Inline {
	type: string,
	delimiter: string,
	innerDelimiter: string,
	wrongEnd: string,
}
type Inlines = { [key: string]: Inline }
const inlines: Inlines = {
	'StrongEmphasis (**)': { type: 'StrongEmphasis', delimiter: '**', innerDelimiter: '*', wrongEnd: '__', },
	'StrongEmphasis (__)': { type: 'StrongEmphasis', delimiter: '__', innerDelimiter: '_', wrongEnd: '**', },
}

Object.keys(inlines).forEach(k => describe(k, () => {
	const { type, delimiter, innerDelimiter, wrongEnd } = inlines[k]
	describe('parsing the content', () => {
		it(`parses complete text as inline (${type}: ${delimiter})`, () => {
			const text = `${delimiter}some text${delimiter}`
			const result = parseAll(type, text)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', type)
			expect(result).toHaveProperty('asText', text)
		})
		it(`parses the inner text content correctly (${type}: ${delimiter})`, () => {
			const text = `${delimiter}some text${delimiter}`
			const result = parseAll(type, text)

			expect(result).toHaveProperty('delimiter', delimiter)
			expect(result).toHaveChildren([
				{ type: 'Text', textContent: 'some text' },
			])
		})
		it(`does not find inline with wrong end (${type}: ${delimiter})`, () => {
			const text = `${delimiter}some text${wrongEnd}`
			const result = parseAll(type, text)

			expect(result).toBeNull()
		})
		it(`does not find inline with wrong delimiter (${type}: ${delimiter})`, () => {
			const text = `${innerDelimiter}some text${innerDelimiter}`
			const result = parseAll(type, text)

			expect(result).toBeNull()
		})
		it(`does not find inline when it's not at the start (${type}: ${delimiter})`, () => {
			const text = `some more text ${delimiter}some text${delimiter}`
			const result = parseAll(type, text)

			expect(result).toBeNull()
		})

		it(`finds index of next occurence (${type}: ${delimiter})`, () => {
			const text = `text ${innerDelimiter} before ${delimiter}some text${delimiter}`
			const tc = new TextContent(text)

			const nextStart = (new Parsers() as any)[type].nextPossibleStart(tc.start(), tc.end())

			expect(nextStart.index).toEqual(`text ${innerDelimiter} before `.length)
		})
	})
}))
