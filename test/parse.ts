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

import { Element } from "../src/element/Element";
import { TextContent } from "../src/mbuffer/TextContent";
import { Parsers } from "../src/parser/Parsers";

export function parseAll<
	TYPE extends string,
	ELEMENT extends Element<TYPE, any, ELEMENT>
> (type: TYPE, content: string): ELEMENT | null {
	const parsers: any = new Parsers()
	const parser = parsers[type]

	const textContent = new TextContent(content)

	return parser.parse(textContent.start(), textContent.end())
}
