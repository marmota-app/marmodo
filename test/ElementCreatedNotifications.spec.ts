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
		['Container', 'some text'],
	].forEach(([type, text]) => it(`notifies about created element: ${type}`, () => {
		let created: Element<any, any, any> | undefined
		const onContextCreated = (context: MfMDocumentContext) => {
			context.onElementChanged(type, e => created=e)
		}
		const doc = new MfMDocument(text, { onContextCreated })

		expect(created).not.toBeUndefined()
	}))
})