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

import { parseMarkdown, Table } from '../../src/legacy/parseMarkdown'
import {assertTextContent} from './assertion.textContent'

const assume = expect

describe.skip('parseMarkdown: Tables', () => {
	it('parses empty table as table', () => {
		const markdown = '| abc | def |\n|-|- |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).toHaveLength(2)
		expect(table.headings[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[0].content[0]).toHaveProperty('content', 'abc')

		expect(table.headings[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[1].content[0]).toHaveProperty('content', 'def')
	})

	it('parses table with two rows', () => {
		const markdown = '| abc | def |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.rows).toHaveLength(2)
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).toHaveProperty('content', '1,2')

		expect(table.rows[1].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[1].columns[0].content[0]).toHaveProperty('content', '2,1')

		expect(table.rows[1].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[1].columns[1].content[0]).toHaveProperty('content', '2,2')
	})

	it('parses table with no headers', () => {
		const markdown = '|-|- |\n|1,1| 1,2    |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).toHaveLength(0)

		expect(table.rows).toHaveLength(1)
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).toHaveProperty('content', '1,2')
	})

	it('parses table options after first row', () => {
		const markdown = '| abc | def |{chart;type=bars}\n|-|- |'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).toHaveLength(2)
		expect(table.headings[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[1].content[0]).toHaveProperty('content', 'def')

		expect(table.options).toHaveProperty('default', 'chart')
		expect(table.options).toHaveProperty('type', 'bars')
	})

	it('parses table with empty column', () => {
		const markdown = '|-|-|-|\n|1,1|   |1,3|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).toHaveLength(0)

		expect(table.rows).toHaveLength(1)
		expect(table.rows[0].columns).toHaveLength(3)
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('content', '1,1')

		expect(table.rows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[1].content[0]).toHaveProperty('content', '')

		expect(table.rows[0].columns[2].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[2].content[0]).toHaveProperty('content', '1,3')
	})

	it('parses table and keeps last column even without last pipe', () => {
		const markdown = '|-|-|-|\n|1,1|   |1,3'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.headings).toHaveLength(0)

		expect(table.rows).toHaveLength(1)
		expect(table.rows[0].columns).toHaveLength(3)
		expect(table.rows[0].columns[2].content[0]).toHaveProperty('type', 'Text')
		expect(table.rows[0].columns[2].content[0]).toHaveProperty('content', '1,3')
	})

	it('parses paragraph content in table header', () => {
		const markdown = '| **abc** | def `ghi` |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		assume(table.headings).toHaveLength(2)

		expect(table.headings[0].content).toHaveLength(1)
		expect(table.headings[0].content[0]).toHaveProperty('type', 'Bold')
		assertTextContent(table.headings[0].content[0], 'abc')

		expect(table.headings[1].content).toHaveLength(2)
		expect(table.headings[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[1].content[0]).toHaveProperty('content', 'def ')

		expect(table.headings[1].content[1]).toHaveProperty('type', 'InlineCode')
	})

	it('parses paragraph content in table content', () => {
		const markdown = '| abc | def |\n|-|- |\n|**1,1**| 1,2    |\n||2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		assume(table.rows).toHaveLength(2)
		expect(table.rows[0].columns[0].content[0]).toHaveProperty('type', 'Bold')
		assertTextContent(table.rows[0].columns[0].content[0], '1,1')
	})

	it('starts a new table after an empty line', () => {
		const markdown = '| abc | def |\n|-|-|\n\n| ghi | jkl |\n|-|-|'

		const result = parseMarkdown(markdown)

		expect(result.content).toHaveLength(3)

		assume(result.content[0]).toHaveProperty('type', 'Table')

		expect(result.content[2]).toHaveProperty('type', 'Table')
		const table = result.content[2] as Table

		expect(table.headings[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[0].content[0]).toHaveProperty('content', 'ghi')

		expect(table.headings[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headings[1].content[0]).toHaveProperty('content', 'jkl')
	})

	it('does not parse content as table when delimiters are missing', () => {
		const markdown = '| abc | def |\n| ghi | jkl |\n'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Paragraph')
	})

	it('creates number of columns from delimiter row in each row', () => {
		const markdown = '|foo|bar|baz\n|-|-|\n| abc |\n|def| ghi | jkl |\n'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.rows[0].columns).toHaveLength(2)
		expect(table.rows[1].columns).toHaveLength(2)
		expect(table.headings).toHaveLength(2)
	})

	it('parses delimiters with correct alignment', () => {
		const markdown = '|-|:-|:-:|-:|\n| abc |\n'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as Table

		expect(table.columns).toHaveLength(4)
		expect(table.columns?.[0]).toHaveProperty('align', 'left')
		expect(table.columns?.[1]).toHaveProperty('align', 'left')
		expect(table.columns?.[2]).toHaveProperty('align', 'center')
		expect(table.columns?.[3]).toHaveProperty('align', 'right')
	})
})
