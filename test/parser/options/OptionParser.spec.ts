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

import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"
import { replaceWhitespace } from "../../replaceWhitespace"
import { expectUpdate } from "../../update/expectUpdate"

describe('Option', () => {
	describe('All Options, including first', () => {
		it('parses a single word as a default option', () => {
			const result = parseAll('FirstOption', 'val')
	
			expect(result).toHaveProperty('asText', 'val')
			expect(result).toHaveProperty('valid', true)
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val')
		})
		it('does not parse empty text as option', () => {
			const result = parseAll('FirstOption', '')
	
			expect(result).toBeNull()
		})
		it('stops parsing at a semicolon', () => {
			const result = parseAll('FirstOption', 'val;more content')
	
			expect(result).toHaveProperty('asText', 'val;')
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val')
		})
		it('trims the spaces from a default option', () => {
			const result = parseAll('FirstOption', ' \tval  ')
	
			expect(result).toHaveProperty('asText', ' \tval  ')
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val')
		})
		it('parses a different value as default option', () => {
			const result = parseAll('FirstOption', 'val1')
	
			expect(result).toHaveProperty('asText', 'val1')
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val1')
		})
		it('parses a different value as default option, up until a semicolon', () => {
			const result = parseAll('FirstOption', '  val1 \t;more content')
	
			expect(result).toHaveProperty('asText', '  val1 \t;')
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val1')
		});
		['}', '\r', '\n'].forEach(delimiter => it(`stops parsing options at delimiter "${replaceWhitespace(delimiter)}"`, () => {
			const result = parseAll('FirstOption', `  val2 \t${delimiter}more content`)
	
			expect(result).toHaveProperty('asText', '  val2 \t')
			expect(result).toHaveProperty('key', 'default')
			expect(result).toHaveProperty('value', 'val2')
		}))

		it('can parse a named option', () => {
			const result = parseAll('FirstOption', 'key1=val1')
	
			expect(result).toHaveProperty('asText', 'key1=val1')
			expect(result).toHaveProperty('key', 'key1')
			expect(result).toHaveProperty('value', 'val1')
		})
		it('can parse a named option with whitespace until delimiter', () => {
			const result = parseAll('FirstOption', '\tkey1 =  val1\t ;more content')
	
			expect(result).toHaveProperty('asText', '\tkey1 =  val1\t ;')
			expect(result).toHaveProperty('key', 'key1')
			expect(result).toHaveProperty('value', 'val1')
		})
	})

	describe('Subsequent options', () => {
		it('cannot parse a default option when it is not the first option', () => {
			const result = parseAll('Option', 'val')
	
			expect(result).toHaveProperty('valid', false)
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().FirstOption

		expectUpdate(
			parser,
			'def val',
			{ text: 'ault', rangeOffset: 'dev'.length, rangeLength: 0 }
		).canBeParsed()
		expectUpdate(
			parser,
			'def val;',
			{ text: '', rangeOffset: 'dev'.length, rangeLength: ' val'.length }
		).canBeParsed()
		expectUpdate(
			parser,
			'key1 = val1;',
			{ text: '', rangeOffset: 'key1 '.length, rangeLength: '= '.length }
		).canBeParsed('changing named option to default option', (o) => {
			expect(o).toHaveProperty('key', 'default')
			expect(o).toHaveProperty('value', 'key1 val1')
		})
		expectUpdate(
			parser,
			'key1 val1;',
			{ text: '= ', rangeOffset: 'key1 '.length, rangeLength: 0 }
		).canBeParsed('changing default option to named option', (o) => {
			expect(o).toHaveProperty('key', 'key1')
			expect(o).toHaveProperty('value', 'val1')
		})

		expectUpdate(
			parser,
			'key1=val1;',
			{ text: '=', rangeOffset: 'key'.length, rangeLength: 0 }
		).cannotBeParsed('adds a second = sign in the key part')
		expectUpdate(
			parser,
			'key1=val1;',
			{ text: '=', rangeOffset: 'key1=val'.length, rangeLength: 0 }
		).cannotBeParsed('adds a second = sign in the value part')
		expectUpdate(
			parser,
			'key1=val1;more text',
			{ text: '}', rangeOffset: 'key1=val'.length, rangeLength: 0 }
		).cannotBeParsed('inserts } into the option')
		expectUpdate(
			parser,
			'key1=val1;more text',
			{ text: ';', rangeOffset: 'key1=val'.length, rangeLength: 0 }
		).cannotBeParsed('inserts ; into the option')
		expectUpdate(
			parser,
			'key1=val1}more text',
			{ text: '', rangeOffset: 'key1=val1'.length, rangeLength: 1 }
		).cannotBeParsed('deletes } from the end of the option')
		expectUpdate(
			parser,
			'key1=val1;more text',
			{ text: '', rangeOffset: 'key1=val1'.length, rangeLength: 1 }
		).cannotBeParsed('deletes ; from the end of the option')
	})
})
