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
