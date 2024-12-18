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

import { Table } from '../../src/element'
import { parseMarkdown } from '../../src/legacy/parseMarkdown'
import {assertTextContent} from './assertion.textContent'

const assume = expect

describe('parseMarkdown: Tables', () => {
	it('parses empty table as table', () => {
		const markdown = '| abc | def |\n|-|- |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.headers?.columns).toHaveLength(2)
		expect(table.headers?.columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[0].content[0]).toHaveProperty('textContent', ' abc ')

		expect(table.headers?.columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[1].content[0]).toHaveProperty('textContent', ' def ')
	})

	it('parses table with two rows', () => {
		const markdown = '| abc | def |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.tableRows).toHaveLength(2)
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('textContent', '1,1')

		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('textContent', ' 1,2    ')

		expect(table.tableRows[1].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[1].columns[0].content[0]).toHaveProperty('textContent', '2,1')

		expect(table.tableRows[1].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[1].columns[1].content[0]).toHaveProperty('textContent', '2,2')
	})

	it('parses table with no headers', () => {
		const markdown = '|-|- |\n|1,1| 1,2    |'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.headers).toBeNull()

		expect(table.tableRows).toHaveLength(1)
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('textContent', '1,1')

		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('textContent', ' 1,2    ')
	})

	it('parses table options after first row', () => {
		const markdown = '| abc | def |\n|-|- |{chart;type=bars}'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.headers?.columns).toHaveLength(2)
		expect(table.headers?.columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[1].content[0]).toHaveProperty('textContent', ' def ')

		expect(table.options.get('default')).toEqual('chart')
		expect(table.options.get('type')).toEqual('bars')
	})

	it('parses table with empty column', () => {
		const markdown = '|-|-|-|\n|1,1|   |1,3|'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.headers).toBeNull()

		expect(table.tableRows).toHaveLength(1)
		expect(table.tableRows[0].columns).toHaveLength(3)
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('textContent', '1,1')

		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[1].content[0]).toHaveProperty('textContent', '   ')

		expect(table.tableRows[0].columns[2].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[2].content[0]).toHaveProperty('textContent', '1,3')
	})

	it('parses table and keeps last column even without last pipe', () => {
		const markdown = '|-|-|-|\n|1,1|   |1,3'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as  Table

		expect(table.headers).toBeNull()

		expect(table.tableRows).toHaveLength(1)
		expect(table.tableRows[0].columns).toHaveLength(3)
		expect(table.tableRows[0].columns[2].content[0]).toHaveProperty('type', 'Text')
		expect(table.tableRows[0].columns[2].content[0]).toHaveProperty('textContent', '1,3')
	})

	it('parses paragraph content in table header', () => {
		const markdown = '| **abc** | def _ghi_ |\n|-|- |\n|1,1| 1,2    |\n|2,1|2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		assume(table.headers?.columns).toHaveLength(2)

		expect(table.headers?.columns[0].content).toHaveLength(3)
		expect(table.headers?.columns[0].content[1]).toHaveProperty('type', 'StrongEmphasis')
		assertTextContent(table.headers?.columns[0].content[1], 'abc')

		expect(table.headers?.columns[1].content).toHaveLength(3)
		expect(table.headers?.columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[1].content[0]).toHaveProperty('textContent', ' def ')

		expect(table.headers?.columns[1].content[1]).toHaveProperty('type', 'Emphasis')
	})

	it('parses paragraph content in table content', () => {
		const markdown = '| abc | def |\n|-|- |\n|**1,1**| 1,2    |\n||2,2|'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		assume(table.tableRows).toHaveLength(2)
		expect(table.tableRows[0].columns[0].content[0]).toHaveProperty('type', 'StrongEmphasis')
		assertTextContent(table.tableRows[0].columns[0].content[0], '1,1')
	})

	it('starts a new table after an empty line', () => {
		const markdown = '| abc | def |\n|-|-|\n\n| ghi | jkl |\n|-|-|'

		const result = parseMarkdown(markdown)

		expect(result.content).toHaveLength(2)

		assume(result.content[0]).toHaveProperty('type', 'Table')

		expect(result.content[1]).toHaveProperty('type', 'Table')
		const table = result.content[1] as unknown as Table

		expect(table.headers?.columns[0].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[0].content[0]).toHaveProperty('textContent', ' ghi ')

		expect(table.headers?.columns[1].content[0]).toHaveProperty('type', 'Text')
		expect(table.headers?.columns[1].content[0]).toHaveProperty('textContent', ' jkl ')
	})

	it('does not parse content as table when delimiters are missing', () => {
		const markdown = '| abc | def |\n| ghi | jkl |\n'

		const result = parseMarkdown(markdown)

		expect(result.content[0]).toHaveProperty('type', 'Paragraph')
	})

	it('parses delimiters with correct alignment', () => {
		const markdown = '|-|:-|:-:|-:|\n| abc |\n'

		const result = parseMarkdown(markdown)

		assume(result.content[0]).toHaveProperty('type', 'Table')
		const table = result.content[0] as unknown as Table

		expect(table.delimiters.columns).toHaveLength(4)
		expect(table.delimiters.columns?.[0]).toHaveProperty('alignment', 'left')
		expect(table.delimiters.columns?.[1]).toHaveProperty('alignment', 'left')
		expect(table.delimiters.columns?.[2]).toHaveProperty('alignment', 'center')
		expect(table.delimiters.columns?.[3]).toHaveProperty('alignment', 'right')
	})
})
