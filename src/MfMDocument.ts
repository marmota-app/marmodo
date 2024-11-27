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
import { TextContent, UpdateInfo } from "./mbuffer/TextContent";
import { IdGenerator, Parsers } from "./parser/Parsers";
import { UpdateParser } from "./update/UpdateParser";

let documentIdGenerator: IdGenerator
const development = true
let updateCounter = 0
export interface MfMDocumentOptions {
	parsers: Parsers,
	updateParser: UpdateParser,
}
export interface DocumentUpdateRegistration {
	id: string,
	unsubscribe: () => void,
}
export class MfMDocument {
	//-------- DEVELOPMENT --------
	#updates: ContentUpdate[] = []
	#originalText: string = ''
	//-------- DEVELOPMENT --------

	#parsers: Parsers
	#updateParser: UpdateParser
	#textContent: TextContent
	#content: Container

	private updateCallbacks: { [key: string]: ()=>void} = {}

	constructor(initialText: string, options: Partial<MfMDocumentOptions> = {}) {
		if(development) {
			this.#originalText = initialText
		}

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
		let updateInfo: UpdateInfo

		if(development) {
			this.#updates.push(cu)
			try {
				updateInfo = this.#textContent.update(cu)
			} catch(e) {
				console.warn(`Update failed. Original text="${this.#originalText}", updates = `, this.#updates)
			}
		} else {
			updateInfo = this.#textContent.update(cu)
		}

		//-------- DEVELOPMENT --------
		if(development) {
			const reconstructedText = this.#textContent.start().stringUntil(this.#textContent.end())
			const editorText = getCompleteText()

			if(reconstructedText !== editorText) {
				console.error(
`Updated text content does not match editor text
--------------- Editor Text:
${editorText}
--------------- Updated TextContent:
${reconstructedText}`
				)
				console.warn(`Update failed. Original text="${this.#originalText}", updates = `, this.#updates)
			}
		}
		//-------- DEVELOPMENT --------

		const updated = this.#updateParser.parseUpdate(updateInfo!, this.#content, this.#textContent.end())

		//-------- DEVELOPMENT --------
		if(development && updated != null) {
			const newlyParsed = this.#parsers.Container.parse(this.#textContent.start(), this.#textContent.end())

			const textFromUpdated = updated.asText
			const textFromNew = newlyParsed!.asText

			if(textFromUpdated !== textFromNew) {
				console.error(
`Updated document tree as text does not match newly parsed tree as text
--------------- Newly parsed, as text:
${textFromNew}
--------------- Updated tree, as text:
${textFromUpdated}`
				)
				console.warn(`Update failed. Original text="${this.#originalText}", updates = `, this.#updates)
			}

			//TODO compare the trees
		}
		//-------- DEVELOPMENT --------

		if(updated === null) {
			this.#content.removeFromTree()
			this.#content = this.#parseCompleteText(getCompleteText())

			this.updateParsedCompletely()
		}
	}
	onUpdate(cb: () => void): DocumentUpdateRegistration {
		if(documentIdGenerator == null) { documentIdGenerator = new IdGenerator() }

		const id = documentIdGenerator.nextTaggedId('update-callback')
		this.updateCallbacks[id] = cb

		return {
			id: id,
			unsubscribe: () => { delete this.updateCallbacks[id] }
		}
	}

	updateParsedCompletely(): void {
		Object.keys(this.updateCallbacks).forEach(k => this.updateCallbacks[k]())
	}

	#parseCompleteText(text: string): Container {
		if(development) {
			this.#updates = []
			this.#originalText = text
		}

		this.#textContent = new TextContent(text)
		const parsedContent = this.#parsers.Container.parse(this.#textContent.start(), this.#textContent.end())
		if(parsedContent == null) {
			throw new Error(`Could not parse document - This is an implementation error, since every document should be parsable!`)
		}
		return parsedContent
	}
}