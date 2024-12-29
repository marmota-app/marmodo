/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

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

import { Element } from "../src/element/Element"

export type ElementContent = { [key: string]: any }

expect.extend({
	toHaveChildren(received: any, expected: ElementContent[]) {
		if(Array.isArray(received.content)) {
			const element = received as Element<any, any, any>

			if(element.content.length !== expected.length) {
				return {
					pass: false,
					message: () => `Expected content to have length ${expected.length}, but was ${element.content.length}`
				}
			}

			for(let i in element.content) {
				const act = element.content[i]
				const exp = expected[i]

				for(let key of Object.keys(exp)) {
					if(act[key] != exp[key]) {
						return {
							pass: false,
							message: () => `Expected element property ${key} to have value "${exp[key]}", but was "${act[key]}"`
						}
					}
				}
			}
			return {
				pass: true,
				message: () => `Element ${JSON.stringify(element)} contains all properties of ${JSON.stringify(expected)}`
			}
		}
		return {
			pass: false,
			message: () => `Tested object ${JSON.stringify(received)} does not appear to be an Element`
		}
	}
})
