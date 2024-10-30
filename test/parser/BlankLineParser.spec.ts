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
import { replaceWhitespace } from "../replaceWhitespace"

describe('BlankLineParser', () => {
	it('parses a blank line consisting of \\n', () => {
		const parser = new Parsers().BlankLine
		const textContent = new TextContent(' \t\n')

		const result = parser.parse(textContent.asRange())

		expect(result).not.toBeNull()
		expect(result?.textContent).toEqual(' \t\n')
	});

	[
		'some text\n',
		'  some text\n',
		'  ',
	].forEach(t => it(`does not parse a blank line for ${replaceWhitespace(t)}`, () => {
		const parser = new Parsers().BlankLine
		const textContent = new TextContent(t)
	
		const result = parser.parse(textContent.asRange())

		expect(result).toBeNull()
	}));

	[
		['\n', '\n'],
		[' \t\n', ' \t\n'],
		['   \r', '   \r'],
		['  \nmore text', '  \n'],
		['   \r\n', '   \r\n'],
		['   \n\r', '   \n'],
	].forEach(t => it(`parses ${replaceWhitespace(t[0])} into blank line ${replaceWhitespace(t[1])}`, () => {
		const parser = new Parsers().BlankLine
		const textContent = new TextContent(t[0])

		const result = parser.parse(textContent.asRange())

		expect(result).not.toBeNull()
		expect(result?.textContent).toEqual(t[1])
	}))
})