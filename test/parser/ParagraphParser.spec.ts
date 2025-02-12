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

import { TextContent } from "../../src/mbuffer";
import { Parsers } from "../../src/parser/Parsers";
import { parseAll } from "../parse";
import { replaceWhitespace } from "../replaceWhitespace";
import { expectUpdate, expectUpdates } from "../update/expectUpdate";

describe('ParagraphParser', () => {
	describe('Parsing the content', () => {
		it('Parses the complete text into a paragraph when it does not contain any newlines', () => {
			const paragraph = parseAll('Paragraph', 'some text')
	
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: 'some text' }
			])
		});
	
		[
			['\n', '\n',],
			['\r\n', '\r\n',],
			['\n', ' \n',],
			['\n', '\t   \t \t\r\n',],
		].forEach(([newLine, blankLine]) => it(`ends the current paragraph at blank line "${replaceWhitespace(blankLine)}"`, () => {
			const paragraph = parseAll('Paragraph', `some text${newLine}${blankLine}more text`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text${newLine}${blankLine}`)
	
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some text${newLine}`},
				{ type: 'BlankLine', textContent: blankLine}
			])
		}))

		it(`ends the current paragraph at blank line after multiple lines`, () => {
			const paragraph = parseAll('Paragraph', `some text\nsome text\nsome text\n\nmore text`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text\nsome text\nsome text\n\n`)
	
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some text\nsome text\nsome text\n` },
				{ type: 'BlankLine', textContent: '\n' }
			])
		})

		it('adds multiple blank lines to the end of the current paragraph', () => {
			const paragraph = parseAll('Paragraph', `some text\nsome text\nsome text\n   \n\t\n\nmore text`)
	
			expect(paragraph).toHaveChildren([
				{},
				{ type: 'BlankLine', textContent: '   \n' },
				{ type: 'BlankLine',textContent: '\t\n' },
				{ type: 'BlankLine', textContent: '\n' }
			])
		})

		it('ends current paragraph at the start of a new block-level element: Heading', () => {
			const paragraph = parseAll('Paragraph', `some text\nsome text\nsome text\n# heading`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text\nsome text\nsome text\n`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some text\nsome text\nsome text\n` },
			])
		})
		it('ends the current paragraph at the next heading, even if it is in the first line', () => {
			const paragraph = parseAll('Paragraph', `# heading`)
	
			expect(paragraph).toBeNull()
		})
		it('ends the paragraph on a line that starts a new table', () => {
			const paragraph = parseAll('Paragraph', `some text\nsome text\nsome text\nth1 | th2 | th3\n|---|---|---|`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text\nsome text\nsome text\n`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some text\nsome text\nsome text\n` },
			])
		})

		it('parses strong emphasis inside paragraph (until end of input)', () => {
			const paragraph = parseAll('Paragraph', `some **bold** text`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some **bold** text`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some ` },
				{ delimiter: '**', asText: '**bold**' },
				{ type: 'Text', textContent: ' text'},
			])
		})
		it('parses strong emphasis inside paragraph (next line is heading)', () => {
			const paragraph = parseAll('Paragraph', `some **bold** text\n# heading`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some **bold** text\n`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some ` },
				{ delimiter: '**', asText: '**bold**' },
				{ type: 'Text', textContent: ' text\n'},
			])
		})
		it('parses strong emphasis inside paragraph (ended by blank line)', () => {
			const paragraph = parseAll('Paragraph', `some **bold** text\n\nmore text`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some **bold** text\n\n`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some ` },
				{ delimiter: '**', asText: '**bold**' },
				{ type: 'Text', textContent: ' text\n'},
				{}, //blank line
			])
		})
		it('parses non-emphazised text', () => {
			const paragraph = parseAll('Paragraph', `some **not bold text`)
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some **not bold text`)
			expect(paragraph).toHaveChildren([
				{ type: 'Text', textContent: `some **not bold text` },
			])
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Paragraph

		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '', rangeOffset: 0, rangeLength: 'some '.length }
		).cannotBeParsed('Update does remove the start of the range')
		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '', rangeOffset: 's'.length, rangeLength: 'ome '.length }
		).canBeParsed()
		expectUpdate(
			parser,
			'some text',
			{ text: ' more text', rangeOffset: 'some text'.length, rangeLength: 0 }
		).canBeParsed('Update at the end of the range can still be parsed')
		expectUpdates(
			parser,
			'some text',
			[
				{ text: ' ', rangeOffset: 'some text'.length, rangeLength: 0 },
				{ text: 'm', rangeOffset: 'some text '.length, rangeLength: 0 },
			]
		).canBeParsed('Multiple updates at the end of the range can still be parsed')
		
		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '\n', rangeOffset: 'some text\n'.length, rangeLength: 0 }
		).cannotBeParsed('shortens the paragraph')
		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '', rangeOffset: 'some text\nsome text\nsome text'.length, rangeLength: '\n'.length }
		).cannotBeParsed('changes the paragraph ending: removes first \\n')
		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '', rangeOffset: 'some text\nsome text\nsome text\n'.length, rangeLength: '\n'.length }
		).cannotBeParsed('changes the paragraph ending: removes second \\n')
	})
})

