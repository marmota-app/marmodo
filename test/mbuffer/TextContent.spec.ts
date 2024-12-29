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

import { TextContent } from "../../src/mbuffer/TextContent"
import { PersistentRange } from "../../src/mbuffer/TextRange"

const assume = expect

describe('TextContent', () => {
	it('can get back the original text after init', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		expect(content.text()).toEqual('the quick brown fox jumps over the lazy dog')
	})

	it('can insert characters', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		content.update({ text: 're', rangeOffset: 'the quick '.length, rangeLength: 0 })
		content.update({ text: 'd-', rangeOffset: 'the quick re'.length, rangeLength: 0 })

		expect(content.text()).toEqual('the quick red-brown fox jumps over the lazy dog')
	})

	it('can delete characters', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		content.update({ text: '', rangeOffset: 'the quick '.length, rangeLength: 'bro'.length })
		content.update({ text: '', rangeOffset: 'the quick '.length, rangeLength: 'wn '.length })

		expect(content.text()).toEqual('the quick fox jumps over the lazy dog')
	})

	it('can replace characters', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		content.update({ text: 'red', rangeOffset: 'the '.length, rangeLength: 'quick brown'.length })

		expect(content.text()).toEqual('the red fox jumps over the lazy dog')
	})

	it('returns the replaced range and replaced text after an update', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')
		const completeRange = content.start().persistentRangeUntil(content.end())

		const updateInfo = content.update({ text: 'red', rangeOffset: 'the '.length, rangeLength: 'quick brown'.length })

		assume(content.text()).toEqual('the red fox jumps over the lazy dog')
		expect(updateInfo.replacedText).toEqual('quick brown')
		expect(updateInfo.newText).toEqual('red')
		expect(updateInfo.range.asString()).toEqual('red')

		const rangeUntilReplacement = new PersistentRange(completeRange.start, updateInfo.range.start.persist())
		const rangeAfterReplacement = new PersistentRange(updateInfo.range.end.persist(), completeRange.end)

		expect(rangeUntilReplacement.asString()).toEqual('the ')
		expect(rangeAfterReplacement.asString()).toEqual(' fox jumps over the lazy dog')
	})

	it('can get a range for the whole text', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		const range = content.start().persistentRangeUntil(content.end())

		expect(range.asString()).toEqual('the quick brown fox jumps over the lazy dog')
	})

	it('can parse multiple updates with deletes and insert', () => {
		const content = new TextContent('Tes')

		content.update({
			"rangeLength": 1,
			"text": "",
			"rangeOffset": 2,
		})
		content.update({
			"rangeLength": 1,
			"text": "",
			"rangeOffset": 1,
		})
		content.update({
			"rangeLength": 0,
			"text": "t",
			"rangeOffset": 1,
		})

		const range = content.start().persistentRangeUntil(content.end())
		expect(range.asString()).toEqual('Tt')
	})
	it('can update with multiple buffers, inserts and deletes', () => {
		const content = new TextContent('123a456');

		[
			{
				"rangeLength": 0,
				"text": "b",
				"rangeOffset": 4,
			},
			{
				"rangeLength": 0,
				"text": "c",
				"rangeOffset": 5,
			},
			{
				"rangeLength": 1,
				"text": "",
				"rangeOffset": 5,
			},
			{
				"rangeLength": 0,
				"text": "e",
				"rangeOffset": 5,
			}
		].forEach(cu => {
			content.update(cu)
		})

		const range = content.start().persistentRangeUntil(content.end())
		expect(range.asString()).toEqual('123abe456')
	})
})
