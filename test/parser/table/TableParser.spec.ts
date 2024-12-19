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

import { Table } from "../../../src/element"
import { parseAll } from "../../parse"

describe('TableParser', () => {
	it('parses a table that only consists of a delimiter row', () => {
		const result = parseAll('Table', '---|:--:|--:|---')

		expect(result).toHaveProperty('asText', '---|:--:|--:|---')
		expect(result).toHaveProperty('columns', 4)
		expect(result).toHaveProperty('rows', 0)
		expect(result).toHaveProperty('delimiters')
	})

	it('parses a table that with header row and delimiter row', () => {
		const result = parseAll('Table', 'a | b | c | d\n---|:--:|--:|---') as Table

		expect(result).toHaveProperty('asText', 'a | b | c | d\n---|:--:|--:|---')
		expect(result).toHaveProperty('columns', 4)
		expect(result).toHaveProperty('rows', 0)
		expect(result).toHaveProperty('delimiters')
		expect(result.delimiters).toHaveProperty('type', 'TableDelimiterRow')

		expect(result).toHaveProperty('headers')
		expect(result?.headers?.columns).toHaveLength(4)
		expect(result?.headers?.columns[1]).toHaveProperty('asText', '| b ')
	})
	it('does not parse a table when the have length 0', () => {
		const result = parseAll('Table', '\n---|:--:|--:|---') as Table
		expect(result).toBeNull()
	})

	it('parses a table with multiple rows', () => {
		const result = parseAll('Table', '---|:--:|--:|---\na | b | c\n|a | b | c | d |\na | b | c | d | e') as Table

		expect(result).toHaveProperty('asText', '---|:--:|--:|---\na | b | c\n|a | b | c | d |\na | b | c | d | e')
		expect(result).toHaveProperty('columns', 4)
		expect(result).toHaveProperty('rows', 3)
		expect(result?.tableRows[0]).toHaveProperty('type', 'TableRow')
		expect(result?.tableRows[1]).toHaveProperty('type', 'TableRow')
		expect(result?.tableRows[2]).toHaveProperty('type', 'TableRow')
	})
	it('stops parsing a table with multiple rows at empty lines', () => {
		const result = parseAll('Table', '---|:--:|--:|---\na | b | c\n|a | b | c | d |\na | b | c | d | e\n\n   \n\t\n|a | b | c | d |') as Table

		expect(result).toHaveProperty('asText', '---|:--:|--:|---\na | b | c\n|a | b | c | d |\na | b | c | d | e\n\n   \n\t\n')
		expect(result).toHaveProperty('columns', 4)
		expect(result).toHaveProperty('rows', 3)
		expect(result?.tableRows[0]).toHaveProperty('type', 'TableRow')
		expect(result?.tableRows[1]).toHaveProperty('type', 'TableRow')
		expect(result?.tableRows[2]).toHaveProperty('type', 'TableRow')
	})

	it('uses the options from the delimiter row as table options', () => {
		const result = parseAll('Table', 'a | b | c | d|\n---|:--:|--:|---|{ val0; key1=val1; key2=val2 }  \na | b | c') as Table

		expect(result).toHaveProperty('asText', 'a | b | c | d|\n---|:--:|--:|---|{ val0; key1=val1; key2=val2 }  \na | b | c')
		expect(result.options).toHaveProperty('keys', [ 'default', 'key1', 'key2' ])
	})
})
