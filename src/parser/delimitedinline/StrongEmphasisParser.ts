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

import { AnyInline } from "../../element";
import { ElementOptions } from "../../element/Element";
import { PersistentRange } from "../../mbuffer/TextRange";
import { DelimitedInlineParser, DelimitedMfMElement } from "./DelimitedInlineParser";

export class MfMStrongEmphasis extends DelimitedMfMElement<'StrongEmphasis', MfMStrongEmphasis, StrongEmphasisParser> {
	readonly type = 'StrongEmphasis'

	constructor(
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: StrongEmphasisParser,
		delimiter: string,
		content: AnyInline[],
	) {
		super(id, options, parsedRange, parsedWith, delimiter, content)
	}
}
export class StrongEmphasisParser extends DelimitedInlineParser<'StrongEmphasis', MfMStrongEmphasis, StrongEmphasisParser> {
	override readonly type = 'StrongEmphasis'
	override readonly ElementClass = MfMStrongEmphasis
	override readonly self = this
	override readonly delimiters = [ '*', '_' ]
	override readonly delimiterLength = 2
}
