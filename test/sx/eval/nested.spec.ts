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

import { evaluate, ValueResult } from "../../../src/sx/evaluate"
import { EvaluationContext } from "../../../src/sx/EvaluationContext"

describe('nested evaluation contexts', () => {
	[
		['one', 'leaf', 3] as const,
		['one two', 'middle', 2] as const,
		['one two three', 'parent', 1] as const,
	].forEach(([fn, ctx, expected]) => it(`finds function ${fn} from context ${ctx}`, () => {
		const parent = new EvaluationContext()
		const middle = new EvaluationContext(parent)
		const leaf = new EvaluationContext(middle)

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

		const result = evaluate(fn, leaf)

		expect(result.resultType).toEqual('value')
		expect(result).toHaveProperty('value', expected)
	}));

	it('can depend on a value registered in an upper scope', () => {
		const parent = new EvaluationContext()
		const middle = new EvaluationContext(parent)
		const leaf = new EvaluationContext(middle)

		const reference = evaluate('10', parent) as ValueResult
		parent.registerReference('var', reference)

		const result = evaluate('var * 2', leaf)

		expect(result).toHaveProperty('resultType', 'value')
	})
	it('can invalidate a result from the leaf context when a dependency in an outer context changes', () => {
		const parent = new EvaluationContext()
		const middle = new EvaluationContext(parent)
		const leaf = new EvaluationContext(middle)

		const reference = evaluate('10', parent) as ValueResult
		parent.registerReference('var', reference)

		let invalidated = false
		const result = evaluate('var * 2', leaf) as ValueResult
		result.context.onResultInvalidated(() => invalidated = true)

		const newReference = evaluate('11', parent) as ValueResult
		parent.registerReference('var', newReference)

		expect(invalidated).toEqual(true)
	})
})
