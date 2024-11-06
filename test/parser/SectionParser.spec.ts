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

describe('SectionParser', () => {
	it('parses a single line of text into a section with a single paragraph', () => {
		const parser = new Parsers().Section
		const textContent = new TextContent('some text')

		const section = parser.parse(textContent.start(), textContent.end())

		expect(section?.content).toHaveLength(1)
		const content = section!.content[0]
		expect(content).toHaveProperty('type', 'Paragraph')
		expect(content).toHaveProperty('asText', 'some text')
	})
	it('parses multiple paragraphs into a section', () => {
		const parser = new Parsers().Section
		const textContent = new TextContent('first paragraph\nfirst paragraph\n\nsecond paragraph\n\nthird\nthird paragraph\nthird')

		const section = parser.parse(textContent.start(), textContent.end())

		expect(section?.content).toHaveLength(3)
		expect(section!.content[0]).toHaveProperty('type', 'Paragraph')
		expect(section!.content[0]).toHaveProperty('asText', 'first paragraph\nfirst paragraph\n\n')
		expect(section!.content[1]).toHaveProperty('type', 'Paragraph')
		expect(section!.content[1]).toHaveProperty('asText', 'second paragraph\n\n')
		expect(section!.content[2]).toHaveProperty('type', 'Paragraph')
		expect(section!.content[2]).toHaveProperty('asText', 'third\nthird paragraph\nthird')
	})
})
