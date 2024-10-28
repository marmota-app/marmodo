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
import { UpdateParser } from "../../src/update/UpdateParser"

describe('UpdateParser', () => {
	//The tests in here are quite high-level: They parse some text, then
	//parse the update and compare the text from the new container to the
	//original. That might not catch all possible bugs, but it is good enough
	//for here: Detailed updates that might go wrong should be tested at
	//the element where they might fail.

	it('can update text content in paragraph', () => {
		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick fox jumps over the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.asRange())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		const contentUpdate = { text: ' brown', rangeOffset: 'the quick'.length, rangeLength: 0 }
		const updateInfo = tc.update(contentUpdate)
		const updated = updateParser.parseUpdate(
			updateInfo,
			container,
		)

		const expectedBuffer = new TextContent(originalText)
		expectedBuffer.update(contentUpdate)
		expect(updated).not.toBeNull()
		expect(updated?.asText()).toEqual(expectedBuffer.text())
	})
})