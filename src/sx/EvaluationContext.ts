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

import { EvaluationScope } from "./eval/EvaluationScope"
import { ReferenceNode } from "./eval/parse"
import { ValueResult } from "./evaluate"
import { anyType } from "./types/base/any"
import { booleanType } from "./types/base/boolean"
import { floatType, initializeNumberTypes, integerType, numberType } from "./types/base/numbers"
import { initializeStringTypes, stringType } from "./types/base/string"
import { ExpressionType } from "./types/ExpressionType"
import { currencyType, dollarCurrencyType, euroCurrencyType, initializeCurrency } from "./types/units/currency"
import { initializePercentage, percentageType } from "./types/units/percentage"

export interface ReferenceUser {
	invalidate: () => void,
	result?: ValueResult,
}

export class EvaluationContext {
	private readonly usedReferences: { [key: string]: ReferenceUser[] } = {}
	private readonly registeredReferences: { [key: string]: ValueResult } = {}

	public readonly types: { [key: string]: ExpressionType } = {}
	public readonly scope: EvaluationScope

	constructor(private readonly parent?: EvaluationContext) {
		this.scope = new EvaluationScope(this.parent?.scope)
		if (parent == null) {
			initializeScope(this.scope)

			initializeNumberTypes()
			initializeStringTypes()
			initializeCurrency()
			initializePercentage()

			this.types[anyType.name] = anyType
			this.types[numberType.name] = numberType
			this.types[integerType.name] = integerType
			this.types[floatType.name] = floatType
			this.types[stringType.name] = stringType
			this.types[booleanType.name] = booleanType

			this.types[percentageType.name] = percentageType

			this.types[currencyType.name] = currencyType
			this.types[euroCurrencyType.name] = euroCurrencyType
			this.types[dollarCurrencyType.name] = dollarCurrencyType
		} else {
			this.types = parent.types
		}
	}

	//TODO: When registering, unregistering and using references, we should clean up
	//      all unused references; That is, at least all references and values where
	//      .context.result is undefined. Those are result contexts that have never
	//      been used in a real result.
	//      Also, there might be result contexts that depend on another result, but
	//      that have never been registered as a reference. Those must be cleaned
	//      too!
	registerReference(name: string, reference: ValueResult) {
		this.scope.register({
			type: 'Reference',
			referencedValue: reference,
			definition: [ { type: 'Symbol', text: name } ],
		})
		this.registeredReferences[name] = reference

		this.usedReferences[name]?.forEach(u => this.#invalidateUser(u))
	}

	unregisterReference(name: string) {
		const existingNode = this.scope.node({ type: 'Symbol', text: name })
		if(existingNode) {
			if(existingNode.value) {
				if(existingNode.value.type==='Reference') {
					existingNode.unregisterValue()
				} else {
					throw new Error('Cannot unregister non-reference value in unregisterReference!')
				}
			}
		}
		if(this.registeredReferences[name]) {
			this.registeredReferences[name].context.result = undefined
			delete this.registeredReferences[name]
		}

		this.usedReferences[name]?.forEach(u => this.#invalidateUser(u))
	}

	use(reference: ReferenceNode, user: ReferenceUser): ValueResult | undefined {
		const parentResult = this.parent?.use(reference, user)
		if(parentResult != null) {
			return parentResult
		}

		const value = this.scope.node({type: "Symbol", text: reference.references})?.value

		if(this.usedReferences[reference.references] == null) {
			this.usedReferences[reference.references] = []
		}

		const existingUser = this.usedReferences[reference.references].find(u => u===user)
		if(existingUser == null) {
			this.usedReferences[reference.references].push(user)
		}

		if(value?.type === 'Reference') {
			return value.referencedValue
		}
		return undefined
	}

	#invalidateUser(user: ReferenceUser) {
		const registered = Object.keys(this.registeredReferences)
			.map(k => [ k, this.registeredReferences[k]] as [string, ValueResult])
			.filter(rr => rr[1]===user.result)
		registered.forEach(([name, _]) => this.usedReferences[name]?.forEach(u => this.#invalidateUser(u)))

		user.invalidate()
	}
}

function initializeScope(scope: EvaluationScope) {
	scope.register({
		type: 'Function',
		valueType: '<T>',
		evaluate: (params) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			return params[0].value
		},
		definition: [
			{ type: 'Operator', text: '(' },
			{ type: 'Parameter', parameterType: '<T>' },
			{ type: 'Operator', text: ')' },
		],
	})
}
