/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2024-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { tokenize } from "../../src/sx/SxToken"

describe('SxToken', () => {
	it('creates a single symbol token for a single word', () => {
		const tokens = tokenize('sym')

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
	})
	it('creates a single symbol token for a single word, containing numbers', () => {
		const tokens = tokenize('sym1234')

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', 'sym1234')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
	})
	it('creates a single number token for a single number', () => {
		const tokens = tokenize('10')

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', '10')
		expect(tokens[0]).toHaveProperty('type', 'Number')
	});

	['true', 'false'].forEach(i => it(`creates a single boolean token for a ${i}`, () => {
		const tokens = tokenize(i)

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', i)
		expect(tokens[0]).toHaveProperty('type', 'Boolean')
	}));

	[
		'.', ',', ';',
		'-', '+', '*', '/', '%', '^',
		'(', ')', '[', ']', '<', '>', '{', '}',
		'|', '#', '°', '!', '§', '%', '&', '=', '?', '\\', '\'', '`', '´', '~', '#',
		'=>', '<=', '>=', '&&', '...', '-->', '####',
	].forEach(op => it(`creates a single operator token for ${op}`, () => {
		const tokens = tokenize(op)

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', op)
		expect(tokens[0]).toHaveProperty('type', 'Operator')
	}));

	[
		'.(', '-)', '*[', '~]',
		'{.', '}-',
	].forEach(op => it('splits operator at brackets', () => {
		const tokens = tokenize(op)

		expect(tokens).toHaveLength(2)
		expect(tokens[0]).toHaveProperty('text', op.charAt(0))
		expect(tokens[0]).toHaveProperty('type', 'Operator')
		expect(tokens[1]).toHaveProperty('text', op.charAt(1))
		expect(tokens[1]).toHaveProperty('type', 'Operator')
	}));

	it('creates a single string token for string input', () => {
		const tokens = tokenize('"10"')

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', '10')
		expect(tokens[0]).toHaveProperty('type', 'String')
	})

	it('returns three symbol tokens, separated by spaces', () => {
		const tokens = tokenize('sym bol token')

		expect(tokens).toHaveLength(3)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
		expect(tokens[1]).toHaveProperty('text', 'bol')
		expect(tokens[1]).toHaveProperty('type', 'Symbol')
		expect(tokens[2]).toHaveProperty('text', 'token')
		expect(tokens[2]).toHaveProperty('type', 'Symbol')
	})
	it('returns symbol tokens, separated by operator', () => {
		const tokens = tokenize('sym.bol')

		expect(tokens).toHaveLength(3)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
		expect(tokens[1]).toHaveProperty('text', '.')
		expect(tokens[1]).toHaveProperty('type', 'Operator')
		expect(tokens[2]).toHaveProperty('text', 'bol')
		expect(tokens[2]).toHaveProperty('type', 'Symbol')
	})
	it('parses a symbol and a number', () => {
		const tokens = tokenize('sym 123')

		expect(tokens).toHaveLength(2)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
		expect(tokens[1]).toHaveProperty('text', '123')
		expect(tokens[1]).toHaveProperty('type', 'Number')
	})
	it('parses a dot after digits as part of a number', () => {
		const tokens = tokenize('10.25')

		expect(tokens).toHaveLength(1)
		expect(tokens[0]).toHaveProperty('text', '10.25')
		expect(tokens[0]).toHaveProperty('type', 'Number')
	})
	it('parses a string after a symbol', () => {
		const tokens = tokenize('sym "123"')

		expect(tokens).toHaveLength(2)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
		expect(tokens[1]).toHaveProperty('text', '123')
		expect(tokens[1]).toHaveProperty('type', 'String')
	})
	it('parses a symbol after a string', () => {
		const tokens = tokenize('"123" sym')

		expect(tokens).toHaveLength(2)
		expect(tokens[0]).toHaveProperty('text', '123')
		expect(tokens[0]).toHaveProperty('type', 'String')
		expect(tokens[1]).toHaveProperty('text', 'sym')
		expect(tokens[1]).toHaveProperty('type', 'Symbol')
	})
	it('parses unfinished string as a symbol', () => {
		const tokens = tokenize('sym "123')

		expect(tokens).toHaveLength(2)
		expect(tokens[0]).toHaveProperty('text', 'sym')
		expect(tokens[0]).toHaveProperty('type', 'Symbol')
		expect(tokens[1]).toHaveProperty('text', '"123')
		expect(tokens[1]).toHaveProperty('type', 'Symbol')
	})
})
