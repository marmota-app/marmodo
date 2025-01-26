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

import { Parsers } from "../../../src/parser/Parsers"
import { parseAll } from "../../parse"

describe('CustomTableColumn', () => {
	it('parses a custom table column', () => {
		const result = parseAll('CustomTableColumn', '|{{ 10+2 }}| more content')

		expect(result).not.toBeNull()

		expect(result?.content).toHaveLength(1)
		expect(result?.content[0]).toHaveProperty('type', 'Text')
		expect(result?.content[0]).toHaveProperty('asText', ' 10+2 ')
		expect(result).toHaveProperty('asText', '|{{ 10+2 }}')
	})

	it('does not parse a custom table column when the start is not correct', () => {
		const result = parseAll('CustomTableColumn', '|{ 10+2 }}|')

		expect(result).toBeNull()
	})

	it('does not parse a custom table column when the end is not correct', () => {
		const result = parseAll('CustomTableColumn', '|{{ 10+2 }|')

		expect(result).toBeNull()
	})

})