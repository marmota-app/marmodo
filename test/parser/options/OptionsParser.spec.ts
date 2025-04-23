/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { MfMOptions } from "../../../src/parser/options/OptionsParser"
import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"
import { expectUpdate } from "../../update/expectUpdate"

describe('Options', () =>  {
	describe('parsing the content', () => {
		it('parses empty options', () => {
			const result = parseAll('Options', '{}')
	
			expect(result).toHaveProperty('asText', '{}')
		})
		it('cannot parse options that do not start with a {', () => {
			const result = parseAll('Options', ' {}')
	
			expect(result).toBeNull()
		})
		it('cannot parse options that start with two {', () => {
			const result = parseAll('Options', '{{val0}}')
	
			expect(result).toBeNull()
		})
		it('parses options until the closing }', () => {
			const result = parseAll('Options', '{}more text') as unknown as MfMOptions
	
			expect(result).toHaveProperty('asText', '{}')
		})
	
		it('parses options with default value', () => {
			const result = parseAll('Options', '{ val0 }more text') as unknown as MfMOptions
	
			expect(result).toHaveProperty('asText', '{ val0 }')
			expect(result).toHaveProperty('keys', [ 'default' ])
			expect(result?.get('default')).toEqual('val0')
		})
		it('parses options with multiple values', () => {
			const result = parseAll('Options', '{ key1=val1; key2=val2 }more text') as unknown as MfMOptions
	
			expect(result).toHaveProperty('asText', '{ key1=val1; key2=val2 }')
			expect(result).toHaveProperty('keys', [ 'key1', 'key2' ])
			expect(result?.get('key1')).toEqual('val1')
			expect(result?.get('key2')).toEqual('val2')
		})
		it('cannot parse default option after the first option', () => {
			const result = parseAll('Options', '{ key1=val1; key2=val2; val0; key3=val3 }more text') as unknown as MfMOptions
			expect(result).toHaveProperty('keys', [ 'key1', 'key2', 'key3' ])
		})
		it('does not parse options beyond the end of the document', () => {
			const result = parseAll('Options', '{')
	
			expect(result).toBeNull()
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Options

		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }',
			{ text: 'val0; ', rangeOffset: '{ '.length, rangeLength: 0 }
		).canBeParsed('inserting a default option')
		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }',
			{ text: 'key3=val3; ', rangeOffset: '{ key1=val1; '.length, rangeLength: 0 }
		).canBeParsed('inserting a named option')
		expectUpdate(
			parser,
			'{ val0; key1=val1; key2=val2 }',
			{ text: '', rangeOffset: '{ '.length, rangeLength: 'val0;'.length }
		).canBeParsed('deleting the default option')
		expectUpdate(
			parser,
			'{ val0; key1=val1; key2=val2 }',
			{ text: '', rangeOffset: '{ val0; '.length, rangeLength: 'key1=val1;'.length }
		).canBeParsed('deleting a named option')

		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }more content',
			{ text: '', rangeOffset: 0, rangeLength: '{'.length }
		).cannotBeParsed('deleting the opening curly brace')
		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }more content',
			{ text: '', rangeOffset: '{ key1=val1; key2=val2 '.length, rangeLength: '}'.length }
		).cannotBeParsed('deleting the closing curly brace')
		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }more content',
			{ text: '}', rangeOffset: '{ key1=val1; key2=val'.length, rangeLength: ''.length }
		).cannotBeParsed('inserting a closing curly brace before the end')
		expectUpdate(
			parser,
			'{ key1=val1; key2=val2 }more content',
			{ text: '\r\n', rangeOffset: '{ key1=val1; key2=val'.length, rangeLength: ''.length }
		).cannotBeParsed('inserting a newline before the end')		
	})
})
