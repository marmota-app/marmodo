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

import { MfMElement } from "../element/MfMElement"
import { AnyBlock, Container } from "../element/MfMElements"
import { TextLocation } from "../mbuffer/TextLocation"
import { finiteLoop } from "../utilities/finiteLoop"
import { MfMParser } from "./MfMParser"

export class MfMContainer extends MfMElement<'Container', AnyBlock, Container, ContainerParser> {
	public readonly type = 'Container'

	get asText(): string {
		return this.content
			.map(c => c.asText)
			.join('')
	}
}
export class ContainerParser extends MfMParser<'Container', AnyBlock, Container> {
	readonly type = 'Container'
	
	parse(start: TextLocation, end: TextLocation): Container | null {
		const content: AnyBlock[] = []
		let nextParseLocation = start

		const loop = finiteLoop(() => [ nextParseLocation.info() ])
		while(nextParseLocation.isBefore(end)) {
			loop.ensure()
			const section = this.parsers.Section.parse(nextParseLocation, end)
			if(section == null) {
				throw new Error(`Could not parse section at location ${nextParseLocation.info()}`)
			}
			content.push(section)
			nextParseLocation = section.parsedRange.end
		}
		
		const result = new MfMContainer(this.idGenerator.nextId(), start.persistentRangeUntil(end), this, content)
		this.parsers.elementChanged('Container', result)
		return result
	}
}