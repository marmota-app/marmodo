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

import { EvaluationScope, ScopedValue, ScopeTree } from "../../../src/sx/eval/EvaluationScope"

describe('EvaluationScope', () => {
	describe('ScopeTree', () => {
		it('can find a symbol as child', () => {
			const tree = new ScopeTree()
			const value: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'String',
				evaluate: () => 'foo',
			}
			tree.register([ { type: 'Symbol', text: 'foo' } ], value, 0)

			const result = tree.node({ type: 'Symbol', text: 'foo' })

			expect(result).not.toBeUndefined()
			expect(result?.value).toEqual(value)
		})
		it('can find a value as child (direct match)', () => {
			const tree = new ScopeTree()
			const value: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'String',
				evaluate: () => 'foo',
			}
			tree.register([ { type: 'Parameter', parameterType: 'Float' } ], value, 0)

			const result = tree.node({ type: 'Value', valueType: { name: 'Float', extends: null } })

			expect(result).not.toBeUndefined()
			expect(result?.value).toEqual(value)
		})
		it('can find a value as child (subtype match)', () => {
			const tree = new ScopeTree()
			const value: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'String',
				evaluate: () => 'foo',
			}
			tree.register([ { type: 'Parameter', parameterType: 'Number' } ], value, 0)

			const result = tree.node({ type: 'Value', valueType: { name: 'Float', extends: { name: 'Number', extends: null } } })

			expect(result).not.toBeUndefined()
			expect(result?.value).toEqual(value)
		})
	})

	describe('nested', () => {
		it('finds simple node from root scope', () => {
			const root = new EvaluationScope()
			const leaf = new EvaluationScope(root)

			const scopedValue: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'Ignore',
				evaluate: () => {},
			}
			root.register(scopedValue)

			expect(leaf.node({ type: 'Symbol', text: 'foo' })).not.toBeUndefined()
		})
		it('finds value from root scope when current scope has node but no value', () => {
			const root = new EvaluationScope()
			const leaf = new EvaluationScope(root)

			const scopedValue: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'Ignore',
				evaluate: () => {},
			}
			root.register(scopedValue)
			leaf.register({
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' }, { type: 'Symbol', text: 'bar' } ],
				valueType: 'Something Else',
				evaluate: () => {},
			})

			expect(leaf.node({ type: 'Symbol', text: 'foo' })).toHaveProperty('value', scopedValue)
		})
		it('finds longer node from root scope', () => {
			const root = new EvaluationScope()
			const leaf = new EvaluationScope(root)

			const scopedValue: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' }, { type: 'Symbol', text: 'bar' } ],
				valueType: 'Ignore',
				evaluate: () => {},
			}
			root.register(scopedValue)
			leaf.register({
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'Something Else',
				evaluate: () => {},
			})

			const intermediateNode = leaf.node({ type: 'Symbol', text: 'foo' })
			expect(intermediateNode).not.toBeUndefined()
			expect(intermediateNode?.node({ type: 'Symbol', text: 'bar' })).toHaveProperty('value', scopedValue)
		})
		it('finds longer node from root scope with intermediate scope', () => {
			const root = new EvaluationScope()
			const middle = new EvaluationScope(root)
			const leaf = new EvaluationScope(middle)

			const scopedValue: ScopedValue = {
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' }, { type: 'Symbol', text: 'bar' } ],
				valueType: 'Ignore',
				evaluate: () => {},
			}
			root.register(scopedValue)
			leaf.register({
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' } ],
				valueType: 'Something Else',
				evaluate: () => {},
			})
			middle.register({
				type: 'Function',
				definition: [ { type: 'Symbol', text: 'foo' }, { type: 'Symbol', text: 'bar' }, { type: 'Symbol', text: 'baz' } ],
				valueType: 'Something Else',
				evaluate: () => {},
			})

			const intermediateNode = leaf.node({ type: 'Symbol', text: 'foo' })
			expect(intermediateNode).not.toBeUndefined()
			expect(intermediateNode?.node({ type: 'Symbol', text: 'bar' })).toHaveProperty('value', scopedValue)
		})
	})
})
