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

describe('evaluate (integration tests)', () => {
	[
		[ '10+2.2', '12.2', 'Number' ],
		[ '1.5*2', '3', 'Number' ],
		[ '1+2*3', '7', 'Number' ],
		[ '(1+2)*3', '9', 'Number' ],
		[ '1€ + 2€', '3 €', 'Currency:Euro' ],
		[ '1$ + 2$', '3 $', 'Currency:Dollar' ],
		[ '10€ * 20%', '2 €', 'Currency:Euro' ],
		[ '10€ * 20%', '2 €', 'Currency:Euro' ],
		[ '10€ + (10€ * 10%)', '11 €', 'Currency:Euro' ],
		[ '10€ + 20%', '12 €', 'Currency:Euro' ],

		[ '"1"+2', '3', 'Number' ],
		[ '"1"+"2"', '3', 'Number' ],
		[ '1+"2"', '3', 'Number' ],
		[ '"1"-2', '-1', 'Number' ],
		[ '"1"-"2"', '-1', 'Number' ],
		[ '1-"2"', '-1', 'Number' ],
		[ '"1"*2', '2', 'Number' ],
		[ '"1"*"2"', '2', 'Number' ],
		[ '1*"2"', '2', 'Number' ],
		[ '"1"/2', '0.5', 'Number' ],
		[ '"1"/"2"', '0.5', 'Number' ],
		[ '1/"2"', '0.5', 'Number' ],
	].forEach(([expression, expected, expectedType]) => it(`evaluates "${expression}" to "${expected}"`, () => {
			const context = new SxContext()

			const result = context.createEvaluation(expression).evaluate('id-1') as any

			expect(result).toHaveProperty('resultType', 'value')
			expect(result).toHaveProperty('asString', expected)
			expect(result.type).toHaveProperty('name', expectedType)
	}))
})
