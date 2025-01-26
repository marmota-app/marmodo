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
