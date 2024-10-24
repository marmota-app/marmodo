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

	it('can get a range for the whole text', () => {
		const content = new TextContent('the quick brown fox jumps over the lazy dog')

		const range = content.asRange()

		expect(range.asString()).toEqual('the quick brown fox jumps over the lazy dog')
	})
})
