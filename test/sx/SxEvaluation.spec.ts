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

import { ValueResult } from "src/sx/SxEvaluation"
import { SxContext } from "../../src/sx/SxContext"

describe('SxEvaluation', () => {
	it('evaluates a number as a constant expression', () => {
		const context = new SxContext()
		const result = context.createEvaluation('10').evaluate('id-1') as ValueResult

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('type')
		expect(result.type).toHaveProperty('name', 'Integer')
		expect(result).toHaveProperty('value', 10)
		expect(result).toHaveProperty('asString', '10')
	})
	it('evaluates a floating point number as a constant expression', () => {
		const context = new SxContext()
		const result = context.createEvaluation('10.5').evaluate('id-1') as ValueResult

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('type')
		expect(result.type).toHaveProperty('name', 'Float')
		expect(result).toHaveProperty('value', 10.5)
		expect(result).toHaveProperty('asString', '10.5')
	})
	it('evaluates a simple, single-symbol function', () => {
		const context = new SxContext()
		context.scope.register({
			type: 'Function',
			valueType: 'String',
			evaluate: () => 'foo result',
			definition: [
				{ type: 'Symbol', text: 'foo' }
			],
		})

		const result = context.createEvaluation('foo').evaluate('id-1') as ValueResult

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('type')
		expect(result.type).toHaveProperty('name', 'String')
		expect(result).toHaveProperty('value', 'foo result')
		expect(result).toHaveProperty('asString', 'foo result')
	});
	it('can register an evaluation as named and reference it in another evaluation', () => {
		const context = new SxContext()
		const eval1 = context.createEvaluation('10')

		context.registerNamed(eval1, 'r1')
		const result = context.createEvaluation('r1*2').evaluate('id-1') as ValueResult

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('value', 20)
	})
})
