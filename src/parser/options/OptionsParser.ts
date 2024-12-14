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

import { AnyInline, Options } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { MfMParser } from "../MfMParser"

export class MfMOptions extends MfMElement<'Options', AnyInline, Options, OptionsParser> implements Options {
	public readonly type = 'Options'
	readonly content: AnyInline[] = []

	get(key: string) {
		return undefined
	}
	get keys(): string[] { return [] }

	get asText(): string {
		return this.parsedRange.asString()
	}
}

export class OptionsParser extends MfMParser<'Options', AnyInline, Options> {
	readonly type = 'Options'
	
	parse(start: TextLocation, end: TextLocation): Options | null {
		return null
	}
}
