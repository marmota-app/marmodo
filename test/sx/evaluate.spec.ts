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

import { EvaluationContext } from "../../src/sx/EvaluationContext"
import { evaluate } from "../../src/sx/evaluate"

describe('evaluate (an expression)', () => {
	it('parses a number as a constant expression', () => {
		const context = new EvaluationContext()
		const result = evaluate('10', context)

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('valueType', 'literal')
		expect(result).toHaveProperty('type')
		expect((result as any).type).toHaveProperty('name', 'Integer')
		expect(result).toHaveProperty('value', 10)
		expect(result).toHaveProperty('asString', '10')
	})
	it('parses a floating point number as a constant expression', () => {
		const context = new EvaluationContext()
		const result = evaluate('10.5', context)

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('valueType', 'literal')
		expect(result).toHaveProperty('type')
		expect((result as any).type).toHaveProperty('name', 'Float')
		expect(result).toHaveProperty('value', 10.5)
		expect(result).toHaveProperty('asString', '10.5')
	})
	it('evaluates a simple, single-symbol function', () => {
		const context = new EvaluationContext()
		context.scope.register({
			type: 'Function',
			valueType: 'String',
			evaluate: () => 'foo result',
			definition: [
				{ type: 'Symbol', text: 'foo' }
			],
		})

		const result = evaluate('foo', context)

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('valueType', 'computed')
		expect(result).toHaveProperty('type')
		expect((result as any).type).toHaveProperty('name', 'String')
		expect(result).toHaveProperty('value', 'foo result')
		expect(result).toHaveProperty('asString', 'foo result')
	});
})
