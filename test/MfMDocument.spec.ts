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

import { MfMDocument } from "../src/MfMDocument"
import { UpdateParser } from "../src/update/UpdateParser"

class TestUpdateParser extends UpdateParser {
	override parseUpdate() { return null }
}

describe('MfMDocument', () => {
	it('can parse a simple document with a single line', () => {
		const document = new MfMDocument('the quick brown fox jumps over the lazy dog')

		expect(document.content.content).toHaveLength(1)
	})
	it('can get back the text of a simple document', () => {
		const document = new MfMDocument('the quick brown fox jumps over the lazy dog')

		expect(document.text).toEqual('the quick brown fox jumps over the lazy dog')
	})

	describe('parsing updates', () => {
		it('re-parses the document when the update parser returns null', () => {
			const document = new MfMDocument('the quick fox jumps over the lazy dog', {
				updateParser: new TestUpdateParser(),
				development: false,
			})

			document.update(
				{text: ' brown', rangeOffset: 'the quick'.length, rangeLength: 0},
				() => 'the complete document'
			)

			expect(document.text).toEqual('the complete document')
		})
		it('parses an update to the original document', () => {
			const document = new MfMDocument('the quick fox jumps over the lazy dog')

			document.update(
				{text: ' brown', rangeOffset: 'the quick'.length, rangeLength: 0},
				() => 'the quick brown fox jumps over the lazy dog'
			)

			expect(document.text).toEqual('the quick brown fox jumps over the lazy dog')
		})
	})
})
