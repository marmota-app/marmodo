/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { PersistentRange } from "../mbuffer/TextRange";
import { IdGenerator } from "../parser/Parsers";
import { jsonTransient, jsonTransientPrivate } from "../utilities/jsonTransient";
import { Element, ElementOptions, ElementUpdateCallback, ElementUpdateRegistration, Parser } from "./Element";

let elementIdGenerator: IdGenerator

export const EMPTY_OPTIONS: ElementOptions = {
	keys: [],
	get(k: string) { return undefined },
}

export abstract class MfMElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
	PARSER extends Parser<TYPE, CONTENT, THIS>,
> implements Element<TYPE, CONTENT, THIS> {
	abstract readonly type: TYPE
	abstract readonly asText: string

	public parent: Element<any, any, any> | null = null
	private updateCallbacks: { [key: string]: ElementUpdateCallback<TYPE, CONTENT, THIS>} = {}
	private subtreeUpdateCallbacks: { [key: string]: ElementUpdateCallback<TYPE, CONTENT, THIS>} = {}

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: PARSER,
		public readonly content: CONTENT[],
	) {
		jsonTransient(this, 'parsedWith')
		jsonTransient(this, 'parent')

		content.forEach(c => {
			(c as unknown as MfMElement<any, any, any, any>).parent = this
		})
	}

	public get options(): ElementOptions { return  EMPTY_OPTIONS }

	onUpdate(cb: ElementUpdateCallback<TYPE, CONTENT, THIS>): ElementUpdateRegistration {
		if(elementIdGenerator == null) { elementIdGenerator = new IdGenerator() }

		const id = elementIdGenerator.nextTaggedId('update-callback')
		this.updateCallbacks[id] = cb

		return {
			id,
			unsubscribe: () => { delete this.updateCallbacks[id] }
		}
	}

	onSubtreeUpdate(cb: ElementUpdateCallback<TYPE, CONTENT, THIS>): ElementUpdateRegistration {
		if(elementIdGenerator == null) { elementIdGenerator = new IdGenerator() }

		const id = elementIdGenerator.nextTaggedId('update-callback')
		this.subtreeUpdateCallbacks[id] = cb

		return {
			id,
			unsubscribe: () => { delete this.subtreeUpdateCallbacks[id] }
		}
	}

	updateParsed(): void {
		Object.keys(this.updateCallbacks).forEach(k => this.updateCallbacks[k](this))
	}
	subtreeUpdateParsed(): void {
		Object.keys(this.subtreeUpdateCallbacks).forEach(k => this.subtreeUpdateCallbacks[k](this))
	}

	removeFromTree(): void {
		this.content.forEach(c => c.removeFromTree())
		this.parent = null
		this.updateCallbacks = {}
		this.subtreeUpdateCallbacks = {}
	}

	get referenceMap(): { [key: string]: string | number | boolean | Element<any, any, any> | Element<any, any, any>[] | null } {
		return {
			'element.content': this.content,
		}
	}
}
