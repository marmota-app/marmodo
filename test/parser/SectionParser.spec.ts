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

import { Section } from "../../src/element"
import { Parsers } from "../../src/parser/Parsers"
import { parseAll } from "../parse"
import { expectUpdate } from "../update/expectUpdate"

describe('SectionParser', () => {
	describe('parsing the content', () => {
		it('parses a single line of text into a section with a single paragraph', () => {
			const section = parseAll('Section', 'some text')
	
			expect(section).toHaveChildren([
				{ type: 'Paragraph', asText: 'some text' }
			])
		})
	
		it('parses multiple paragraphs into a section', () => {
			const section = parseAll('Section', 'first paragraph\nfirst paragraph\n\nsecond paragraph\n\nthird\nthird paragraph\nthird')
	
			expect(section).toHaveChildren([
				{ type: 'Paragraph', asText: 'first paragraph\nfirst paragraph\n\n' },
				{ type: 'Paragraph', asText: 'second paragraph\n\n' },
				{ type: 'Paragraph', asText: 'third\nthird paragraph\nthird' },
			])
		})

		it('can start a section with a heading', () => {
			const section = parseAll('Section', '# Heading\n\nfirst paragraph\nfirst paragraph\n\n') as Section
	
			expect(section).toHaveChildren([
				{ type: 'Heading', level: 1, asText: '# Heading\n\n'},
				{ type: 'Paragraph', asText: 'first paragraph\nfirst paragraph\n\n' },
			])
			expect(section?.level).toEqual(1)
		})
		it('parses inner section at lower-level heading', () => {
			const section = parseAll('Section', 'first paragraph\nfirst paragraph\n\n## inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph')
	
			expect(section).toHaveChildren([
				{ type: 'Paragraph', asText: 'first paragraph\nfirst paragraph\n\n' },
				{ type: 'Section', level: 2, asText: '## inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph' },
			])
		})
		it('starts a new inner section at inner heading level (2, 2)', () => {
			const section = parseAll('Section', 'first paragraph\nfirst paragraph\n\n## inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph\n\n## inner section 2')
	
			expect(section).toHaveChildren([
				{ type: 'Paragraph', asText: 'first paragraph\nfirst paragraph\n\n' },
				{ type: 'Section', level: 2, asText: '## inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph\n\n' },
				{ type: 'Section', level: 2, asText: '## inner section 2' },
			])
		})
		it('starts a new inner section at inner heading level (3, 2)', () => {
			const section = parseAll('Section', 'first paragraph\nfirst paragraph\n\n### inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph\n\n## inner section 2')
	
			expect(section).toHaveChildren([
				{ type: 'Paragraph', asText: 'first paragraph\nfirst paragraph\n\n' },
				{ type: 'Section', level: 3, asText: '### inner heading\n\nsecond paragraph\n\nthird paragraph\nthird paragraph\n\n' },
				{ type: 'Section', level: 2, asText: '## inner section 2' },
			])
		})
		it('ends section at heading with same level', () => {
			const section = parseAll('Section', '# s1\n\ncontent\n\n# s2\n\nmore content')
	
			expect(section).toHaveChildren([
				{ type: 'Heading', level: 1, asText: '# s1\n\n' },
				{ type: 'Paragraph', asText: 'content\n\n' },
			])
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Section

		expectUpdate(
			parser,
			'line 1\nline 2\n',
			{ text: '\n## heading\n', rangeOffset: 'line 1'.length, rangeLength: 0}
		).canBeParsed('Inserts a sub-heading inside the section')
		expectUpdate(
			parser,
			'# heading\nline 1\nline 2\n\n# heading\nnext section',
			{ text: '', rangeOffset: '#heading\nline '.length, rangeLength: '1\nl'.length}
		).canBeParsed('Changes section content')

		expectUpdate(
			parser,
			'# heading\nline 1\nline 2\n\n# heading\nnext section',
			{ text: '', rangeOffset: 0, rangeLength: '# '.length}
		).cannotBeParsed('Removes heading of first section')
		expectUpdate(
			parser,
			'# heading\nline 1\nline 2\n\n# heading\nnext section',
			{ text: '#', rangeOffset: 1, rangeLength: 0}
		).cannotBeParsed('Updates section level')
		expectUpdate(
			parser,
			'# heading\nline 1\nline 2\n\n## heading\nnext section',
			{ text: '', rangeOffset: '# heading\nline 1\nline 2\n\n#'.length, rangeLength: 1}
		).cannotBeParsed('Updates section level of second section, removing it from the first')
	})

	describe('Section options', () => {
		it('returns options of the opening element (heading)', () => {
			const section = parseAll('Section', '#{ key1=val1; key2=val2 } Heading\n\nfirst paragraph\nfirst paragraph\n\n') as Section

			expect(section?.level).toEqual(1)
			expect(section.options).toHaveProperty('keys', [ 'key1', 'key2' ])
			expect(section.options.get('key1')).toEqual('val1')
			expect(section.options.get('key2')).toEqual('val2')
		})
		it.skip('does not have options when it was not started with a starting element', () => {
			//TODO: Cannot be implemented yet, the only block element that
			//      supports options right now is a heading... And that's
			//      a starting element of a section.
			//      Implement when there is something like a fenced code
			//      block or a general-purpose block.
		})
	})
})
