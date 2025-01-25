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

import { PersistentRange } from "../mbuffer/TextRange";
import { IdGenerator } from "../parser/Parsers";
import { jsonTransient, jsonTransientPrivate } from "../utilities/jsonTransient";
import { Element, ElementOptions, ElementUpdateCallback, ElementUpdateRegistration, Parser } from "./Element";

let elementIdGenerator: IdGenerator

export const EMPTY_OPTIONS: ElementOptions = {
	keys: [],
	get(k: string) { return undefined },
}

class MfMElementContext {
	private readonly values: { [key: string]: any } = {}
	constructor(private readonly element: MfMElement<any, any, any, any>) {
		jsonTransientPrivate(this, 'element')
	}

	get(key: string): any {
		if(this.element.parent == null && this.element.type !== 'Container') {
			throw new Error('Accessing context of an element that is not correctly part of a tree: '+JSON.stringify(this.element))
		}

		if(this.values[key] != null) { return this.values[key] }
		if(this.element.parent != null) { return this.element.parent.context.get(key) }
		return null
	}
	set(key: string, value: any) {
		//Setting value must be possible while the element is not YET part
		//of a tree, so no check here. It should not be possible anymore
		//when it is not part of a tree anymore after removal, but that
		//check is hard to implement and setting a value after removal has
		//not really any bad consequences.
		this.values[key] = value
	}
}

export abstract class MfMElement<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
	PARSER extends Parser<TYPE, CONTENT, THIS>,
> implements Element<TYPE, CONTENT, THIS> {
	abstract readonly type: TYPE
	abstract readonly asText: string

	readonly context = new MfMElementContext(this)
	public parent: Element<any, any, any> | null = null
	private updateCallbacks: { [key: string]: ElementUpdateCallback<TYPE, CONTENT, THIS>} = {}

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
		const myRegistration = this.onUpdate(cb)
		const otherRegistrations: ElementUpdateRegistration[] = []
		this.content.forEach(c => otherRegistrations.push(c.onUpdate(cb)))

		const id = elementIdGenerator.nextTaggedId('subtree-update-callback')

		return {
			id,
			unsubscribe: () => {
				otherRegistrations.forEach(r => r.unsubscribe())
				myRegistration.unsubscribe()
			}
		}
	}

	updateParsed(): void {
		Object.keys(this.updateCallbacks).forEach(k => this.updateCallbacks[k](this))
	}

	removeFromTree(): void {
		this.content.forEach(c => c.removeFromTree())
		this.parent = null
		this.updateCallbacks = {}
	}

	get referenceMap(): { [key: string]: string | Element<any, any, any> | Element<any, any, any>[] | null } {
		return {
			'element.content': this.content,
		}
	}
}
