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
