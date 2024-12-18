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

import { parseAll } from "../../parse"

describe('TableDelimiterColumn', () => {
	it('parses a simple delimiter column', () => {
		const result = parseAll('TableDelimiterColumn', '---')

		expect(result).toHaveProperty('asText', '---')
	})
	it('parses a delimiter column including the starting delimiter', () => {
		const result = parseAll('TableDelimiterColumn', '| ---')

		expect(result).toHaveProperty('asText', '| ---')
	})
	it('stops parsing at the next |', () => {
		const result = parseAll('TableDelimiterColumn', '| :-: | ---')

		expect(result).toHaveProperty('asText', '| :-: ')
	});

	['a', '{', '#', '+'].forEach(ic => it(`does not parse delimiter row that contains illegal character "${ic}"`, () => {
		const result = parseAll('TableDelimiterColumn', `| \t:-${ic}-: | ---`)
		expect(result).toBeNull()
	}))

	it('cannot parse a delimiter with whitespace after the first :', () => {
		const result = parseAll('TableDelimiterColumn', '| : -: | ---')
		expect(result).toBeNull()
	})
	it('cannot parse a delimiter with whitespace after the first -', () => {
		const result = parseAll('TableDelimiterColumn', '| - -: | ---')
		expect(result).toBeNull()
	})
	it('cannot parse a delimiter with : after the second :', () => {
		const result = parseAll('TableDelimiterColumn', '| :--:: | ---')
		expect(result).toBeNull()
	})
	it('cannot parse a delimiter with - after the trailing :', () => {
		const result = parseAll('TableDelimiterColumn', '| --:- | ---')
		expect(result).toBeNull()
	})
	it('cannot parse a delimiter without -', () => {
		const result = parseAll('TableDelimiterColumn', '| :: | ---')
		expect(result).toBeNull()
	});

	[
		['---', 'left'],
		[':--', 'left'],
		[':-:', 'center'],
		['--:', 'right'],
	].forEach(([col, alignment]) => it(`has alignment value "${alignment}" for column "${col}"`, () => {
		const result = parseAll('TableDelimiterColumn', col)
		expect(result).toHaveProperty('alignment', alignment)
	}))
})

describe('TableDelimiterRow', () => {})