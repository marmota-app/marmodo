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

import { PersistentRange } from "../mbuffer/TextRange";
import { jsonTransient } from "../utilities/jsonTransient";
import { Element, Parser } from "./Element";

export abstract class MfMElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
	PARSER extends Parser<TYPE, CONTENT, THIS>,
> implements Element<TYPE, CONTENT, THIS> {
	abstract readonly type: TYPE
	abstract readonly asText: string
	abstract readonly content: CONTENT[]

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: PARSER,
	) {
		jsonTransient(this, 'parsedWith')
	}
}