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

import { parseAll } from "../../parse";

interface Inline {
	type: string,
	delimiter: string,
}
type Inlines = { [key: string]: Inline }
const inlines: Inlines = {
	'StrongEmphasis (**)': { type: 'StrongEmphasis', delimiter: '**' },
//	'StrongEmphasis (__)': { parser: 'StrongEmphasis', delimiter: '__' },
}

Object.keys(inlines).forEach(k => describe(k, () => {
	const { type, delimiter } = inlines[k]
	describe('parsing the content', () => {
		it(`parses complete text as inline`, () => {
			const text = `${delimiter}some text${delimiter}`
			const result = parseAll(type, text)

			expect(result).not.toBeNull()
			expect(result).toHaveProperty('type', type)
			expect(result).toHaveProperty('asText', text)
		})
	})
}))
