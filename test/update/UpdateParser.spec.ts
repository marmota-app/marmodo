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

import { TextContent } from "../../src/mbuffer/TextContent"
import { Parsers } from "../../src/parser/Parsers"
import { UpdateParser } from "../../src/update/UpdateParser"

describe('UpdateParser', () => {
	//The tests in here are quite high-level: They parse some text, then
	//parse the update and compare the text from the new container to the
	//original. That might not catch all possible bugs, but it is good enough
	//for here.

	it('can update text content in paragraph', () => {
		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick fox jumps over the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.start(), tc.end())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		const contentUpdate = { text: ' brown', rangeOffset: 'the quick'.length, rangeLength: 0 }
		const updateInfo = tc.update(contentUpdate)
		const updated = updateParser.parseUpdate(
			updateInfo,
			container,
			tc.end(),
		)

		const expectedBuffer = new TextContent(originalText)
		expectedBuffer.update(contentUpdate)
		expect(updated).not.toBeNull()
		expect(updated?.asText).toEqual(expectedBuffer.text())
	})

	it('sends update notifications to updated elements', () => {
		let notified = false

		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick brown fox jumps\n\nover the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.start(), tc.end())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		container.onUpdate(() => notified = true)

		const contentUpdate = { text: ' ', rangeOffset: 'the quick brown fox jumps'.length, rangeLength: 2 }
		const updateInfo = tc.update(contentUpdate)
		const updated = updateParser.parseUpdate(
			updateInfo,
			container,
			tc.end(),
		)

		expect(notified).toEqual(true)
	})
	it('sends subtree update notifications to updated elements and parents', () => {
		let notified = 0

		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick brown fox jumps\n\nover the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.start(), tc.end())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		container.content[0].content[0].onSubtreeUpdate(() => notified++)
		container.content[0].onSubtreeUpdate(() => notified++)
		container.onSubtreeUpdate(() => notified++)

		const contentUpdate = { text: ' ', rangeOffset: 'the quick brown fox'.length, rangeLength: 0 }
		const updateInfo = tc.update(contentUpdate)
		const updated = updateParser.parseUpdate(
			updateInfo,
			container,
			tc.end(),
		)

		expect(notified).toEqual(3)
	})
	it('does not send update notifications to unsubscribed listener', () => {
		let notified = false

		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick brown fox jumps\n\nover the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.start(), tc.end())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		container.onUpdate(() => notified = true).unsubscribe()

		const contentUpdate = { text: ' ', rangeOffset: 'the quick brown fox jumps'.length, rangeLength: 2 }
		const updateInfo = tc.update(contentUpdate)
		const updated = updateParser.parseUpdate(
			updateInfo,
			container,
			tc.end(),
		)

		expect(notified).toEqual(false)
	})

	it('removes listeners from obsolete elements', () => {
		let notified = false

		const parsers = new Parsers()
		const updateParser = new UpdateParser()
		
		const originalText = 'the quick brown fox jumps\n\nover the lazy dog'
		const tc = new TextContent(originalText)
		const container = parsers.Container.parse(tc.start(), tc.end())
		if(container == null) {
			throw new Error('container cannot be parsed!')
		}

		const section = container.content[0]
		const p1 = section.content[0]
		const p2 = section.content[1]
		section.onUpdate(() => notified = true)
		p1.onUpdate(() => notified = true)
		p2.onUpdate(() => notified = true)

		const contentUpdate = { text: ' ', rangeOffset: 'the quick brown fox jumps'.length, rangeLength: 2 }
		const updateInfo = tc.update(contentUpdate)
		updateParser.parseUpdate(
			updateInfo,
			container,
			tc.end(),
		)

		expect(notified).toEqual(false)

		section.updateParsed()
		expect(notified).toEqual(false)
		p1.updateParsed()
		expect(notified).toEqual(false)
		p2.updateParsed()
		expect(notified).toEqual(false)
	})

})