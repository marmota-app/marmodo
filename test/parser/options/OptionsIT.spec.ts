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
		{ element: 'CustomInline', before: '{{ some content }}', after: '' },
	].forEach(testCase => {
		describe(`Element "${testCase.element}" (${testCase.before}{options...}${testCase.after})`, () => {
			it('can parse options block on the element', () => {
				const text = `${testCase.before}{ val0; key1  = val1;\tkey2=val2   }${testCase.after}`
				const result = parseAll(testCase.element, text)

				expect(result).not.toBeNull()
				expect(result).toHaveProperty('asText', text)

				expect(result!.options).toHaveProperty('keys', [ 'default', 'key1', 'key2' ])
				expect(result!.options.get('default')).toEqual('val0')
				expect(result!.options.get('key1')).toEqual('val1')
				expect(result!.options.get('key2')).toEqual('val2')
			})
			it('cannot parse unclosed options', () => {
				const text = `${testCase.before}{ val0; key1  = val1;\tkey2=val2   ${testCase.after}`
				const result = parseAll(testCase.element, text)
	
				expect(result).not.toBeNull()
				if(testCase.after.length > 0) { expect(result).toHaveProperty('asText', text) }
	
				expect(result!.options).toHaveProperty('keys', [])
			})
			it('cannot parse options that are not at the correct place', () => {
				const text = `${testCase.before}content{ val0; key1  = val1;\tkey2=val2   }${testCase.after}`
				const result = parseAll(testCase.element, text)
	
				if(result != null) {
					//Yep, I know, if in tests... But in this case, we really
					//don't know whether this text can be parsed at all.
					if(testCase.after.length > 0) { expect(result).toHaveProperty('asText', text) }
					expect(result!.options).toHaveProperty('keys', [])
				}
			})
		})
	})
})
