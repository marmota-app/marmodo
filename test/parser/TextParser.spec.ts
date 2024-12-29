/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

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
