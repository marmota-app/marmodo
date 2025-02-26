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

import { EvaluationScope } from "./eval/EvaluationScope";
import { ReferenceNode } from "./eval/parse";
import { SxEvaluation, ValueResult } from "./SxEvaluation";
import { anyType } from "./types/base/any";
import { booleanType } from "./types/base/boolean";
import { floatType, initializeNumberTypes, integerType, numberType } from "./types/base/numbers";
import { initializeStringTypes, stringType } from "./types/base/string";
import { ExpressionType } from "./types/ExpressionType";
import { currencyType, dollarCurrencyType, euroCurrencyType, initializeCurrency } from "./types/units/currency";
import { initializePercentage, percentageType } from "./types/units/percentage";

export class SxContext {
	public readonly types: { [key: string]: ExpressionType } = {}
	public readonly scope: EvaluationScope

	constructor(public readonly parent?: SxContext) {
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

	createEvaluation(expression: string): SxEvaluation {
		return new SxEvaluation(expression, this)
	}

	get(reference: ReferenceNode): SxEvaluation | undefined {
		const scopeNode = this.scope.node({ type: 'Symbol', text: reference.references })

		if(scopeNode != null && scopeNode.value?.type === 'EvalReference') {
			return scopeNode.value.referenced
		}
		return undefined
	}

	registerNamed(evaluation: SxEvaluation, name: string) {
		this.scope.register({
			type: 'EvalReference',
			definition: [ { type: 'Symbol', text: name } ],
			referenced: evaluation,
		})
	}
	unregisterNamed(name: string) {
		const scopeNode = this.scope.node({ type: 'Symbol', text: name })

		if(scopeNode != null && scopeNode.value?.type === 'EvalReference') {
			scopeNode.unregisterValue()
		}
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
