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

import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"
import { expectUpdate } from "../../update/expectUpdate"

describe('TableColumnParser', () => {
	describe('parsing the content', () => {
		it('parses simple text as table column', () => {
			const result = parseAll('TableColumn', ' \tsome text  \t ')
			expect(result).toHaveProperty('asText', ' \tsome text  \t ')
		})
		it('parses simple text as table column: inner text', () => {
			const result = parseAll('TableColumn', ' \tsome text  \t ')
	
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Text')
			expect(result?.content[0]).toHaveProperty('textContent', ' \tsome text  \t ')
		})
		it('parses inline content as table column', () => {
			const result = parseAll('TableColumn', ' \tsome **bold** _text_  \t ')
	
			expect(result?.content).toHaveLength(5)
			expect(result?.content[0]).toHaveProperty('type', 'Text')
			expect(result?.content[0]).toHaveProperty('textContent', ' \tsome ')
			expect(result?.content[1]).toHaveProperty('type', 'StrongEmphasis')
			expect(result?.content[1]).toHaveProperty('asText', '**bold**')
			expect(result?.content[2]).toHaveProperty('type', 'Text')
			expect(result?.content[2]).toHaveProperty('textContent', ' ')
			expect(result?.content[3]).toHaveProperty('type', 'Emphasis')
			expect(result?.content[3]).toHaveProperty('asText', '_text_')
			expect(result?.content[4]).toHaveProperty('type', 'Text')
			expect(result?.content[4]).toHaveProperty('textContent', '  \t ')
		})
	
		it('stops parsing at an ending |', () => {
			const result = parseAll('TableColumn', ' \tsome text  \t |more text')
	
			expect(result).toHaveProperty('asText', ' \tsome text  \t ')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Text')
			expect(result?.content[0]).toHaveProperty('textContent', ' \tsome text  \t ')
		})
		it('stops parsing at an ending newline', () => {
			const result = parseAll('TableColumn', ' \tsome text  \t \nmore text')
	
			expect(result).toHaveProperty('asText', ' \tsome text  \t ')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Text')
			expect(result?.content[0]).toHaveProperty('textContent', ' \tsome text  \t ')
		})
		it('includes an opening |', () => {
			const result = parseAll('TableColumn', '| \tsome text  \t |more text')
	
			expect(result).toHaveProperty('asText', '| \tsome text  \t ')
			expect(result?.content).toHaveLength(1)
			expect(result?.content[0]).toHaveProperty('type', 'Text')
			expect(result?.content[0]).toHaveProperty('textContent', ' \tsome text  \t ')
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().TableColumn

		expectUpdate(
			parser,
			'some text',
			{ text: 'more ', rangeOffset: 'some '.length, rangeLength: 0 }
		).canBeParsed()
		expectUpdate(
			parser,
			'| some foo text  \t ',
			{ text: '', rangeOffset: '| some '.length, rangeLength: 'foo '.length }
		).canBeParsed()

		expectUpdate(
			parser,
			'| some text',
			{ text: '', rangeOffset: 0, rangeLength: 2 }
		).cannotBeParsed('removes opening pipe')
		expectUpdate(
			parser,
			'some text',
			{ text: '| ', rangeOffset: 0, rangeLength: 0 }
		).cannotBeParsed('inserts opening pipe')
		expectUpdate(
			parser,
			'some text',
			{ text: '| ', rangeOffset: 'some '.length, rangeLength: 0 }
		).cannotBeParsed('inserts closing pipe')
	})
})
describe('TableRowParser', () => {
	it('parses a single text as a table row with one column', () => {
		const result = parseAll('TableRow', 'some text')

		expect(result).toHaveProperty('asText', 'some text')
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'TableColumn')
	})
	it('stops parsing at a newline', () => {
		const result = parseAll('TableRow', 'some text\nmore text')

		expect(result).toHaveProperty('asText', 'some text\n')
		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'TableColumn')
	})

	it('parses multiple columns', () => {
		const result = parseAll('TableRow', '|one| two | \t three ')

		expect(result).toHaveProperty('asText', '|one| two | \t three ')
		expect(result?.content).toHaveLength(3)
		expect(result?.content[0]).toHaveProperty('type', 'TableColumn')
		expect(result?.content[1]).toHaveProperty('type', 'TableColumn')
		expect(result?.content[2]).toHaveProperty('type', 'TableColumn')
	})

	it('parses multiple columns with colsing pipe', () => {
		const result = parseAll('TableRow', '|one| two | \t three |')

		expect(result).toHaveProperty('asText', '|one| two | \t three |')
		expect(result?.content).toHaveLength(3)
	})
	it('parses multiple columns with colsing pipe and whitespace', () => {
		const result = parseAll('TableRow', '|one| two | \t three | \t ')

		expect(result).toHaveProperty('asText', '|one| two | \t three | \t ')
		expect(result?.content).toHaveLength(4)
	})
	it('parses multiple columns with colsing pipe and options', () => {
		const result = parseAll('TableRow', '|one| two | \t three |{ val0; key1=val1 } \t ')

		expect(result).toHaveProperty('asText', '|one| two | \t three |{ val0; key1=val1 } \t ')
		expect(result?.content).toHaveLength(4)

		expect(result?.content[3]).toHaveProperty('type', 'Options')
		expect(result?.content[3]).toHaveProperty('keys', ['default', 'key1'])
	})

	it('parses multiple columns with colsing pipe and incomplete options', () => {
		const result = parseAll('TableRow', '|one| two | \t three |{ val0; key1=val1  \t ')

		expect(result).toHaveProperty('asText', '|one| two | \t three |{ val0; key1=val1  \t ')
		expect(result?.content).toHaveLength(4)

		expect(result?.content[3]).toHaveProperty('type', 'Text')
		expect(result?.content[3]).toHaveProperty('textContent', '{ val0; key1=val1  \t ')
	})

	it('does not return a table row with no columns and no other content', () => {
		const result = parseAll('TableRow', '\n')
		expect(result).toBeNull()
	})
	it('returns a table row that only contains a row ending', () => {
		const result = parseAll('TableRow', '|\n')
		expect(result).not.toBeNull()
	})
})
