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

import { serializeOptions } from '../../src/legacy/MarkdownOptions'
import { ContentOptions } from '../../src/legacy/parseMarkdown'

//The tests here do not test any new code from marmodo, but I'll keep them
//to keep the legacy tests complete
describe('Markdown Options', () => {
	describe('serializeOptions', () => {
		it('serializes empty options to "{}"', () => {
			const options: ContentOptions = {}

			const result = serializeOptions(options)

			expect(result).toEqual('{}')
		})

		it('serializes the default value as default', () => {
			const options: ContentOptions = {
				default: 'val1'
			}

			const result = serializeOptions(options)

			expect(result).toEqual('{val1}')
		})

		it('serializes all options', () => {
			const options: ContentOptions = {
				a: 'val_a',
				default: 'val1',
			}

			const result = serializeOptions(options)

			expect(result).toEqual('{val1;a=val_a}')
		})
	})
})