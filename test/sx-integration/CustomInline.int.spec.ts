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

import { SxContext } from "../../src/sx/SxContext"
import { TextContent } from "../../src/mbuffer"
import { Parsers } from "../../src/parser/Parsers"
import { Element, ParsingContext } from "../../src/element"
import { UpdateParser } from "../../src/update/UpdateParser"

describe('Custom Inlines (Integration)', () => {
	it('contains a single custom inline', () => {
		const parsers = new Parsers()

		const textContent = new TextContent('lorem ipsum {{10€ + 20%}} dolor sit amet')
		const context: ParsingContext = { sxContext: new SxContext(), }
		const parsed = parsers.Container.parse(textContent.start(), textContent.end(), context)
		parsed?.updateSxResults('id-1')

		const text = toText(parsed!)

		expect(text).toEqual('lorem ipsum 12 € dolor sit amet')
	})
	it('can contain two custom inlines where one references the other', () => {
		const parsers = new Parsers()

		const textContent = new TextContent('lorem ipsum {{10€}}{basePrice} dolor sit amet {{basePrice + 20%}}')
		const context: ParsingContext = { sxContext: new SxContext(), }
		const parsed = parsers.Container.parse(textContent.start(), textContent.end(), context)
		parsed?.updateSxResults('id-1')

		const text = toText(parsed!)

		expect(text).toEqual('lorem ipsum 10 € dolor sit amet 12 €')
	})
	it('can update a custom inline where one references the other', () => {
		const parsers = new Parsers()

		const textContent = new TextContent('lorem ipsum {{10€}}{basePrice} dolor sit amet {{basePrice + 20%}}')
		const context: ParsingContext = { sxContext: new SxContext(), }
		const parsed = parsers.Container.parse(textContent.start(), textContent.end(), context)!
		parsed.updateSxResults('id-1')

		const updateParser = new UpdateParser()
		const result = updateParser.parseUpdate(
			textContent.update({ text: '', rangeOffset: 'lorem ipsum {{1'.length, rangeLength: '0'.length}),
			parsed,
			textContent.end(),
		)!

		const text = toText(result)

		expect(text).toEqual('lorem ipsum 1 € dolor sit amet 1.2 €')
	})
	it('can update referencing custom inline', () => {
		const parsers = new Parsers()

		const textContent = new TextContent('lorem ipsum {{10€}}{basePrice} dolor sit amet {{basePrice + 20%}}')
		const context: ParsingContext = { sxContext: new SxContext(), }
		const parsed = parsers.Container.parse(textContent.start(), textContent.end(), context)!
		parsed.updateSxResults('id-1')

		const updateParser = new UpdateParser()
		const result = updateParser.parseUpdate(
			textContent.update({ text: '3', rangeOffset: 'lorem ipsum {{10€}}{basePrice} dolor sit amet {{basePrice + '.length, rangeLength: '2'.length}),
			parsed,
			textContent.end(),
		)!

		const text = toText(result)

		expect(text).toEqual('lorem ipsum 10 € dolor sit amet 13 €')
	})
	it('can update a custom inline where one references the other transitively', () => {
		const parsers = new Parsers()

		const textContent = new TextContent('lorem ipsum {{10€}}{basePrice} dolor {{basePrice * 20%}}{vat} sit amet {{basePrice + vat}}')
		const context: ParsingContext = { sxContext: new SxContext(), }
		const parsed = parsers.Container.parse(textContent.start(), textContent.end(), context)!
		parsed.updateSxResults('id-1')

		const updateParser = new UpdateParser()
		const result = updateParser.parseUpdate(
			textContent.update({ text: '$', rangeOffset: 'lorem ipsum {{10'.length, rangeLength: '€'.length}),
			parsed,
			textContent.end(),
		)!

		const text = toText(result)

		expect(text).toEqual('lorem ipsum 10 $ dolor 2 $ sit amet 12 $')
	})
})

function toText(element: Element<any, any, any>): string {
	if(element.type === 'CustomInline') { return '' + element.referenceMap['sx.result'] }
	if(element.type === 'Text') { return element.asText }
	return element.content.map(c => toText(c)).join('')
}
