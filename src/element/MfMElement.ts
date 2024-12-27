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
	constructor(private readonly element: MfMElement<any, any, any, any>) {}

	get(key: string): any {
		if(this.element.parent == null && this.element.type !== 'Container') {
			throw new Error('Accessing context of an element that is not correctly part of a tree: '+JSON.stringify(this.element))
		}

		if(this.values[key] != null) { return this.values[key] }
		if(this.element.parent != null) { return this.element.parent.context.get(key) }
		return null
	}
	set(key: string, value: any) {
		if(this.element.parent == null && this.element.type !== 'Container') {
			throw new Error('Accessing context of an element that is not correctly part of a tree: '+JSON.stringify(this.element))
		}

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
	protected _parent: Element<any, any, any> | null = null
	private updateCallbacks: { [key: string]: ElementUpdateCallback<TYPE, CONTENT, THIS>} = {}

	constructor(
		public readonly id: string,
		public readonly parsedRange: PersistentRange,
		public readonly parsedWith: PARSER,
		public readonly content: CONTENT[],
	) {
		jsonTransient(this, 'parsedWith')
		jsonTransientPrivate(this, '_parent')

		content.forEach(c => {
			(c as unknown as MfMElement<any, any, any, any>)._parent = this
		})
	}

	public get options(): ElementOptions { return  EMPTY_OPTIONS }
	public get parent(): Element<any, any, any> | null { return this._parent }
	
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
		this._parent = null
		this.updateCallbacks = {}
	}

	get referenceMap(): { [key: string]: string | Element<any, any, any> | Element<any, any, any>[] | null } {
		return {
			'element.content': this.content,
		}
	}
}
