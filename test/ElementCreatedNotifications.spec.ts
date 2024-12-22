/*
Copyright [2020-2024] [David Tanzer - @dtanzer@social.devteams.at]

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

import { Element } from "../src/element"
import { MfMDocument, MfMDocumentContext } from "../src/MfMDocument"

describe('Element update notifications', () => {
	it('notifies listeners when element gets update', () => {
		let created: Element<any, any, any> | undefined
		const onContextCreated = (context: MfMDocumentContext) => {
			context.onElementChanged('CustomInline', e => created=e)
		}
		const doc = new MfMDocument('{{custom inline}}', { onContextCreated })

		expect(created).toHaveProperty('asText', '{{custom inline}}')
	})

	it('does not notify listeners when unsubscribed', () => {
		let created: Element<any, any, any> | undefined
		const onContextCreated = (context: MfMDocumentContext) => {
			context.onElementChanged('CustomInline', e => created=e).unsubscribe()
		}
		const doc = new MfMDocument('some text {{custom inline}}', { onContextCreated })

		expect(created).toBeUndefined()
	});

	[
		['CustomInline', 'blah {{custom}}'],
		['Table', '|---|---|\n|a|b|'],
	].forEach(([type, text]) => it(`notifies about created element: ${type}`, () => {
		let created: Element<any, any, any> | undefined
		const onContextCreated = (context: MfMDocumentContext) => {
			context.onElementChanged(type, e => created=e)
		}
		const doc = new MfMDocument(text, { onContextCreated })

		expect(created).not.toBeUndefined()
	}))
})