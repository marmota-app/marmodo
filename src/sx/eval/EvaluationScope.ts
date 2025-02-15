/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2024-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { jsonTransientPrivate } from "../../utilities/jsonTransient"
import { EvaluationContext } from "../EvaluationContext"
import { ValueResult } from "../evaluate"
import { ExpressionType } from "../types/ExpressionType"

interface Symbol {
	type: 'Symbol',
	text: string,
}
interface Operator {
	type: 'Operator',
	text: string,
}
interface Parameter {
	type: 'Parameter',
	parameterType: string,
}
interface Value {
	type: 'Value' | 'FunctionApplication' | 'Reference',
	valueType: ExpressionType,
}
export type ScopeDef = Symbol | Operator | Parameter
export type ScopeAccess = Symbol | Operator | Value

interface FunctionParameter {
	type: ExpressionType,
	value: any,
}
interface Function {
	type: 'Function',
	valueType: string,
	evaluate: (params: FunctionParameter[], context: EvaluationContext) => any,
}
export interface Reference {
	type: 'Reference',
	referencedValue: ValueResult,
}
export type ScopedValue = (Function | Reference) & { definition: ScopeDef[] }

export interface ScopeTreeNode {
	node(def: ScopeAccess, selfType?: ExpressionType): ScopeTree | undefined,
	fullPath: ScopeDef[],
	value: ScopedValue | undefined,
	unregisterValue: ()=>void,
}
export class ScopeTree implements ScopeTreeNode {
	private _value: ScopedValue | undefined = undefined
	private _children: { [key: string]: ScopeTree } = {}
	private _outer: ScopeTree | undefined

	constructor(private readonly parent?: ScopeTreeNode, private readonly nodePath?: ScopeDef) {
		jsonTransientPrivate(this, 'parent')
	}

	register(definition: ScopeDef[], value: ScopedValue, start: number) {
		if(start === definition.length) {
			if(this._value != null) {
				//Error: Cannot register a value twice!
			}
			this._value = value
		} else {
			const def = definition[start]

			if(def.type === 'Symbol' || def.type==='Operator') {
				if(this._children[`#Sym[${def.text}]`] == null) {
					this._children[`#Sym[${def.text}]`] = new ScopeTree(this, def)
				}
				this._children[`#Sym[${def.text}]`].register(definition, value, start+1)
			} else {
				if(this._children[`<${def.parameterType}>`] == null) {
					this._children[`<${def.parameterType}>`] = new ScopeTree(this, def)
				}
				this._children[`<${def.parameterType}>`].register(definition, value, start+1)
			}
		}
	}

	node(def: ScopeAccess, selfType?: ExpressionType): ScopeTree | undefined {
		const localNode = this.#localNode(def, selfType)
		if(localNode) {
			let currentNode = localNode
			let outer = this._outer
			let outerNode = outer?.node(def, selfType)

			while(outer != null) {
				currentNode._outer = outerNode
				outer = undefined
			}
		}
		return localNode ?? this._outer?.node(def, selfType)
	}
	get value(): ScopedValue | undefined {
		const localValue = this._value
		return localValue ?? this._outer?.value
	}

	unregisterValue() {
		this._value = undefined
	}

	get fullPath() {
		if(this.nodePath != null && this.parent != null) {
			return [ ...this.parent.fullPath, this.nodePath]
		}
		return []
	}

	setOuter(outer: ScopeTree | undefined) {
		this._outer = outer
	}

	#localNode(def: ScopeAccess, selfType?: ExpressionType): ScopeTree | undefined {
		if(def.type === 'Symbol' || def.type==='Operator') {
			return this._children[`#Sym[${def.text}]`]
		}

		let type: ExpressionType | null = def.valueType
		while (type != null) {
			let child = this._children[`<${type.name}>`]
			if(child != null) {
				return child
			}
			type = type.extends
		}
		if(def.valueType.name === selfType?.name) {
			return this._children['<<Same>>']
		}
		return this._children['<<T>>']
	}
}
export class EvaluationScope implements ScopeTreeNode {
	private readonly _tree: ScopeTree
	readonly value :ScopedValue | undefined = undefined
	readonly fullPath: ScopeDef[] = []

	constructor(private readonly outer?: EvaluationScope) {
		this._tree = new ScopeTree(this, undefined)
		jsonTransientPrivate(this, 'outer')
	}

	register(value: ScopedValue) {
		//TODO definition.length === 0 must not be allowed.
		this._tree.register(value.definition, value, 0)
	}
	node(definition: ScopeAccess, selfType?: ExpressionType): ScopeTree | undefined {
		return this.tree().node(definition, selfType)
	}
	unregisterValue() {
	}
	tree(): ScopeTree {
		this._tree.setOuter(this.outer?.tree())
		return this._tree
	}
}
