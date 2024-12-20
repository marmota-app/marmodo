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
import { expectUpdate, expectUpdates } from "../../update/expectUpdate"

describe('TableDelimiterColumn', () => {
	describe('parsing the content', () => {
		it('parses a simple delimiter column', () => {
			const result = parseAll('TableDelimiterColumn', '---')
	
			expect(result).toHaveProperty('asText', '---')
		})
		it('parses a delimiter column including the starting delimiter', () => {
			const result = parseAll('TableDelimiterColumn', '| ---')
	
			expect(result).toHaveProperty('asText', '| ---')
		})
		it('stops parsing at the next |', () => {
			const result = parseAll('TableDelimiterColumn', '| :-: | ---')
	
			expect(result).toHaveProperty('asText', '| :-: ')
		});
		it('stops parsing at the next newline', () => {
			const result = parseAll('TableDelimiterColumn', '| :-: \n ---')
	
			expect(result).toHaveProperty('asText', '| :-: ')
		});
	
		['a', '{', '#', '+'].forEach(ic => it(`does not parse delimiter row that contains illegal character "${ic}"`, () => {
			const result = parseAll('TableDelimiterColumn', `| \t:-${ic}-: | ---`)
			expect(result).toBeNull()
		}))
	
		it('cannot parse a delimiter with whitespace after the first :', () => {
			const result = parseAll('TableDelimiterColumn', '| : -: | ---')
			expect(result).toBeNull()
		})
		it('cannot parse a delimiter with whitespace after the first -', () => {
			const result = parseAll('TableDelimiterColumn', '| - -: | ---')
			expect(result).toBeNull()
		})
		it('cannot parse a delimiter with : after the second :', () => {
			const result = parseAll('TableDelimiterColumn', '| :--:: | ---')
			expect(result).toBeNull()
		})
		it('cannot parse a delimiter with - after the trailing :', () => {
			const result = parseAll('TableDelimiterColumn', '| --:- | ---')
			expect(result).toBeNull()
		})
		it('cannot parse a delimiter without -', () => {
			const result = parseAll('TableDelimiterColumn', '| :: | ---')
			expect(result).toBeNull()
		});
		it('cannot parse a delimiter consisting only of whitespace', () => {
			const result = parseAll('TableDelimiterColumn', '| \t | ---')
			expect(result).toBeNull()
		});
	
		[
			['---', 'left'],
			[':--', 'left'],
			[':-:', 'center'],
			['--:', 'right'],
		].forEach(([col, alignment]) => it(`has alignment value "${alignment}" for column "${col}"`, () => {
			const result = parseAll('TableDelimiterColumn', col)
			expect(result).toHaveProperty('alignment', alignment)
		}))
	})

	describe('parsing updates', () => {
		const parser = new Parsers().TableDelimiterColumn;

		['----', ':--:', '|---', '|---:'].forEach(text => {
			expectUpdate(
				parser,
				text,
				{ text: '-', rangeOffset: 2, rangeLength: 0 }
			).canBeParsed()
			expectUpdate(
				parser,
				text,
				{ text: '', rangeOffset: 2, rangeLength: 1 }
			).canBeParsed()
		})
		expectUpdate(
			parser,
			' --- ',
			{ text: ':', rangeOffset: 1, rangeLength: 0 }
		).canBeParsed('still left-aligned')
		expectUpdate(
			parser,
			' :--- ',
			{ text: '', rangeOffset: 1, rangeLength: 1 }
		).canBeParsed('still left-aligned')

		expectUpdate(
			parser,
			'---',
			{ text: 'a', rangeOffset: 2, rangeLength: 0 }
		).cannotBeParsed('inserts illegal character')
		expectUpdates(
			parser,
			' -- ',
			[
				{ text: '', rangeOffset: 1, rangeLength: 1 },
				{ text: '', rangeOffset: 1, rangeLength: 1 },
			]
		).cannotBeParsed('removes last hyphen')

		expectUpdate(
			parser,
			' --- ',
			{ text: ':', rangeOffset: ' ---'.length, rangeLength: 0 }
		).cannotBeParsed('changes alignment left->right')
		expectUpdate(
			parser,
			' :---: ',
			{ text: '', rangeOffset: ' :---'.length, rangeLength: 1 }
		).cannotBeParsed('changes alignment center->left')
		expectUpdate(
			parser,
			'---',
			{ text: '|', rangeOffset: 0, rangeLength: 0 }
		).cannotBeParsed()
		expectUpdate(
			parser,
			'|---',
			{ text: '', rangeOffset: 0, rangeLength: 1 }
		).cannotBeParsed()
	})
})

describe('TableDelimiterRow', () => {
	describe('parsing the content', () => {
		it('parses a delimter row that ends without a |', () => {
			const result = parseAll('TableDelimiterRow', ':--: | ---')
	
			expect(result).toHaveProperty('asText', ':--: | ---')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('asText', ':--: ')
			expect(result?.content[1]).toHaveProperty('asText', '| ---')
		})
		it('ends parsing at a newline', () => {
			const result = parseAll('TableDelimiterRow', ':--: | ---\nmore content')
	
			expect(result).toHaveProperty('asText', ':--: | ---\n')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('asText', ':--: ')
			expect(result?.content[1]).toHaveProperty('asText', '| ---')
		})
		it('parses a delimter row that ends in a |', () => {
			const result = parseAll('TableDelimiterRow', '| :--: | --- |  \t\nmore content')
	
			expect(result).toHaveProperty('asText', '| :--: | --- |  \t\n')
			expect(result?.content).toHaveLength(2)
			expect(result?.content[0]).toHaveProperty('asText', '| :--: ')
			expect(result?.content[1]).toHaveProperty('asText', '| --- ')
		})
		it('parses a delimter row that ends in a | with options', () => {
			const result = parseAll('TableDelimiterRow', '| :--: | --- |{ val0; key1=val1}  \t\nmore content')
	
			expect(result?.content).toHaveLength(3)
			expect(result?.content[2]).toHaveProperty('type', 'Options')
			expect(result?.content[2]).toHaveProperty('keys', [ 'default', 'key1' ])
		})
		it('parses a delimter row that ends in a | with incomplete options', () => {
			const result = parseAll('TableDelimiterRow', '| :--: | --- |{ val0; key1=val1\nmore content')
	
			expect(result?.content).toHaveLength(3)
			expect(result?.content[2]).toHaveProperty('type', 'Text')
			expect(result?.content[2]).toHaveProperty('textContent', '{ val0; key1=val1')
		})
	
		it('does not parse a delimiter row that contains non-delimiter characters', () => {
			const result = parseAll('TableDelimiterRow', '| :-a-: | --- |  \t\nmore content')
			expect(result).toBeNull()
		})
		it('does not parse a delimiter row that ends in non-whitespace characters after the last |', () => {
			const result = parseAll('TableDelimiterRow', '| :--: | --- |  \ta\nmore content')
			expect(result).toBeNull()
		})
		it('does not parse a delimiter row that ends in non-whitespace characters after the table options', () => {
			const result = parseAll('TableDelimiterRow', '| :--: | --- |{ val0; key1=val1}  \ta\nmore content')
			expect(result).toBeNull()
		})
		it('does not parse delimiter row with no columns', () => {
			const result = parseAll('TableDelimiterRow', '\nmore content')
			expect(result).toBeNull()
		})
	})

	describe('parsing updates', () => {
		// Leaving this empty, for now, since I can't imagine a scenario
		// where it might go wrong. Real-life tests will prove me wrong,
		// I guess :)
	})
})