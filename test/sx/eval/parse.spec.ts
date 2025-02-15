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

import { initializeTreeLeafNodes, parse } from "../../../src/sx/eval/parse"
import { tokenize } from "../../../src/sx/SxToken"
import { EvaluationContext } from "../../../src/sx/EvaluationContext"
import { evaluate } from "../../../src/sx/evaluate"

describe('parse', () => {
	describe('parse', () => {
		it('parses a simple function call', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' }
				],
			})
			const tokens = tokenize('foo')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect(result).toHaveProperty('nodeType', 'Node')
			expect(result).toHaveProperty('type', 'FunctionApplication')
			expect(result).toHaveProperty('valueType')
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(1)
			expect((result as any).parts[0]).toHaveProperty('text', 'foo')
		})

		it('parses a longer function call', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Integer' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo 10 ~')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(3)
			expect((result as any).parts[0]).toHaveProperty('text', 'foo')
			expect((result as any).parts[1]).toHaveProperty('type', 'Value')
			expect((result as any).parts[2]).toHaveProperty('text', '~')
		})

		it('parses a simple value', () => {
			const context = new EvaluationContext()

			const tokens = tokenize('10')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect(result).toHaveProperty('type', 'Value')
		})

		it('parses a function call on the last result', () => {
			const context = new EvaluationContext()
			const tokens = tokenize('10 + 5.5')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(2)
			expect((result as any).parts[0]).toHaveProperty('text', '+')
			expect((result as any).parts[1]).toHaveProperty('type', 'Value')

			expect((result as any).self).toHaveProperty('type', 'Value')
		})
		it('parses a function call with special parameter <Same>', () => {
			const context = new EvaluationContext()
			const tokens = tokenize('10€ + 5€')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.valueType).toHaveProperty('name', 'Currency:Euro')
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(2)
			expect(result.parts[0]).toHaveProperty('text', '+')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')

			expect(result.self).toHaveProperty('type', 'FunctionApplication')
		})
		it('does not parse a function call where special parameter <Same> is not matched', () => {
			const context = new EvaluationContext()
			const tokens = tokenize('10€ + 5$')

			const result = parse(tokens, context)

			expect(result).toBeUndefined()
		})
		it('parses a function call on the last result - twice after parens', () => {
			const context = new EvaluationContext()
			const tokens = tokenize('(1+2)*3')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(2)
			expect((result as any).self).toHaveProperty('type', 'FunctionApplication')

			expect((result as any).parts[0]).toHaveProperty('text', '*')
			expect((result as any).parts[1]).toHaveProperty('type', 'Value')
		})

		it('parses a combined value in a parameter', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Number' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo 10+5 ~')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(3)
			expect(result.parts[0]).toHaveProperty('text', 'foo')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self).toHaveProperty('type', 'Value')
			expect(result.parts[1].parts).toHaveLength(2)
			expect(result.parts[1].parts[0]).toHaveProperty('text', '+')
			expect(result.parts[1].parts[1]).toHaveProperty('type', 'Value')
			expect(result.parts[2]).toHaveProperty('text', '~')
		})

		it('parses a combined value (twice) in a parameter', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Number' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo 10+5*2.2 ~')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(3)
			expect(result.parts[0]).toHaveProperty('text', 'foo')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self).toHaveProperty('type', 'Value')
			expect(result.parts[1].parts).toHaveLength(2)
			expect(result.parts[1].parts[0]).toHaveProperty('text', '+')
			expect(result.parts[1].parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].parts[1].self).toHaveProperty('type', 'Value')
			expect(result.parts[1].parts[1].parts).toHaveLength(2)
			expect(result.parts[1].parts[1].parts[0]).toHaveProperty('text', '*')
			expect(result.parts[1].parts[1].parts[1]).toHaveProperty('type', 'Value')
			expect(result.parts[2]).toHaveProperty('text', '~')
		})

		it('parses a combined value in a parentheses', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Number' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo (10+5) ~')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(3)
			expect(result.parts[0]).toHaveProperty('text', 'foo')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].parts).toHaveLength(3)
			expect(result.parts[1].parts[0]).toHaveProperty('text', '(')
			expect(result.parts[1].parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].parts[2]).toHaveProperty('text', ')')
			expect(result.parts[2]).toHaveProperty('text', '~')
		})

		it('parses a combined value (twice) with different types', () => {
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Number' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo 10 toString length ~')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(3)
			expect(result.parts[0]).toHaveProperty('text', 'foo')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self.self).toHaveProperty('type', 'Value')
			expect(result.parts[1].self.parts).toHaveLength(1)
			expect(result.parts[1].self.parts[0]).toHaveProperty('text', 'toString')
			expect(result.parts[1].parts).toHaveLength(1)
			expect(result.parts[1].parts[0]).toHaveProperty('text', 'length')
			expect(result.parts[2]).toHaveProperty('text', '~')
		})

		it('parses a combined value in a parentheses with operation on value', () => {
			//here, we have to execute some code in the context of the return value
			//of a function. which is not exactly easy with the current structure
			//of the parser, so, clean up first.
			const context = new EvaluationContext()
			context.scope.register({
				type: 'Function',
				valueType: 'String',
				evaluate: () => '-ignore-',
				definition: [
					{ type: 'Symbol', text: 'foo' },
					{ type: 'Parameter', parameterType: 'Number' },
					{ type: 'Operator', text: '~' },
				],
			})
			const tokens = tokenize('foo (10+5)*4 ~')

			const result = parse(tokens, context) as any

			expect(result).not.toBeUndefined()
			expect(result.func).toHaveProperty('type', 'Function')

			expect(result.parts).toHaveLength(3)
			expect(result.parts[0]).toHaveProperty('text', 'foo')
			expect(result.parts[1]).toHaveProperty('type', 'FunctionApplication')

			expect(result.parts[1].self).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self.parts).toHaveLength(3)
			expect(result.parts[1].self.parts[0]).toHaveProperty('text', '(')
			expect(result.parts[1].self.parts[1]).toHaveProperty('type', 'FunctionApplication')
			expect(result.parts[1].self.parts[2]).toHaveProperty('text', ')')

			expect(result.parts[1].parts).toHaveLength(2)
			expect(result.parts[1].parts[0]).toHaveProperty('text', '*')
			expect(result.parts[1].parts[1]).toHaveProperty('type', 'Value')

			expect(result.parts[2]).toHaveProperty('text', '~')
		})
	})

	describe('references', () => {
		it('parses a simple reference value', () => {
			const context = new EvaluationContext()
			const ref1 = evaluate('10', context) as any
			context.registerReference('ref1', ref1)

			const tokens = tokenize('ref1')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect(result).toHaveProperty('type', 'Reference')
		})

		it('parses a function call on the last reference result', () => {
			const context = new EvaluationContext()
			const ref1 = evaluate('10', context) as any
			context.registerReference('ref1', ref1)

			const tokens = tokenize('ref1 + 5.5')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(2)
			expect((result as any).parts[0]).toHaveProperty('text', '+')
			expect((result as any).parts[1]).toHaveProperty('type', 'Value')

			expect((result as any).self).toHaveProperty('type', 'Reference')
		})
		it('parses a function call on the last result, with reference', () => {
			const context = new EvaluationContext()
			const ref1 = evaluate('10', context) as any
			context.registerReference('ref1', ref1)

			const tokens = tokenize('2*ref1')

			const result = parse(tokens, context)

			expect(result).not.toBeUndefined()
			expect((result as any).func).toHaveProperty('type', 'Function')

			expect((result as any).parts).toHaveLength(2)
			expect((result as any).parts[0]).toHaveProperty('text', '*')
			expect((result as any).parts[1]).toHaveProperty('type', 'Reference')

			expect((result as any).self).toHaveProperty('type', 'Value')
		})
	})

	describe('initializeTreeLeafNodes', () => {
		[
			['10', 'Integer'],
			['10.5', 'Float'],
			['"foo"', 'String'],
			['true', 'Boolean'],
		].forEach(([input, type]) => it(`assigns the type ${type} to a single value ${input}`, () => {
			const context = new EvaluationContext()
			const tokens = tokenize(input)

			const result = initializeTreeLeafNodes(tokens, context)

			expect(result).toHaveLength(1)
			expect(result[0]).toHaveProperty('type', 'Value')
			expect(result[0]).toHaveProperty('nodeType', 'Leaf')
			expect((result[0] as any).valueType).toHaveProperty('name', type)
		}))
	})

	describe('initializes a single symbol node', () => {
		const context = new EvaluationContext()
		const tokens = tokenize('foo')

		const result = initializeTreeLeafNodes(tokens, context)

		expect(result).toHaveLength(1)
		expect(result[0]).toHaveProperty('type', 'Symbol')
		expect(result[0]).toHaveProperty('token', tokens[0])
	})
	describe('initializes a single operator node', () => {
		const context = new EvaluationContext()
		const tokens = tokenize('-')

		const result = initializeTreeLeafNodes(tokens, context)

		expect(result).toHaveLength(1)
		expect(result[0]).toHaveProperty('type', 'Operator')
		expect(result[0]).toHaveProperty('token', tokens[0])
	})

	describe('initializes a list of different parse tree nodes', () => {
		const context = new EvaluationContext()
		const tokens = tokenize('- 10 foo')

		const result = initializeTreeLeafNodes(tokens, context)

		expect(result).toHaveLength(3)
		expect(result[0]).toHaveProperty('type', 'Operator')
		expect(result[1]).toHaveProperty('type', 'Value')
		expect(result[2]).toHaveProperty('type', 'Symbol')
	})
})
