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

import { InlineCodeTextContent, Paragraph, parseMarkdown, Preformatted } from "../../src/legacy/parseMarkdown"

const assume = expect

describe.skip('parseMarkdown: Arrows', () => {
	it('parses arrow', () => {
		const markdown = 'text =>{}pointed text'

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(3)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('pointingTo', 'pointed')

		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
	})

	it('parses arrow with text at end of line', () => {
		const markdown = 'text =>{}pointed'

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(2)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('pointingTo', 'pointed')
	})

	it('parses arrow at end of line', () => {
		const markdown = 'text =>{}'

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(2)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('pointingTo', '')
	})

	it('parses two arrows in same word', () => {
		const markdown = 'text =>{}poin=>{up-left}ted text'

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(4)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('pointingTo', 'poin')

		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Arrow')
		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('pointingTo', 'ted')

		expect((result.content[0] as Paragraph).content[3]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[3]).toHaveProperty('content', ' text')
	})

	it('parses arrows in inline code', () => {
		const markdown = '`code =>{}with arrow`'

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(1)

		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'InlineCode')
		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		expect(inlineCode.content).toHaveLength(3)
		expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[0]).toHaveProperty('content', 'code ')

		expect(inlineCode.content[1]).toHaveProperty('type', 'Arrow')
		expect(inlineCode.content[1]).toHaveProperty('pointingTo', 'with')

		expect(inlineCode.content[2]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[2]).toHaveProperty('content', ' arrow')
	})
	it('parses arrows in code block', () => {
		const markdown = '```\ncode =>{}with arrow\nmore code\nanother =>{}arrow\n```'

		const result = parseMarkdown(markdown)
		//assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Preformatted')

		const codeBlock = (result.content[0] as Preformatted)
		expect(codeBlock.content).toHaveLength(8)
		expect(codeBlock.content[0]).toHaveProperty('type', 'Text')
		expect(codeBlock.content[0]).toHaveProperty('content', 'code ')

		expect(codeBlock.content[1]).toHaveProperty('type', 'Arrow')
		expect(codeBlock.content[1]).toHaveProperty('pointingTo', 'with')

		expect(codeBlock.content[2]).toHaveProperty('type', 'Text')
		expect(codeBlock.content[2]).toHaveProperty('content', ' arrow')

		expect(codeBlock.content[3]).toHaveProperty('type', 'Newline')

		expect(codeBlock.content[4]).toHaveProperty('type', 'Text')
		expect(codeBlock.content[4]).toHaveProperty('content', 'more code')

		expect(codeBlock.content[5]).toHaveProperty('type', 'Newline')

		expect(codeBlock.content[6]).toHaveProperty('type', 'Text')
		expect(codeBlock.content[6]).toHaveProperty('content', 'another ')

		expect(codeBlock.content[7]).toHaveProperty('type', 'Arrow')
		expect(codeBlock.content[7]).toHaveProperty('pointingTo', 'arrow')
	})
})