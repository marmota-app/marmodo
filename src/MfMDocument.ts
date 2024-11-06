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

import { Container } from "./element/MfMElements";
import { ContentUpdate } from "./mbuffer/ContentUpdate";
import { TextContent } from "./mbuffer/TextContent";
import { Parsers } from "./parser/Parsers";
import { UpdateParser } from "./update/UpdateParser";

export interface MfMDocumentOptions {
	parsers: Parsers,
	updateParser: UpdateParser,
}
export class MfMDocument {
	#parsers: Parsers
	#updateParser: UpdateParser
	#textContent: TextContent
	#content: Container

	constructor(initialText: string, options: Partial<MfMDocumentOptions> = {}) {
		const defaultOptions: MfMDocumentOptions = {
			parsers: new Parsers(),
			updateParser: new UpdateParser(),
		}
		const allOptions: MfMDocumentOptions = {
			...defaultOptions,
			...options,
		}
		this.#parsers = allOptions.parsers
		this.#updateParser = allOptions.updateParser

		this.#textContent = new TextContent('')
		this.#content = this.#parseCompleteText(initialText)
	}

	get content(): Container {
		return this.#content
	}
	get text(): string {
		return this.#content.asText
	}

	update(cu: ContentUpdate, getCompleteText: () => string): void {
		//const updated = this.#updateParser.parseUpdate(cu, this.#content)

		this.#content = this.#parseCompleteText(getCompleteText())
	}

	#parseCompleteText(text: string): Container {
		this.#textContent = new TextContent(text)
		const parsedContent = this.#parsers.Container.parse(this.#textContent.start(), this.#textContent.end())
		if(parsedContent == null) {
			throw new Error(`Could not parse document - This is an implementation error, since every document should be parsable!`)
		}
		return parsedContent
	}
}