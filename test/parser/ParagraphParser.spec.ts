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

import { TextContent } from "../../src/mbuffer/TextContent";
import { Parsers } from "../../src/parser/Parsers";
import { replaceWhitespace } from "../replaceWhitespace";
import { expectUpdate } from "../update/expectUpdate";

describe('ParagraphParser', () => {
	describe('Parsing the content', () => {
		it('Parses the complete text into a paragraph when it does not contain any newlines', () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent('some text')
	
			const paragraph = parser.parse(textContent.start(), textContent.end())
	
			expect(paragraph?.content).toHaveLength(1)
			const content = paragraph!.content[0]
			expect(content).toHaveProperty('type', 'Text')
			expect(content).toHaveProperty('textContent', 'some text')
		});
	
		[
			['\n', '\n',],
			['\r\n', '\r\n',],
			['\n', ' \n',],
			['\n', '\t   \t \t\r\n',],
		].forEach(([newLine, blankLine]) => it(`ends the current paragraph at blank line "${replaceWhitespace(blankLine)}"`, () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent(`some text${newLine}${blankLine}more text`)
	
			const paragraph = parser.parse(textContent.start(), textContent.end())
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text${newLine}${blankLine}`)
	
			expect(paragraph?.content).toHaveLength(2)
			const content = paragraph!.content[0]
			expect(content).toHaveProperty('type', 'Text')
			expect(content).toHaveProperty('textContent', `some text${newLine}`)
	
			expect(paragraph!.content[1]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[1]).toHaveProperty('textContent', blankLine)
		}))

		it(`ends the current paragraph at blank line after multiple lines`, () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent(`some text\nsome text\nsome text\n\nmore text`)
	
			const paragraph = parser.parse(textContent.start(), textContent.end())
	
			expect(paragraph?.parsedRange.asString()).toEqual(`some text\nsome text\nsome text\n\n`)
	
			expect(paragraph?.content).toHaveLength(2)
			const content = paragraph!.content[0]
			expect(content).toHaveProperty('type', 'Text')
			expect(content).toHaveProperty('textContent', `some text\nsome text\nsome text\n`)
	
			expect(paragraph!.content[1]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[1]).toHaveProperty('textContent', '\n')
		})

		it('adds multiple blank lines to the end of the current paragraph', () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent(`some text\nsome text\nsome text\n   \n\t\n\nmore text`)
	
			const paragraph = parser.parse(textContent.start(), textContent.end())
	
			expect(paragraph?.content).toHaveLength(4)

			expect(paragraph!.content[1]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[1]).toHaveProperty('textContent', '   \n')
			expect(paragraph!.content[2]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[2]).toHaveProperty('textContent', '\t\n')
			expect(paragraph!.content[3]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[3]).toHaveProperty('textContent', '\n')
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Paragraph

		expectUpdate(
			parser,
			'some text\nsome text\nsome text\n\nmore text',
			{ text: '', rangeOffset: 0, rangeLength: 'some '.length }
		).canBeParsed()

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

