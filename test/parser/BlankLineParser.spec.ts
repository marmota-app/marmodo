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

import { BlankLine } from "../../src/element/MfMElements";
import { parseAll } from "../parse";
import { replaceWhitespace } from "../replaceWhitespace";

describe('BlankLineParser', () => {
	it('parses a blank line consisting of \\n', () => {
		const result = parseAll('BlankLine', ' \t\n') as BlankLine

		expect(result).not.toBeNull()
		expect(result?.textContent).toEqual(' \t\n')
	});

	[
		'some text\n',
		'  some text\n',
		'  ',
	].forEach(t => it(`does not parse a blank line for ${replaceWhitespace(t)}`, () => {
		const result = parseAll('BlankLine', t)

		expect(result).toBeNull()
	}));

	[
		['\n', '\n'],
		[' \t\n', ' \t\n'],
		['   \r', '   \r'],
		['  \nmore text', '  \n'],
		['   \r\n', '   \r\n'],
		['   \n\r', '   \n'],
	].forEach(t => it(`parses ${replaceWhitespace(t[0])} into blank line ${replaceWhitespace(t[1])}`, () => {
		const result = parseAll('BlankLine', t[0]) as BlankLine

		expect(result).not.toBeNull()
		expect(result?.textContent).toEqual(t[1])
	}))
})