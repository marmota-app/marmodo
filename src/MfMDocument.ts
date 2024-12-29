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

import { Element, ElementUpdateRegistration } from "./element";
import { Container } from "./element/MfMElements";
import { ContentUpdate } from "./mbuffer/ContentUpdate";
import { TextContent, UpdateInfo } from "./mbuffer/TextContent";
import { IdGenerator, Parsers } from "./parser/Parsers";
import { UpdateParser } from "./update/UpdateParser";

let documentIdGenerator: IdGenerator
let updateCounter = 0

export class MfMDocumentContext {
	constructor(private readonly parsers: Parsers) {}

	onElementChanged(type: string, callback: (e: Element<any, any, any>)=>unknown): ElementUpdateRegistration {
		return this.parsers.onElementChanged(type, callback)
	}
}
export interface MfMDocumentOptions {
	parsers: Parsers,
	updateParser: UpdateParser,
	development: boolean,
	onContextCreated: (context: MfMDocumentContext) => unknown,
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
	#context: MfMDocumentContext
	#textContent: TextContent
	#content: Container

	#development: boolean

	private updateCallbacks: { [key: string]: ()=>void} = {}

	constructor(initialText: string, options: Partial<MfMDocumentOptions> = {}) {
		const defaultOptions: MfMDocumentOptions = {
			parsers: new Parsers(),
			updateParser: new UpdateParser(),
			development: true,
			onContextCreated: () => {},
		}
		const allOptions: MfMDocumentOptions = {
			...defaultOptions,
			...options,
		}

		this.#development = allOptions.development
		if(this.#development) {
			this.#originalText = initialText
		}
		this.#parsers = allOptions.parsers
		this.#updateParser = allOptions.updateParser

		this.#context = new MfMDocumentContext(allOptions.parsers)
		allOptions.onContextCreated(this.#context)

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

		if(this.#development) {
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
		if(this.#development) {
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
		if(this.#development && updated != null) {
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
			newlyParsed?.removeFromTree()
		}
		//-------- DEVELOPMENT --------

		if(updated === null) {
			if(this.#development) {
				console.warn(`Update returned null, parsing complete text. Original text="${this.#originalText}", updates = `, this.#updates)
			}
	
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
		if(this.#development) {
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
