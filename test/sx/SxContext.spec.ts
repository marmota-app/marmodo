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

import { ValueResult } from "../../src/sx/SxEvaluation"
import { SxContext } from "../../src/sx/SxContext"


describe('SxContext', () => {
	it('creates a new evaluation', () => {
		const context = new SxContext()

		const evaluation = context.createEvaluation('-ignore-')

		expect(evaluation).toBeDefined()
	})
	it('can get the value from a simple evaluation', () => {
		const context = new SxContext()

		const evaluation = context.createEvaluation('10')
		const result = evaluation.evaluate('id-1') as ValueResult

		expect(result.value).toEqual(10)
	})
})
