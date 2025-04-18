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

import { Parser } from "../../../src/element"
import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"

describe('Options Integration Tests', () => {
	[
		{ element: 'Emphasis', before: '_', after: 'some content_'},
		{ element: 'Emphasis', before: '*', after: 'some content*'},
		{ element: 'StrongEmphasis', before: '__', after: 'some content__'},
		{ element: 'StrongEmphasis', before: '**', after: 'some content**'},
		{ element: 'Heading', before: '#', after: ' some content' },
		{ element: 'Heading', before: '###', after: ' some content' },
		{ element: 'Paragraph', before: '', after: 'some content' },
		{ element: 'Paragraph', before: '', after: '' },
		{ element: 'CustomInline', before: '{{ some content }}', after: '' },
	].forEach(testCase => {
		describe(`Element "${testCase.element}" (${testCase.before}{options...}${testCase.after})`, () => {
			it('can parse options block on the element', () => {
				const text = `${testCase.before}{ val0; key1  = val1;\tkey2=val2   }${testCase.after}`
				const result = parseAll(testCase.element, text)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('asText', text)
				expect(result!.parsedRange.asString()).toEqual(text)

				expect(result!.options).toHaveProperty('keys', [ 'default', 'key1', 'key2' ])
				expect(result!.options.get('default')).toEqual('val0')
				expect(result!.options.get('key1')).toEqual('val1')
				expect(result!.options.get('key2')).toEqual('val2')
			})
			it('can parse empty options block on the element', () => {
				const text = `${testCase.before}{}${testCase.after}`
				const result = parseAll(testCase.element, text)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('asText', text)
				expect(result!.parsedRange.asString()).toEqual(text)

				expect(result!.options).toHaveProperty('keys', [])
			})
			it('cannot parse unclosed options', () => {
				const text = `${testCase.before}{ val0; key1  = val1;\tkey2=val2   ${testCase.after}`
				const result = parseAll(testCase.element, text)
	
				expect(result).not.toBeNull()
				if(testCase.after.length > 0) {
					expect(result).toHaveProperty('asText', text)
					expect(result!.parsedRange.asString()).toEqual(text)
				}

				expect(result!.options).toHaveProperty('keys', [])
			})
			it('cannot parse options that are not at the correct place', () => {
				const text = `${testCase.before}content{ val0; key1  = val1;\tkey2=val2   }${testCase.after}`
				const result = parseAll(testCase.element, text)
	
				if(result != null) {
					//Yep, I know, if in tests... But in this case, we really
					//don't know whether this text can be parsed at all.
					if(testCase.after.length > 0) {
						expect(result).toHaveProperty('asText', text)
						expect(result!.parsedRange.asString()).toEqual(text)
					}
					expect(result!.options).toHaveProperty('keys', [])
				}
			})
		})
	})
})
