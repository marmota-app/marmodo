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

import { CustomInline } from "../../src/element"
import { parseAll } from "../parse"
import { SxContext } from "../../src/sx/SxContext"

describe('CustomInline', () => {
	it('parses a custom inline', () => {
		const result = parseAll('CustomInline', '{{ some text }}')

		expect(result).toHaveProperty('asText', '{{ some text }}')
	})

	it('stops parsing at the closing delimiter', () => {
		const result = parseAll('CustomInline', '{{ some } text }}more text')

		expect(result).toHaveProperty('asText', '{{ some } text }}')
	})
	it('does not parse a custom inline that has no closing delimiter', () => {
		const result = parseAll('CustomInline', '{{ some text }')

		expect(result).toBeNull()
	})

	it('can return inner content', () => {
		const result = parseAll('CustomInline', '{{ some } text }}more text')

		expect(result).toHaveProperty('plainContent', ' some } text ')
	})

	it('contains a sx evaulation', () => {
		const result = parseAll('CustomInline', '{{ var * 2 }}') as CustomInline

		expect(result.evaluation).toBeDefined()
	})

	it('can get the result of an evaluation', () => {
		const result = parseAll('CustomInline', '{{ 10 * 2 }}') as CustomInline
		result.updateSxResults('id-1')

		expect(result.referenceMap['sx.resultType']).toEqual('value')
		expect(result.referenceMap['sx.result']).toEqual('20')
	})
	it('notifies the update listeners when the sx result has changed', () => {
		var updated = false
		const sxContext = new SxContext()
		const var1eval = sxContext.createEvaluation('10')
		sxContext.registerNamed(var1eval, 'var')

		const result = parseAll('CustomInline', '{{ var * 2 }}', { sxContext }) as CustomInline
		result.updateSxResults('id-1')
		expect(result.referenceMap['sx.result']).toEqual('20')

		result.onUpdate(() => updated=true)
		const var2eval = sxContext.createEvaluation('11')
		sxContext.registerNamed(var2eval, 'var')
		result.updateSxResults('id-2')
		expect(result.referenceMap['sx.result']).toEqual('22')
		expect(updated).toEqual(true)
	})
	it('does not notify the update listeners when the sx result has not changed', () => {
		var updated = false
		const sxContext = new SxContext()
		const var1eval = sxContext.createEvaluation('10')
		sxContext.registerNamed(var1eval, 'var')

		const result = parseAll('CustomInline', '{{ var * 2 }}', { sxContext }) as CustomInline
		result.updateSxResults('id-1')
		expect(result.referenceMap['sx.result']).toEqual('20')

		result.onUpdate(() => updated=true)
		const var2eval = sxContext.createEvaluation('10')
		sxContext.registerNamed(var2eval, 'var')
		result.updateSxResults('id-2')
		expect(result.referenceMap['sx.result']).toEqual('20')
		expect(updated).toEqual(false)
	})
	it('does not notify the update listeners when getting the cached result', () => {
		var updated = false
		const sxContext = new SxContext()
		const var1eval = sxContext.createEvaluation('10')
		sxContext.registerNamed(var1eval, 'var')

		const result = parseAll('CustomInline', '{{ var * 2 }}', { sxContext }) as CustomInline
		result.updateSxResults('id-1')
		expect(result.referenceMap['sx.result']).toEqual('20')

		result.onUpdate(() => updated=true)
		const var2eval = sxContext.createEvaluation('error')
		sxContext.registerNamed(var2eval, 'var')
		result.updateSxResults('id-1')
		expect(result.referenceMap['sx.result']).toEqual('20')
		expect(updated).toEqual(false)
	})
})
