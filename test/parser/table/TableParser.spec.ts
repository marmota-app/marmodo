/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Table } from "../../../src/element"
import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"
import { expectUpdate, expectUpdates } from "../../update/expectUpdate"

describe('TableParser', () => {
	describe('parsing the content', () => {
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

	describe('parsing updates', () => {
		const parser = new Parsers().Table

		expectUpdate(
			parser,
			'a | b\n-|-\nc | d\n\nmore text',
			{ text: 'e | f\n', rangeOffset: 'a | b\n-|-\nc | d\n'.length, rangeLength: 0 }
		).canBeParsed('adding a new line to the table', table => {
			expect(table.rows).toEqual(2)
			expect(table.tableRows).toHaveLength(2)
		})
		expectUpdate(
			parser,
			'a | b\n-|-\nc | d\n',
			{ text: 'e | f\n', rangeOffset: 'a | b\n-|-\nc | d\n'.length, rangeLength: 0 }
		).canBeParsed('adding a new line to the table, at the end of the content', table => {
			expect(table.rows).toEqual(2)
			expect(table.tableRows).toHaveLength(2)
		})
		expectUpdates(
			parser,
			'a | b\n-|-\nc | d', [
				{ text: '\n', rangeOffset: 'a | b\n-|-\nc | d'.length, rangeLength: 0 },
				{ text: 'e', rangeOffset: 'a | b\n-|-\nc | d\n'.length, rangeLength: 0 },
			]
		).canBeParsed('adding new table line, starting with "e"', table => {
			expect(table.rows).toEqual(2)
			expect(table.tableRows).toHaveLength(2)
		})
		expectUpdates(
			parser,
			'a | b\n-|-\nc | d', [
				{ text: '\n', rangeOffset: 'a | b\n-|-\nc | d'.length, rangeLength: 0 },
				{ text: '|', rangeOffset: 'a | b\n-|-\nc | d\n'.length, rangeLength: 0 },
				{ text: 'e', rangeOffset: 'a | b\n-|-\nc | d\n|'.length, rangeLength: 0 },
			]
		).canBeParsed('adding new table line, starting with pipe', table => {
			expect(table.rows).toEqual(2)
			expect(table.tableRows).toHaveLength(2)
		})
	})
})
