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

import { TextContent } from "../../src/mbuffer/TextContent"
import { Parsers } from "../../src/parser/Parsers"

describe('ContainerParser', () => {
	it('parses empty text into empty containter with one empty section', () => {
		const parser = new Parsers().Container
		const textContent = new TextContent('some text')

		const container = parser.parse(textContent.asRange())

		expect(container?.content).toHaveLength(1)
		const content = container!.content[0]
		expect(content).toHaveProperty('type', 'Section')
	})
})
