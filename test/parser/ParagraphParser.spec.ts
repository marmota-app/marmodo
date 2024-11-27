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

