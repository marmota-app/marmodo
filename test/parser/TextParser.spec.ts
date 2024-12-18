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

import { Text } from "../../src/element/MfMElements"
import { Parsers } from "../../src/parser/Parsers"
import { parseAll } from "../parse"
import { expectUpdate } from "../update/expectUpdate"

describe('TextParser', () => {
	describe('Parsing the text', () => {
		it('parses complete text', () => {
			const text = parseAll('Text', 'some text') as Text
	
			expect(text).not.toBeNull()
			expect(text?.textContent).toEqual('some text')
		})
	})

	describe('Parsing updates', () => {
		const parser = new Parsers().Text

		expectUpdate(
			parser,
			'some text\nmore text',
			{ text: '#', rangeOffset: 'some '.length, rangeLength: 0 }
		).canBeParsed('Inserted in the middle of a line')
		expectUpdate(
			parser,
			'some text\nmore text',
			{ text: '#', rangeOffset: 'some text\n'.length, rangeLength: 0 }
		).cannotBeParsed('Would create a new heading');

		[ '*', '=', '_', '!', '[', ']', '~', '`', '{', '}', ';', '|', ].forEach(p => expectUpdate(
			parser,
			'some text\nmore text',
			{ text: `some text${p}more text`, rangeOffset: 'some text\n'.length, rangeLength: 0 }
		).cannotBeParsed(`Would add delimiter ${p} of delimited inlines`))
	})
})
