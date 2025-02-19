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

import { SxContext } from "../../../src/sx/SxContext"

describe('evaluation dependencies', () => {
	[
		[ '10', 'result1 * 2', "20" ],
		[ '10 * 5', '2 + result1 + 4', "56" ],
		[ '10 toString', 'result1 length', "2"],
		[ '"hello world"', 'result1', "hello world"],
		[ '"hello world"', 'result1 length', "11"],
	].forEach(([exp1, exp2, expected]) => it(`can create result "${exp2}"->${expected} that depends on "${exp1}"`, () => {
		const context = new SxContext()

		const result1 = context.createEvaluation(exp1)
		context.registerNamed(result1, 'result1')

		const result2 = context.createEvaluation(exp2).evaluate('evalId')

		expect(result2).toHaveProperty('resultType', 'value')
		expect(result2).toHaveProperty('asString', expected)
	}))

	it('can create result that depends on two other results', () => {
		const context = new SxContext()

		const result1 = context.createEvaluation('5+2')
		context.registerNamed(result1, 'result1')
		const result2 = context.createEvaluation('2*3')
		context.registerNamed(result2, 'result2')

		const result = context.createEvaluation('(result1 * 2)+result2').evaluate('evalId')

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('asString', '20')
	})
	it('can create result that depends on two other results, twice', () => {
		const context = new SxContext()

		const result1 = context.createEvaluation('5+2')
		context.registerNamed(result1, 'result1')
		const result2 = context.createEvaluation('2*3')
		context.registerNamed(result2, 'result2')

		const result = context.createEvaluation('(result1 * 2)+result2+result1').evaluate('evalId')

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('asString', '27')
	})
})
