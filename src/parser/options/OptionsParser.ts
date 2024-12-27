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

import { AnyInline, Option, Options } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { finiteLoop } from "../../utilities/finiteLoop"
import { MfMParser } from "../MfMParser"
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
