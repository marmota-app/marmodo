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

import { TextContent } from "../../src/mbuffer/TextContent"
import { Parsers } from "../../src/parser/Parsers"
import { replaceWhitespace } from "../replaceWhitespace";

describe('ParagraphParser', () => {
	describe('Parsing the content', () => {
		it('Parses the complete text into a paragraph when it does not contain any newlines', () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent('some text')
	
			const paragraph = parser.parse(textContent.asRange())
	
			expect(paragraph?.content).toHaveLength(1)
			const content = paragraph!.content[0]
			expect(content).toHaveProperty('type', 'Text')
			expect(content).toHaveProperty('textContent', 'some text')
		});
	
		[
			'\n',
			//'\r\n',
			//' \n',
			//'\t   \t \t\r\n'
		].forEach(blankLine => it.skip(`ends the current paragraph at blank line "${replaceWhitespace(blankLine)}"`, () => {
			const parser = new Parsers().Paragraph
			const textContent = new TextContent('some text\n\nmore text')
	
			const paragraph = parser.parse(textContent.asRange())
	
			expect(paragraph?.parsedRange.asString()).toEqual('some text\n\n')
	
			expect(paragraph?.content).toHaveLength(3)
			const content = paragraph!.content[0]
			expect(content).toHaveProperty('type', 'Text')
			expect(content).toHaveProperty('textContent', 'some text')
	
			expect(paragraph!.content[1]).toHaveProperty('type', 'NewLine')
			expect(paragraph!.content[2]).toHaveProperty('type', 'BlankLine')
			expect(paragraph!.content[2]).toHaveProperty('textContent', blankLine)
		}))
	})

	describe('parsing updates', () => {
	})
})