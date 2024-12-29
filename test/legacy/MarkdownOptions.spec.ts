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