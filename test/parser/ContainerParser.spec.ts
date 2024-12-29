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

import { parseAll } from "../parse"

describe('ContainerParser', () => {
	it('parses empty text into empty containter with one empty section', () => {
		const container = parseAll('Container', 'some text')

		expect(container).toHaveChildren([
			{ type: 'Section' },
		])
	})

	it('parses multiple sections into container', () => {
		const container = parseAll('Container', 'some text\n# section 1\ncontent 1\ncontent 1\n\n# section 2\ncontent 2')

		expect(container).toHaveChildren([
			{ type: 'Section' },
			{ type: 'Section' },
			{ type: 'Section' },
		])
	})
})
