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

import { SxContext } from "../../src/sx/SxContext"

describe('SX error handling', () => {
	test('dynamic operator of "Any" does not find concrete operator', () => {
		const context = new SxContext()
		context.types['Dummy:Type'] = {
			name: 'Dummy:Type',
			extends: context.types['Any'],
		}
		const numberScope = context.types['Number'].scope

		numberScope?.register({
			type: 'Function',
			valueType: 'Dummy:Type',
			evaluate: (params) => {
				if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
				return ({ resultType: 'value', value: 'dummy value', type: context.types['Dummy:Type'], asString: '-ignore-' })
			},
			definition: [
				{ type: 'Symbol', text: '&' },
			],
		})

		const result = context.createEvaluation('12 & * "5"').evaluate('id-1') as any

		expect(result).toHaveProperty('resultType', 'error')
		expect(result).toHaveProperty('message', 'Cannot find operator "*" for values [dummy value] (Dummy:Type) and [5] (String)')
	})
})
