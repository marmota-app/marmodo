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
