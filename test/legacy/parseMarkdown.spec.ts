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

import { assertTextContent } from './assertion.textContent'

import {
	parseMarkdown,
	Paragraph,
	Block,
	List,
	Preformatted,
	TextContent,
	InlineCodeTextContent,
	HorizontalRule,
	Heading,
	Table,
	StrikeThroughTextContent,
	ItalicTextContent,
} from '../../src/legacy/parseMarkdown'

const assume = expect

describe.skip('parseMarkdown', () => {
	it('always creates a resulting document', () => {
		const markdown = ''

		const result = parseMarkdown(markdown)

		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		expect(result).toBeDefined()
	})

	it('empty markdown creates empty document', () => {
		const markdown = ''

		const result = parseMarkdown(markdown)

		expect(result.content).toEqual([])
	})

	describe('parse headings', () => {
		const headlines: string[] = [ '#', '##', '###', '####', ]
		headlines.forEach((h: string) => {
			it(`heading level ${h.length} creates Headline`, () => {
				const markdown = h + ' Foobar\n'

				const result = parseMarkdown(markdown)

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'Heading')
				expect(result.content[0]).toHaveProperty('level', h.length)
				expect(result.content[0]).toHaveProperty('text', 'Foobar')
			})

			it(`creates empty heading fro single ${h}`, () => {
				const markdown = h

				const result = parseMarkdown(markdown)

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'Heading')
				expect(result.content[0]).toHaveProperty('level', h.length)
				expect(result.content[0]).toHaveProperty('text', '')
			})
		})

		const texts: string[] = [ 'Foobar\n', 'Foobar', 'Foo bar', 'Foo\r\n', 'Foo\n\r', 'foo # foobar', ]
		texts.forEach((text: string) => {
			it(`heading create Headling with text ${text}`, () => {
				const markdown = '# ' + text

				const result = parseMarkdown(markdown)

				const expectedText = text.replace('\n', '').replace('\r', '')

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', 'Heading')
				expect(result.content[0]).toHaveProperty('text', expectedText)
			})
		})


		it('parses two headings into multiple heading', () => {
			const markdown = '# foo\n# bar'

			const result = parseMarkdown(markdown)
			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toHaveProperty('type', 'Heading')
			expect(result.content[1]).toHaveProperty('type', 'Heading')
		})

	})

	describe('parse paragraph', () => {
		it('create paragraph when line starts with normal text', () => {
			const markdown = 'lorem ipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).toHaveLength(1)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem ipsum')
		})

		it('create paragraph when multiple line starts with normal text', () => {
			const markdown = 'lorem\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).toHaveLength(3)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Newline')
			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', 'ipsum')
		})

		it('create new paragraph for every empty line', () => {
			const markdown = 'lorem\n\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toHaveProperty('type', 'Paragraph')
			expect(result.content[1]).toHaveProperty('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).toHaveLength(1)
			expect((result.content[1] as Paragraph).content).toHaveLength(1)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
			expect((result.content[1] as Paragraph).content[0]).toHaveProperty('content', 'ipsum')
		})

		it('create new paragraph for every empty line that contains only whitespaces', () => {
			const markdown = 'lorem\n    \t\nipsum'

			const result = parseMarkdown(markdown)

			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toHaveProperty('type', 'Paragraph')
			expect(result.content[1]).toHaveProperty('type', 'Paragraph')
			expect((result.content[0] as Paragraph).content).toHaveLength(1)
			expect((result.content[1] as Paragraph).content).toHaveLength(1)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
			expect((result.content[1] as Paragraph).content[0]).toHaveProperty('content', 'ipsum')
		})
	})

	it('parses a multiline code block that starts and ends with triple-backquote', () => {
		const markdown = '```\nlorem ipsum\ndolor sit amet\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).toHaveLength(1)
		expect(result.content[0]).toHaveProperty('type', 'Preformatted')

		const preformattedContent = (result.content[0] as Preformatted).content
		expect(preformattedContent).toHaveLength(3)
		expect(preformattedContent[0]).toHaveProperty('content', 'lorem ipsum')
		expect(preformattedContent[1]).toHaveProperty('type', 'Newline')
		expect(preformattedContent[2]).toHaveProperty('content', 'dolor sit amet')
	})

	it('parses github-style highlighted code blocks into the default option', () => {
		const markdown = '```javascript\nlorem ipsum\n```'

		const result = parseMarkdown(markdown)

		expect(result.content.filter(c => c.type === 'Preformatted')).toHaveLength(1)
		expect(result.content[0]).toHaveProperty('type', 'Preformatted')

		const options = (result.content[0] as Preformatted).options
		expect(options).toHaveProperty('default', 'javascript')
	})

	describe('horizontal rule', () => {
		it('parses --- as horizontal rule', () => {
			const markdown = '---\n'
	
			const result = parseMarkdown(markdown)
	
			expect(result.content.filter(c => c.type === 'HorizontalRule')).toHaveLength(1)
			expect(result.content[0]).toHaveProperty('type', 'HorizontalRule')
		})
	})

	const blocks: string[][] = [ [ '^', 'Aside', ], [ '>', 'Blockquote', ], ]
	blocks.forEach(block => {
		describe('parse ' + block[1], () => {
			it(`adds an ${block[1]} when the line starts with a ${block[0]} character`, () => {
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown)

				expect(result.content).toHaveLength(1)
				expect(result.content[0]).toHaveProperty('type', block[1])
			})

			it(`adds a paragraph with the first line to the ${block[1]}`, () => {
				const markdown = `${block[0]} lorem`

				const result = parseMarkdown(markdown)

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).toHaveLength(1)
				expect(blockContent[0]).toHaveProperty('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content).toHaveLength(1)
				expect((blockContent[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
			})

			it(`adds more content to existing ${block[1]}`, () => {
				const markdown = `${block[0]} lorem\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).toHaveLength(1)
				expect(blockContent[0]).toHaveProperty('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content).toHaveLength(3)
				expect((blockContent[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
				expect((blockContent[0] as Paragraph).content[1]).toHaveProperty('type', 'Newline')
				expect((blockContent[0] as Paragraph).content[2]).toHaveProperty('content', 'ipsum')
			})

			it(`adds a second paragraph to existing ${block[1]}, even when there is no space after ${block[0]}`, () => {
				const markdown = `${block[0]} lorem\n${block[0]}\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', block[1])

				const blockContent = (result.content[0] as Block).content
				expect(blockContent).toHaveLength(2)
				expect(blockContent[0]).toHaveProperty('type', 'Paragraph')
				expect(blockContent[1]).toHaveProperty('type', 'Paragraph')
				expect((blockContent[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')
				expect((blockContent[1] as Paragraph).content[0]).toHaveProperty('content', 'ipsum')
			})

			it(`creates a second ${block[0]} when there is content in between`, () => {
				const markdown = `${block[0]} lorem\n\n${block[0]} ipsum`

				const result = parseMarkdown(markdown)

				const blocks = result.content.filter(c => c.type === block[1])
				expect(blocks).toHaveLength(2)

				const blockContent1 = (blocks[0] as Block).content
				expect(blockContent1).toHaveLength(1)
				expect(blockContent1[0]).toHaveProperty('type', 'Paragraph')
				expect((blockContent1[0] as Paragraph).content).toHaveLength(1)
				expect((blockContent1[0] as Paragraph).content[0]).toHaveProperty('content', 'lorem')

				const blockContent2 = (blocks[1] as Block).content
				expect(blockContent2).toHaveLength(1)
				expect(blockContent2[0]).toHaveProperty('type', 'Paragraph')
				expect((blockContent2[0] as Paragraph).content).toHaveLength(1)
				expect((blockContent2[0] as Paragraph).content[0]).toHaveProperty('content', 'ipsum')
			})
		})
	})

	describe('paragraph content: bold text', () => {
		const boldTags: string[] = [ '**', '__', ]
		boldTags.forEach(tag => {
			it(`parses ${tag} as bold text`, () => {
				const markdown = `text ${tag}bold text${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).toHaveLength(3)
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Bold')
				assertTextContent((result.content[0] as Paragraph).content[1], 'bold text')

				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
			})
		})

		const unclosedBoldStrings = [ '**not bold', '**not bold__', ]
		unclosedBoldStrings.forEach(notBold => {
			it(`does not render "${notBold}" as bold`, () => {
				const markdown = 'text before ' + notBold

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				paragraph.content.forEach(c => expect(c).toHaveProperty('type', 'Text'))
				const textContent = paragraph.content.map(c => (c as TextContent)['content']).join('')
				expect(textContent).toEqual(markdown)
			})
		})

		const boldStringsWithSpaces = [ '**bold **', '** bold**', '** bold **', ]
		boldStringsWithSpaces.forEach(bold => {
			it(`renders "${bold}" (with spaces) as bold`, () => {
				const markdown = 'text before ' + bold

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				expect(paragraph.content).toHaveLength(2)
				expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Bold')
				assertTextContent((result.content[0] as Paragraph).content[1], bold.replace(/\*\*/g, ''))
			})
		})

		it('can parse a second bold block in the same line', () => {
			const result = parseMarkdown('**bold 1** other text **bold 2**')
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(3)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Bold')
			assertTextContent((result.content[0] as Paragraph).content[0], 'bold 1')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('content', ' other text ')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Bold')
			assertTextContent((result.content[0] as Paragraph).content[2], 'bold 2')
		})
	})

	describe('paragraph content: italic text', () => {
		const italicTags: string[] = [ '*', '_', ]
		italicTags.forEach(tag => {
			it(`parses ${tag} as italic text`, () => {
				const markdown = `text ${tag}italic text${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).toHaveLength(3)
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Italic')
				assertTextContent((result.content[0] as Paragraph).content[1], 'italic text')

				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
			})
		})

		const unclosedItalicStrings = [ '*not italic', '*not italic_', ]
		unclosedItalicStrings.forEach(notItalic => {
			it(`does not render "${notItalic}" as italic`, () => {
				const markdown = 'text before ' + notItalic

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				paragraph.content.forEach(c => expect(c).toHaveProperty('type', 'Text'))
				const textContent = paragraph.content.map(c => (c as TextContent)['content']).join('')
				expect(textContent).toEqual(markdown)
			})
		})

		const italicStringsWithSpaces = [ '*italic *', '* italic*', '* italic *', ]
		italicStringsWithSpaces.forEach(italic => {
			it(`renders "${italic}" (with spaces) as italic`, () => {
				const markdown = 'text before ' + italic

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				const paragraph: Paragraph = (result.content[0] as Paragraph)
				expect(paragraph.content).toHaveLength(2)
				expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Italic')
				assertTextContent((result.content[0] as Paragraph).content[1], italic.replace(/\*/g, ''))
			})
		})

		it('can parse a second italic block in the same line', () => {
			const result = parseMarkdown('*italic 1* other text *italic 2*')
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(3)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Italic')
			assertTextContent((result.content[0] as Paragraph).content[0], 'italic 1')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('content', ' other text ')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Italic')
			assertTextContent((result.content[0] as Paragraph).content[2], 'italic 2')
		})
	})

	it(`parses ~~ as strike-through text`, () => {
		const markdown = `text ~~strike-through text~~ text`

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(3)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'StrikeThrough')
		assertTextContent((result.content[0] as Paragraph).content[1], 'strike-through text')

		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
	})

	it('can mix strike-through, bold and italic', () => {
		const markdown = `~~text **bold**_**bold-italic**_~~`

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(1)
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'StrikeThrough')

		const strikeThroughContent = ((result.content[0] as Paragraph).content[0] as StrikeThroughTextContent).content
		expect(strikeThroughContent).toHaveLength(3)

		expect(strikeThroughContent[0]).toHaveProperty('type', 'Text')
		expect(strikeThroughContent[0]).toHaveProperty('content', 'text ')

		expect(strikeThroughContent[1]).toHaveProperty('type', 'Bold')
		assertTextContent(strikeThroughContent[1], 'bold')

		expect(strikeThroughContent[2]).toHaveProperty('type', 'Italic')
		expect((strikeThroughContent[2] as ItalicTextContent).content[0]).toHaveProperty('type', 'Bold')
		assertTextContent((strikeThroughContent[2] as ItalicTextContent).content[0], 'bold-italic')
	})

	it('parses two spaces at the end of the line as NewLine', () => {
		const markdown = 'text  '

		const result = parseMarkdown(markdown)
		assume(result.content).toHaveLength(1)
		assume(result.content[0]).toHaveProperty('type', 'Paragraph')

		expect((result.content[0] as Paragraph).content).toHaveLength(2)

		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
		expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text')

		expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'LineBreak')
	})

	describe('paragraph content: inline code', () => {
		const inlineCodeTags = [ '`', '``', '```', ]
		inlineCodeTags.forEach(tag => {
			it(`parses ${tag} as inline code`, () => {
				const markdown = `text ${tag}code (preformatted)${tag} text`

				const result = parseMarkdown(markdown)
				assume(result.content).toHaveLength(1)
				assume(result.content[0]).toHaveProperty('type', 'Paragraph')

				expect((result.content[0] as Paragraph).content).toHaveLength(3)
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

				expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'InlineCode')
				const inlineCode = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
				expect(inlineCode.content).toHaveLength(1)
				expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
				expect(inlineCode.content[0]).toHaveProperty('content', 'code (preformatted)')

				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
				expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
			})
		})
		it('parses inline code and bold correctly', () => {
			const markdown = 'text `code (preformatted)` text **bold text**'

			const result = parseMarkdown(markdown)
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(4)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'InlineCode')
			const inlineCode = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
			expect(inlineCode.content).toHaveLength(1)
			expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
			expect(inlineCode.content[0]).toHaveProperty('content', 'code (preformatted)')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).toHaveProperty('type', 'Bold')
			assertTextContent((result.content[0] as Paragraph).content[3], 'bold text')
		})
		it('parses bold and inline code correctly', () => {
			const markdown = 'text **bold text** text `code (preformatted)`'

			const result = parseMarkdown(markdown)
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(4)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'Bold')
			assertTextContent((result.content[0] as Paragraph).content[1], 'bold text')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).toHaveProperty('type', 'InlineCode')
			const inlineCode = (((result.content[0] as Paragraph).content[3] as InlineCodeTextContent))
			expect(inlineCode.content).toHaveLength(1)
			expect(inlineCode.content[0]).toHaveProperty('type', 'Text')
			expect(inlineCode.content[0]).toHaveProperty('content', 'code (preformatted)')
		})
		it('parses two inline code blocks with different start tags', () => {
			const markdown = 'text `code 1` text ``code 2``'

			const result = parseMarkdown(markdown)
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(4)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'InlineCode')
			const inlineCode1 = (((result.content[0] as Paragraph).content[1] as InlineCodeTextContent))
			expect(inlineCode1.content).toHaveLength(1)
			expect(inlineCode1.content[0]).toHaveProperty('type', 'Text')
			expect(inlineCode1.content[0]).toHaveProperty('content', 'code 1')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text ')

			expect((result.content[0] as Paragraph).content[3]).toHaveProperty('type', 'InlineCode')
			const inlineCode2 = (((result.content[0] as Paragraph).content[3] as InlineCodeTextContent))
			expect(inlineCode2.content).toHaveLength(1)
			expect(inlineCode2.content[0]).toHaveProperty('type', 'Text')
			expect(inlineCode2.content[0]).toHaveProperty('content', 'code 2')
		})
	})

	describe('paragraph content: other', () => {
		it('parses simple link', () => {
			const markdown = 'text [description](href) text'

			const result = parseMarkdown(markdown)
			assume(result.content).toHaveLength(1)
			assume(result.content[0]).toHaveProperty('type', 'Paragraph')

			expect((result.content[0] as Paragraph).content).toHaveLength(3)
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text ')

			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('type', 'InlineLink')
			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('description', 'description')
			expect((result.content[0] as Paragraph).content[1]).toHaveProperty('href', 'href')

			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[2]).toHaveProperty('content', ' text')
		})
	})


	describe('document options', () => {
		it('parses options at the start of the document as document options', () => {
			const markdown = '{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).toHaveProperty('foo', 'bar')
		})

		it('does not parse document options not at the start of the document', () => {
			const markdown = '\n{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).not.toHaveProperty('foo', 'bar')
		})
		
		it('does not parse document options on a different element', () => {
			const markdown = '#{ foo=bar }\ntext'
			
			const result = parseMarkdown(markdown)
			
			expect(result.options).not.toHaveProperty('foo', 'bar')
		})

		it('parses text after the document options as paragraph', () => {
			const markdown = '{ foo=bar }text'
			
			const result = parseMarkdown(markdown)
			
			assume(result.options).toHaveProperty('foo', 'bar')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('type', 'Text')
			expect((result.content[0] as Paragraph).content[0]).toHaveProperty('content', 'text')
		})
	})
})
