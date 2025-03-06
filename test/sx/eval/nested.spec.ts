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

import { SxContext } from "../../../src/sx/SxContext";

describe('nested evaluation contexts', () => {
	[
		['one', 'leaf', 3] as const,
		['one two', 'middle', 2] as const,
		['one two three', 'parent', 1] as const,
	].forEach(([fn, ctx, expected]) => it(`finds function ${fn} from context ${ctx}`, () => {
		const parent = new SxContext()
		const middle = new SxContext(parent)
		const leaf = new SxContext(middle)

		parent.scope.register({
			type: 'Function',
			definition: [{ type: 'Symbol', text: 'one' }, { type: 'Symbol', text: 'two' }, { type: 'Symbol', text: 'three' },],
			valueType: 'Integer',
			evaluate: () => { return 1 },
		})
		middle.scope.register({
			type: 'Function',
			definition: [{ type: 'Symbol', text: 'one' }, { type: 'Symbol', text: 'two' },],
			valueType: 'Integer',
			evaluate: () => { return 2 },
		})
		leaf.scope.register({
			type: 'Function',
			definition: [{ type: 'Symbol', text: 'one' },],
			valueType: 'Integer',
			evaluate: () => { return 3 },
		})

		const result = leaf.createEvaluation(fn).evaluate('evalId')

		expect(result.resultType).toEqual('value')
		expect(result).toHaveProperty('value', expected)
	}));

	it('can depend on a value registered in an upper scope', () => {
		const parent = new SxContext()
		const middle = new SxContext(parent)
		const leaf = new SxContext(middle)

		const reference = parent.createEvaluation('10')
		parent.registerNamed(reference, 'var', 'v1')

		const result = leaf.createEvaluation('var * 2').evaluate('evalId')

		expect(result).toHaveProperty('resultType', 'value')
	})
})
