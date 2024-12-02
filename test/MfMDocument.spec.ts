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
