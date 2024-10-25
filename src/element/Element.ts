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

import { TextRange } from "../mbuffer/TextRange";

export interface Parser<
	TYPE extends string,
	ELEMENT extends Element<TYPE, ELEMENT>,
> {
	parse: (text: TextRange) => Element<TYPE, ELEMENT> | null,
}

export interface Element<
	TYPE extends string,
	THIS extends Element<TYPE, THIS>,
> {
	readonly id: string,
	readonly type: TYPE,

	readonly parsedWith: Parser<TYPE, THIS>,
	readonly parsedRange: TextRange,
}

