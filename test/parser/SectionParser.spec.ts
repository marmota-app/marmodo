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

import { parseAll } from "../parse"

describe('SectionParser', () => {
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
})
