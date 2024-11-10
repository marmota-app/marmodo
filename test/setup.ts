/*
Copyright [2020-2023] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Element } from "../src/element/Element"

export type ElementContent = { [key: string]: string }

expect.extend({
	toHaveChildren(received: any, actual: ElementContent[]) {
		if(Array.isArray(received.content)) {
			const element = received as Element<any, any, any>

			if(element.content.length !== actual.length) {
				return {
					pass: false,
					message: () => `Expected content to have length ${actual.length}, but was ${element.content.length}`
				}
			}

			for(let i in element.content) {
				const exp = element.content[i]
				const act = actual[i]

				for(let key of Object.keys(act)) {
					if(exp[key] != act[key]) {
						return {
							pass: false,
							message: () => `Expected element property ${key} to have value "${exp[key]}", but was "${act[key]}"`
						}
					}
				}
			}
			return {
				pass: true,
				message: () => `Element ${JSON.stringify(element)} contains all properties of ${JSON.stringify(actual)}`
			}
		}
		return {
			pass: false,
			message: () => `Tested object ${JSON.stringify(received)} does not appear to be an Element`
		}
	}
})
