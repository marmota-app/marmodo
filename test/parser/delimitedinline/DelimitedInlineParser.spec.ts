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
import { expectUpdate } from "../../update/expectUpdate";

interface Inline {
	type: string,
	delimiter: string,
	innerDelimiter: string,
	wrongEnd: string,
	wrongDelimiter: string,
}
type Inlines = { [key: string]: Inline }
const inlines: Inlines = {
	'StrongEmphasis (**)': { type: 'StrongEmphasis', delimiter: '**', innerDelimiter: '_', wrongEnd: '__', wrongDelimiter: '_' },
	'StrongEmphasis (__)': { type: 'StrongEmphasis', delimiter: '__', innerDelimiter: '*', wrongEnd: '**', wrongDelimiter: '*' },
	'Emphasis (*)': { type: 'Emphasis', delimiter: '*', innerDelimiter: '__', wrongEnd: '_', wrongDelimiter: '`' },
	'Emphasis (_)': { type: 'Emphasis', delimiter: '_', innerDelimiter: '**', wrongEnd: '*', wrongDelimiter: '`' },
}

Object.keys(inlines).forEach(k => describe(k, () => {
	const { type, delimiter, innerDelimiter, wrongEnd, wrongDelimiter } = inlines[k]
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
			const text = `${wrongDelimiter}some text${wrongDelimiter}`
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

		it(`parses ${innerDelimiter} inside (${type}: ${delimiter})`, () => {
			const text = `${delimiter}some ${innerDelimiter}inner${innerDelimiter} text${delimiter}`
			const result = parseAll(type, text)

			expect(result).toHaveProperty('delimiter', delimiter)
			expect(result).toHaveChildren([
				{ type: 'Text', textContent: 'some ' },
				{ delimiter: innerDelimiter, asText: `${innerDelimiter}inner${innerDelimiter}`},
				{ type: 'Text', textContent: ' text' },
			])
		})
		it(`parses ${innerDelimiter} directly inside (${type}: ${delimiter})`, () => {
			const text = `${delimiter}${innerDelimiter}some inner text${innerDelimiter}${delimiter}`
			const result = parseAll(type, text)

			expect(result).toHaveProperty('delimiter', delimiter)
			expect(result).toHaveChildren([
				{ delimiter: innerDelimiter, asText: `${innerDelimiter}some inner text${innerDelimiter}`},
			])
		})
	})

	describe('parsing updates', () => {
		const parser = (new Parsers() as any)[type]

		expectUpdate(
			parser,
			`${delimiter}some text${delimiter}`,
			{ text: 'more ', rangeOffset: `${delimiter}some `.length, rangeLength: 0 }
		).canBeParsed('inserting plain text')
		expectUpdate(
			parser,
			`${delimiter}some text${delimiter}`,
			{ text: '', rangeOffset: delimiter.length, rangeLength: `some `.length }
		).canBeParsed('deleting plain text')

		expectUpdate(
			parser,
			`${delimiter}some text${delimiter}`,
			{ text: '', rangeOffset: 0, rangeLength: delimiter.length }
		).cannotBeParsed('deleting the starting delimiter')
		expectUpdate(
			parser,
			`${delimiter}some text${delimiter}`,
			{ text: '', rangeOffset: `${delimiter}some text`.length, rangeLength: delimiter.length }
		).cannotBeParsed('deleting the ending delimiter')
		expectUpdate(
			parser,
			`${delimiter}some text${delimiter}`,
			{ text: `${wrongEnd}some text${wrongEnd}`, rangeOffset: 0, rangeLength: `${delimiter}some text${delimiter}`.length }
		).cannotBeParsed('changing the delimiter')
	})
}))

describe('DelimitedInline (general)', () => {
	it('only consumes the delimiter when parsing longer delimiters', () => {
		const text = `***some text***`
		const result = parseAll('StrongEmphasis', text)

		expect(result).toHaveProperty('delimiter', '**')
		expect(result).toHaveProperty('asText', `***some text***`)
		expect(result).toHaveChildren([
			{ type: 'Emphasis', asText: '*some text*' },
		])
	})
	it('does not nest emphasis when the closing delimiter is too short', () => {
		const text = `***some text**`
		const result = parseAll('StrongEmphasis', text)

		expect(result).toHaveProperty('delimiter', '**')
		expect(result).toHaveProperty('asText', `***some text**`)
		expect(result).toHaveChildren([
			{ type: 'Text', textContent: '*some text' },
		])
	})
	it('lets other parser take over when the next possible parser did not successfully parse the content', () => {
		const text = `***some text*`
		const tc = new TextContent(text)
		const result = new Parsers().parseInlines(tc.start(), tc.end(), tc.end())

		expect(result.length).toEqual(1)
		expect(result[0]).toHaveProperty('type', 'Emphasis')
		expect(result[0]).toHaveProperty('asText', text)

		expect(result[0].content).toHaveLength(1)
		expect(result[0].content[0]).toHaveProperty('type', 'Text')
		expect(result[0].content[0]).toHaveProperty('textContent', '**some text')
	})
})
