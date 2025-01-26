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

import { UpdateInfo } from "src/mbuffer"
import { AnyInline, Option, Options, UpdateCheckResult } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
import { andFalse, MfMParser } from "../MfMParser"
import { OptionParser } from "./OptionParser"

export class MfMOptions extends MfMElement<'Options', Option, Options, OptionsParser> implements Options {
	public readonly type = 'Options'
	readonly plainContent: string = ''

	get(key: string) {
		return this.content.find(c => (c.valid && c.key===key))?.value
	}
	get keys(): string[] { return this.content.filter(c => c.valid).map(c => c.key) }

	get asText(): string {
		return this.parsedRange.asString()
	}
}

export class OptionsParser extends MfMParser<'Options', AnyInline, Options> {
	readonly type = 'Options'

	parse(start: TextLocation, end: TextLocation): Options | null {
		let cur = start.accessor()
		if(cur.get() !== '{') { return null }
		cur.advance()
		if(cur.get() === '{') { return null }

		const content: Option[] = []
		let previousOption: Option | null = null
		const loop = finiteLoop(() => [ cur.info() ])
		do {
			loop.ensure()
			const nextParser: OptionParser = (previousOption!=null)? this.parsers.Option : this.parsers.FirstOption
			previousOption = nextParser.parse(cur, end)
			if(previousOption != null) {
				content.push(previousOption)
				cur = previousOption.parsedRange.end.accessor()
			}
		} while(previousOption != null)

		if(cur.isBefore(end) && cur.get() === '}') {
			cur.advance()
			const result = new MfMOptions(
				this.idGenerator.nextId(),
				start.persistentRangeUntil(cur),
				this,
				content,
			)

			return result
		}
		return null
	}
}
