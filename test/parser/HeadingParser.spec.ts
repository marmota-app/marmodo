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

import { Parsers } from "../../src/parser/Parsers"
import { parseAll } from "../parse"
import { expectUpdate } from "../update/expectUpdate"

describe('HeadingParser', () => {
	describe('parsing the content', () => {
		[ '#', '##', '###', '####', '#####', '######'].forEach(hi => {
			it(`parses empty heading ${hi}`, () => {
				const heading = parseAll('Heading', hi)
	
				expect(heading).not.toBeNull()
				expect(heading?.asText).toEqual(hi)
			})

			it(`parses heading level for ${hi}`, () => {
				const heading = parseAll('Heading', hi)
	
				expect(heading).toHaveProperty('level', hi.length)
			})
	
			it('parses heading with text', () => {
				const heading = parseAll('Heading', '# heading text')
	
				expect(heading).not.toBeNull()
				expect(heading?.content).toHaveLength(1)

				expect(heading!.content[0]).toHaveChildren([
					{ type: 'Text', textContent: 'heading text' }
				])
				expect(heading?.asText).toEqual('# heading text')
			})
		})

		it('cannot parse a heading without an identifier', () => {
			const heading = parseAll('Heading', 'some text')
			expect(heading).toBeNull()
		})
		it('cannot parse a heading without 7 #s', () => {
			const heading = parseAll('Heading', '####### some text')
			expect(heading).toBeNull()
		})
		it('cannot parse heading without a space between identifier and text', () => {
			const heading = parseAll('Heading', '###some text')
			expect(heading).toBeNull()
		})

		it('does not continue empty heading text after a newline', () => {
			const heading = parseAll('Heading', '## \t\nmore text')
	
			expect(heading).not.toBeNull()
			expect(heading?.asText).toEqual('## \t\n')
		})
		it('does not continue heading text after a newline', () => {
			const heading = parseAll('Heading', '## \tsome heading\nmore text')
	
			expect(heading).not.toBeNull()
			expect(heading!.content[0]).toHaveChildren([
				{ type: 'Text', textContent: 'some heading\n' }
			])
			expect(heading?.asText).toEqual('## \tsome heading\n')
		})

		it('ends the empty heading at the end of the whitespace', () => {
			const heading = parseAll('Heading', '## \t\nmore text')

			expect(heading!.parsedRange.end).toHaveProperty('index', '## \t\n'.length)
		})
		it('ends the non-empty heading at the end of the whitespace', () => {
			const heading = parseAll('Heading', '## \theading text\nmore text')

			expect(heading!.parsedRange.end).toHaveProperty('index', '## \theading text\n'.length)
		})

		it('adds blank lines after the heading to the heading', () => {
			const heading = parseAll('Heading', '##\n   \n\t\n\nmore text')
			expect(heading).toHaveChildren([
				{},
				{ type: 'BlankLine', textContent: '   \n' },
				{ type: 'BlankLine',textContent: '\t\n' },
				{ type: 'BlankLine', textContent: '\n' }
			])
			expect(heading?.parsedRange.end).toHaveProperty('index', '##\n   \n\t\n\n'.length)
		})
		it('adds blank lines after the heading to the heading', () => {
			const heading = parseAll('Heading', '## \tsome heading\n   \n\t\n\nmore text')
			expect(heading).toHaveChildren([
				{},
				{ type: 'BlankLine', textContent: '   \n' },
				{ type: 'BlankLine',textContent: '\t\n' },
				{ type: 'BlankLine', textContent: '\n' }
			])
			expect(heading?.parsedRange.end).toHaveProperty('index', '## \tsome heading\n   \n\t\n\n'.length)
		})

		it.skip('can parse continued heading text after a newline preceded by double-space', () => {})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Heading

		expectUpdate(
			parser,
			'# some heading\nmore text',
			{ text: '', rangeOffset: '# '.length, rangeLength: 'some '.length }
		).canBeParsed()
		expectUpdate(
			parser,
			'# some heading\nmore text',
			{ text: ' nice', rangeOffset: '# some'.length, rangeLength: 0 }
		).canBeParsed()

		expectUpdate(
			parser,
			'# some heading\nmore text',
			{ text: ' ', rangeOffset: '# some heading'.length, rangeLength: '\n'.length }
		).cannotBeParsed('Removes the ending newline, making the heading longer')
		expectUpdate(
			parser,
			'# some heading\nmore text',
			{ text: '#', rangeOffset: '#'.length, rangeLength: ''.length }
		).cannotBeParsed('Changes the heading level')
		expectUpdate(
			parser,
			'# some heading\nmore text',
			{ text: '', rangeOffset: 0, rangeLength: '# '.length }
		).cannotBeParsed('Removes the heading')
	})
})