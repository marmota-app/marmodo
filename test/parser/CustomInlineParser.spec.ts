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

import { parseAll } from "../parse"

describe('CustomInline', () => {
	it('parses a custom inline', () => {
		const result = parseAll('CustomInline', '{{ some text }}')

		expect(result).toHaveProperty('asText', '{{ some text }}')
	})

	it('stops parsing at the closing delimiter', () => {
		const result = parseAll('CustomInline', '{{ some } text }}more text')

		expect(result).toHaveProperty('asText', '{{ some } text }}')
	})
	it('does not parse a custom inline that has no closing delimiter', () => {
		const result = parseAll('CustomInline', '{{ some text }')

		expect(result).toBeNull()
	})
	
	it('can return inner content', () => {
		const result = parseAll('CustomInline', '{{ some } text }}more text')

		expect(result).toHaveProperty('plainContent', ' some } text ')
	})
})
