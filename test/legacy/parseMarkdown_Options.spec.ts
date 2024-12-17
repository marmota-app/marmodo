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

import { Options } from '../../src/element'
import {
	Block, ContentOptions, Heading, HorizontalRule, InlineCodeTextContent, List, ListItem, Paragraph, parseMarkdown, Preformatted
} from '../../src/legacy/parseMarkdown'

const assume = expect

describe('parseMarkdown: Options with curly braces', () => {
	it.skip('supports options on code blocks', () => {
		const markdown = '```{ javascript }\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).toHaveLength(1)
		expect(result.content[0]).toHaveProperty('type', 'Preformatted')

		const options = (result.content[0] as Preformatted).options
		expect(options).toHaveProperty('default', 'javascript')
	})

	it.skip('supports options block on paragraph inline code block', () => {
		const markdown = '`{ javascript }inner text`'

		const result = parseMarkdown(markdown)

		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'InlineCode')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options
		expect(options).toHaveProperty('default', 'javascript')
		expect(inlineCode.content).toHaveLength(1)
		expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[0]).toHaveProperty('content', 'inner text')
	})

	it.skip('supports options on horizontal rule', () => {
		const markdown = '---{ defaultoption }\n'

		const result = parseMarkdown(markdown)

		const hruleResult = result.content.filter(c => c.type === 'HorizontalRule')
		expect(hruleResult).toHaveLength(1)
		expect(hruleResult[0]).toHaveProperty('type', 'HorizontalRule')

		const options = (hruleResult[0] as HorizontalRule).options
		expect(options).toHaveProperty('default', 'defaultoption')
	})

	it('supports options on headings', () => {
		const markdown = '#{ defaultoption }\n'

		const result = parseMarkdown(markdown)

		const hResult = result.content.filter(c => c.type === 'Heading')
		expect(hResult).toHaveLength(1)
		expect(hResult[0]).toHaveProperty('type', 'Heading')

		const options = (hResult[0] as Heading).options as unknown as Options
		expect(options.get('default')).toEqual('defaultoption')
	})

	it('supports options on paragraphs', () => {
		const markdown = 'asdf\n\n{ defaultoption }paragraph 2\n'

		const result = parseMarkdown(markdown)

		const pResult = result.content.filter(c => c.type === 'Paragraph')
		expect(pResult.length).toBeGreaterThanOrEqual(2)
		expect(pResult.at(1)).toHaveProperty('type', 'Paragraph')

		const options = (pResult.at(1) as Paragraph).options as unknown as Options
		expect(options.get('default')).toEqual('defaultoption')
	})

	//TODO!!!
	const styles: string[] = ['_', '**', /*'~~'*/]
	styles.forEach(style => {
		it(`supports options on ${style}`, () => {
			const markdown = `${style}{ defaultoption }text${style}`

			const result = parseMarkdown(markdown)
	
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')
			assume((result.content[0] as Paragraph).content[0]).toHaveProperty('options')
		
			const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options  as unknown as Options
			expect(options).toHaveProperty('keys', [ 'default' ])
			expect(options.get('default')).toEqual('defaultoption')
		})
	})

	it.skip('supports options on links', () => {
		const markdown = '[text](target){defaultoption}'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).toHaveProperty('default', 'defaultoption')
	})

	it.skip('supports options on image links', () => {
		const markdown = '![text](target){defaultoption}'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).toHaveProperty('default', 'defaultoption')
	})

	const lowercaseLinks = [
		'https://youtu.be/x_0EH-mLyRM', 'https://vimeo.com/123123123', 'https://www.youtube.com/watch?v=x_0EH-mLyRM&feature=youtu.be',
		'./file.mp4', './file.mov', './file.avi','./file.wmv', './file.webm',
	]
	const uppercaseLinks = lowercaseLinks.map(l => l.toUpperCase())
	const videoLinks = [ ...lowercaseLinks, ...uppercaseLinks, ]
	videoLinks.forEach(link => it.skip(`has "video" type option when link is ${link}`, () => {
		const markdown = `![text](${link})`

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('options')
	
		const options = ((result.content[0] as Paragraph).content[0] as { options: ContentOptions }).options
		expect(options).toHaveProperty('type', 'video')
	}))

	it.skip('supports options on asides', () => {
		const markdown = '^{defaultoption} Aside content'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Aside')
		assume(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as Block).options
		expect(options).toHaveProperty('default', 'defaultoption')
	})
	it.skip('supports options on block quotes', () => {
		const markdown = '>{defaultoption} Block quote content'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Blockquote')
		assume(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as Block).options
		expect(options).toHaveProperty('default', 'defaultoption')
	})

	it.skip('supports options on lists (first item)', () => {
		const markdown = '*{defaultoption} item 1\n* item2'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'UnorderedList')
		assume(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as Block).options
		expect(options).toHaveProperty('default', 'defaultoption')

		assume((result.content[0] as List).items).toHaveLength(2)
		assume((result.content[0] as List).items[0]).toHaveProperty('type', 'ListItem')
		assume((result.content[0] as List).items[0]).toHaveProperty('options')
	
		const itemOptions = ((result.content[0] as List).items[0] as ListItem).options
		expect(itemOptions).toHaveProperty('default', 'defaultoption')
	})
	it.skip('supports options on lists (subsequent item)', () => {
		const markdown = '* item 1\n*{defaultoption} item2'

		const result = parseMarkdown(markdown)
	
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'UnorderedList')
		assume(result.content[0]).toHaveProperty('options')
	
		const options = (result.content[0] as Block).options
		expect(options).not.toHaveProperty('default')

		const list = (result.content[0] as List)
		assume(list.items).toHaveLength(2)
		assume(list.items[1]).toHaveProperty('type', 'ListItem')
		assume(list.items[1]).toHaveProperty('options')
	
		const itemOptions = ((result.content[0] as List).items[1] as ListItem).options
		expect(itemOptions).toHaveProperty('default', 'defaultoption')
	})

	it('does not parse incomplete option block', () => {
		const markdown = '_{ javascript_'

		const result = parseMarkdown(markdown)

		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Emphasis')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options as unknown as Options
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(options).toHaveProperty('keys', [])
		expect(inlineCode.content).toHaveLength(1)
		expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[0]).toHaveProperty('textContent', '{ javascript')
	})

	it('parses named option instead of default', () => {
		const markdown = '_{ foo = bar }inner text_'

		const result = parseMarkdown(markdown)

		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Emphasis')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options as unknown as Options
		expect(options).toHaveProperty('keys', ['foo'])
		expect(options.get('foo')).toEqual('bar')
		expect(inlineCode.content).toHaveLength(2)
		expect(inlineCode.content[1]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[1]).toHaveProperty('textContent', 'inner text')
	})

	it('parses default option and key/value options', () => {
		const markdown = '_{ def; foo = bar; baz=another option }inner text_'

		const result = parseMarkdown(markdown)

		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Emphasis')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options as unknown as Options
		expect(options.get('default')).toEqual('def')
		expect(options.get('foo')).toEqual('bar')
		expect(options.get('baz')).toEqual('another option')
		expect(inlineCode.content).toHaveLength(2)
		expect(inlineCode.content[1]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[1]).toHaveProperty('textContent', 'inner text')
	})

	it('does not parse default option after first entry', () => {
		const markdown = '_{ foo=bar; def }code content_'

		const result = parseMarkdown(markdown)

		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')
		assume((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Emphasis')

		const inlineCode = (((result.content[0] as Paragraph).content[0] as InlineCodeTextContent))
		const options = inlineCode.options as unknown as Options
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(options.get('default')).toBeUndefined()
		expect(options.get('def')).toBeUndefined()
		expect(options.get('foo')).toEqual('bar')
		expect(inlineCode.content).toHaveLength(2)
		expect(inlineCode.content[1]).toHaveProperty('type', 'Text')
		expect(inlineCode.content[1]).toHaveProperty('textContent', 'code content')
	})

	describe.skip('slide options', () => {
		const slideStarts = [ '#', '---' ]

		slideStarts.forEach(slideStart => {
			it(`slide "${slideStart}" adds optionsLine, optionsStart and optionsLength fields to existing options`, () => {
				const markdown = `\n\n${slideStart}{ foo=bar; }`
		
				const result = parseMarkdown(markdown)
				const options = (result.content[0] as any).options
		
				expect(options).toHaveProperty('optionsLine', '2')
				expect(options).toHaveProperty('optionsStart', ''+slideStart.length)
				expect(options).toHaveProperty('optionsLength', '12')
			})
		
			it(`slide "${slideStart}" adds optionsLine, optionsStart and optionsLength fields when opetions are not explicitly defined`, () => {
				const markdown = `\n\n${slideStart}`
		
				const result = parseMarkdown(markdown)
				const options = (result.content[0] as any).options
		
				expect(options).toHaveProperty('optionsLine', '2')
				expect(options).toHaveProperty('optionsStart', ''+slideStart.length)
				expect(options).toHaveProperty('optionsLength', '0')
			})
		})
	})
})
