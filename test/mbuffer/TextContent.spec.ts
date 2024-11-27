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
