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

import { evaluate } from "../../../src/sx/evaluate"
import { EvaluationContext } from "../../../src/sx/EvaluationContext"

describe('evaluation dependencies', () => {
	[
		[ '10', 'result1 * 2', "20" ],
		[ '10 * 5', '2 + result1 + 4', "56" ],
		[ '10 toString', 'result1 length', "2"],
		[ '"hello world"', 'result1', "hello world"],
		[ '"hello world"', 'result1 length', "11"],
	].forEach(([exp1, exp2, expected]) => it(`can create result "${exp2}"->${expected} that depends on "${exp1}"`, () => {
		const context = new EvaluationContext()

		const result1 = evaluate(exp1, context) as any
		context.registerReference('result1', result1)

		const result2 = evaluate(exp2, context) as any

		expect(result2).toHaveProperty('resultType', 'value')
		expect(result2).toHaveProperty('asString', expected)
	}))

	it('can create result that depends on two other results', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('2*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('(result1 * 2)+result2', context) as any

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('asString', '20')
	})
	it('can create result that depends on two other results, twice', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('2*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('(result1 * 2)+result2+result1', context) as any

		expect(result).toHaveProperty('resultType', 'value')
		expect(result).toHaveProperty('asString', '27')
	})

	it('invalidates the result when the first dependency changes', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('2*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('(result1 * 2)+result2', context) as any
		let isValid = result.resultType === 'value'

		expect(isValid).toEqual(true)
		result.context.onResultInvalidated(() => isValid = false)
		const result1New = evaluate('5+3', context) as any
		context.registerReference('result1', result1New)

		expect(isValid).toEqual(false)
	})
	it('invalidates the result when the first dependency changes', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('2*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('(result1 * 2)+result2+result1', context) as any
		let isValid = result.resultType === 'value'

		expect(isValid).toEqual(true)
		result.context.onResultInvalidated(() => isValid = isValid=false)
		const result1New = evaluate('5+3', context) as any
		context.registerReference('result1', result1New)

		expect(isValid).toEqual(false)
	})
	it('invalidates the result when the second dependency changes', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('2*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('(result1 * 2)+result2', context) as any
		let isValid = result.resultType === 'value'

		expect(isValid).toEqual(true)
		result.context.onResultInvalidated(() => isValid = false)
		const result2New = evaluate('5+3', context) as any
		context.registerReference('result2', result2New)

		expect(isValid).toEqual(false)
	})
	it('invalidates transitive result', () => {
		const context = new EvaluationContext()

		const result1 = evaluate('5+2', context) as any
		context.registerReference('result1', result1)
		const result2 = evaluate('result1*3', context) as any
		context.registerReference('result2', result2)

		const result = evaluate('result2 + 5', context) as any
		let isValid = result.resultType === 'value'

		expect(isValid).toEqual(true)
		result.context.onResultInvalidated(() => isValid = false)
		const result1New = evaluate('5+3', context) as any
		context.registerReference('result1', result1New)

		expect(isValid).toEqual(false)
	})
})
