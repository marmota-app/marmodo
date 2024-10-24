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

import { List, Paragraph, parseMarkdown } from "../../src/legacy/parseMarkdown"
import { assertTextContent } from './assertion.textContent'

const assume = expect

describe.skip('parseMarkdown: parse lists', () => {
	describe('unordered lists', () => {
		it('creates unordered list when line starts with *', () => {
			const markdown = '* foo'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
		})
	
	
		it('creates unordered list with one list item when line starts with *', () => {
			const markdown = '* foo'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
	
			const list = result.content[0] as List
			expect(list.items).toHaveLength(1)
			expect(list.items[0]).toHaveProperty('type', 'ListItem')
		})

		const ulTexts: string[] = [ 'foo', 'bar', 'bar * foo', ]
		ulTexts.forEach(text => {
			it(`creates list item with text ${text} when line starts with *`, () => {
				const markdown = `* ${text}`
	
				const result = parseMarkdown(markdown)
	
				expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
				const list = result.content[0] as List
				expect(list.items[0].content).toHaveLength(1)
				expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
				expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', text)
			})
		})
	
		it('adds another list item to an existing list', () => {
			const markdown = '* foo\n* bar'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
	
			const list = result.content[0] as List
			expect(list.items).toHaveLength(2)
			expect((list.items[1].content[0] as Paragraph).content[0]).toHaveProperty('content', 'bar')
		})
	
		const ulTokens: string[] = [ '-', '+', '*', ]
		ulTokens.forEach(token => {
			it(`recognizes ${token} as start of an unordered list item`, () => {
				const markdown = `${token} foo`
	
				const result = parseMarkdown(markdown)
	
				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
	
				const list = result.content[0] as List
				expect(list.items).toHaveLength(1)
				expect(list.items[0]).toHaveProperty('type', 'ListItem')
			})
		})
	
		it('creates new unordered list when empty line before * item', () => {
			const markdown = '* first\n* second\n\n* third'
			const result = parseMarkdown(markdown)
	
	
			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
			expect(result.content[1]).toHaveProperty('type', 'UnorderedList')
	
			const list = result.content[1] as List
			expect(list.items).toHaveLength(1)
			expect(list.items[0]).toHaveProperty('type', 'ListItem')
			expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'third')
		})
	
		it('adds markdown paragraph content as list item', () => {
			const markdown = '* text **bold** text'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')
			const list = result.content[0] as List
	
			expect(list.items[0]).toHaveProperty('content')
			expect((list.items[0].content[0] as Paragraph).content).toHaveLength(3)
	
			expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')
	
			expect((list.items[0].content[0] as Paragraph).content[1]).toHaveProperty('type', 'Bold')
			assertTextContent((list.items[0].content[0] as Paragraph).content[1], 'bold')
	
			expect((list.items[0].content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
			expect((list.items[0].content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
		})
	})

	describe('ordered lists', () => {
		const olTokens: string[] = [ '1.', '3.', '123.', ]
		olTokens.forEach(token => {
			it(`recognizes ${token} as start of an unordered list item`, () => {
				const markdown = `${token} foo`
	
				const result = parseMarkdown(markdown)
	
				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'OrderedList')
	
				const list = result.content[0] as List
				expect(list.items).toHaveLength(1)
				expect(list.items[0]).toHaveProperty('type', 'ListItem')
			})
		})

		it('creates ordered list with two entries', () => {
			const markdown = '3. foo\n1. bar'
	
			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'OrderedList')

			const list = result.content[0] as List
			expect(list.items).toHaveLength(2)
			expect(list.items[0]).toHaveProperty('type', 'ListItem')
			expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((list.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'foo')

			expect(list.items[1]).toHaveProperty('type', 'ListItem')
			expect((list.items[1].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((list.items[1].content[0] as Paragraph).content[0]).toHaveProperty('content', 'bar')
		})
	})

	describe('nested lists, code blocks and paragraphs', () => {
		it('can nest simple unordered list', () => {
			const markdown = '* toplevel\n    * nested first\n    * nested second'
			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')

			const list = result.content[0] as List
			expect(list.items[0].content[list.items[0].content.length-1]).toHaveProperty('type', 'UnorderedList')
			const innerList = list.items[0].content[list.items[0].content.length-1] as List

			expect(innerList.items).toHaveLength(2)
			expect(innerList.items[0]).toHaveProperty('type', 'ListItem')
			expect(innerList.items[0].content[0]).toHaveProperty('type', 'Paragraph')
			expect((innerList.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((innerList.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested first')

			expect(innerList.items[1]).toHaveProperty('type', 'ListItem')
			expect(innerList.items[1].content[0]).toHaveProperty('type', 'Paragraph')
			expect((innerList.items[1].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((innerList.items[1].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested second')
		})

		it('can nest a list inside a nested list', () => {
			const markdown = '* toplevel\n  1. nested l1\n    * nested l2.1\n    * nested l2.2\n      1. nested l3.1'
			const result = parseMarkdown(markdown)

			assume(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'UnorderedList')

			const list = result.content[0] as List
			expect(list.items[0].content.length).toBeLessThanOrEqual(2)
			expect(list.items[0].content[list.items[0].content.length-1]).toHaveProperty('type', 'OrderedList')
			const innerListL1 = list.items[0].content[list.items[0].content.length-1] as List

			expect(innerListL1.items[0].content[list.items[0].content.length-1]).toHaveProperty('type', 'UnorderedList')
			const innerListL2 = innerListL1.items[0].content[list.items[0].content.length-1] as List

			expect(innerListL2.items).toHaveLength(2)
			expect(innerListL2.items[0]).toHaveProperty('type', 'ListItem')
			expect(innerListL2.items[0].content[0]).toHaveProperty('type', 'Paragraph')
			expect((innerListL2.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((innerListL2.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested l2.1')

			expect(innerListL2.items[1]).toHaveProperty('type', 'ListItem')
			expect(innerListL2.items[1].content[0]).toHaveProperty('type', 'Paragraph')
			expect((innerListL2.items[1].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((innerListL2.items[1].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested l2.2')

			expect(innerListL2.items[1].content[list.items[0].content.length-1]).toHaveProperty('type', 'OrderedList')
			const innerListL3 = innerListL2.items[1].content[list.items[0].content.length-1] as List

			expect(innerListL3.items[0]).toHaveProperty('type', 'ListItem')
			expect(innerListL3.items[0].content[0]).toHaveProperty('type', 'Paragraph')
			expect((innerListL3.items[0].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((innerListL3.items[0].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested l3.1')
		})

		it('can nest a list and then un-nets', () => {
			const markdown = '* toplevel\n  1. nested l1.1\n    * nested l2.1\n    * nested l2.2\n* nested l0.2'
			const result = parseMarkdown(markdown)

			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'UnorderedList')

			const list = result.content[0] as List
			expect(list.items).toHaveLength(2)

			expect((list.items[1].content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((list.items[1].content[0] as Paragraph).content[0]).toHaveProperty('content', 'nested l0.2')
		})
	})

})
