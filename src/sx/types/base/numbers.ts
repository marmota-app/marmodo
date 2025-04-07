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

import { EvaluationScope, FunctionParameter } from "../../eval/EvaluationScope";
import { Currency } from "../units/currency";
import { ExpressionType } from "../ExpressionType";
import { anyScope, anyType } from "./any";
import { Percentage } from "../units/percentage";
import { ValueResult } from "src/sx/SxEvaluation";
import { SxContext } from "src/sx/SxContext";

export const numberScope = new EvaluationScope(anyScope)

export const numberType: ExpressionType = {
	name: 'Number',
	extends: anyType,
	scope: numberScope,
}

export const integerType: ExpressionType = {
	name: 'Integer',
	extends: numberType,
}

export const floatType: ExpressionType = {
	name: 'Float',
	extends: numberType,
}

export function initializeNumberTypes() {
	numberScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberAdd,
		definition: [
			{ type: 'Operator', text: '+' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberSubstract,
		definition: [
			{ type: 'Operator', text: '-' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberMultiply,
		definition: [
			{ type: 'Operator', text: '*' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberDivide,
		definition: [
			{ type: 'Operator', text: '/' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})

	numberScope.register({
		type: 'Function',
		valueType: 'String',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['String'],
				value: ''+params[0].value,
				asString: ''+params[0].value,
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: 'toString' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Currency:Euro',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			const currencyValue = new Currency(params[0].value, '€')
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['Currency:Euro'],
				value: currencyValue,
				asString: currencyValue.asString
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: '€' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Currency:Dollar',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			const currencyValue = new Currency(params[0].value, '$')
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['Currency:Dollar'],
				value: currencyValue,
				asString: currencyValue.asString
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: '$' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Percentage',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			const percentageValue = new Percentage(params[0].value)
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['Percentage'],
				value: percentageValue,
				asString: percentageValue.asString
			}
			return result
		},
		definition: [
			{ type: 'Operator', text: '%' },
		],
	})

	numberScope.register({
		type: 'Function',
		valueType: 'Currency',
		evaluate: (params, context) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
			const currencyValue = new Currency(params[0].value * params[1].value.amount, params[1].value.currency)
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['Currency'],
				value: currencyValue,
				asString: currencyValue.asString
			}
			return result
		},
		definition: [
			{ type: 'Operator', text: '*' },
			{ type: 'Parameter', parameterType: 'Currency' },
		],
	})
}

export function numberAdd(params: FunctionParameter[], context: SxContext) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1: number = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2: number = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value

	const resultValue = val1 + val2
	const result: ValueResult = {
		resultType: 'value',
		type: context.types['Number'],
		value: resultValue,
		asString: `${resultValue}`
	}
	return result
}
export function numberSubstract(params: FunctionParameter[], context: SxContext) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value
	
	const resultValue = val1 - val2
	const result: ValueResult = {
		resultType: 'value',
		type: context.types['Number'],
		value: resultValue,
		asString: `${resultValue}`
	}
	return result
}
export function numberMultiply(params: FunctionParameter[], context: SxContext) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value

	const resultValue = val1 * val2
	const result: ValueResult = {
		resultType: 'value',
		type: context.types['Number'],
		value: resultValue,
		asString: `${resultValue}`
	}
	return result
}
export function numberDivide(params: FunctionParameter[], context: SxContext) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value

	const resultValue = val1 / val2
	const result: ValueResult = {
		resultType: 'value',
		type: context.types['Number'],
		value: resultValue,
		asString: `${resultValue}`
	}
	return result
}
