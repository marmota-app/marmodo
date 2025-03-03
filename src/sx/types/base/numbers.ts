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
import { anyType } from "./any";
import { Percentage } from "../units/percentage";

const numberScope = new EvaluationScope()

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
		evaluate: (params) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			return ''+params[0].value
		},
		definition: [
			{ type: 'Symbol', text: 'toString' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Currency:Euro',
		evaluate: (params) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			return new Currency(params[0].value, '€')
		},
		definition: [
			{ type: 'Symbol', text: '€' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Currency:Dollar',
		evaluate: (params) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			return new Currency(params[0].value, '$')
		},
		definition: [
			{ type: 'Symbol', text: '$' },
		],
	})
	numberScope.register({
		type: 'Function',
		valueType: 'Percentage',
		evaluate: (params) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			return new Percentage(params[0].value)
		},
		definition: [
			{ type: 'Operator', text: '%' },
		],
	})
}

export function numberAdd(params: FunctionParameter[]) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value
	return val1 + val2
}
export function numberSubstract(params: FunctionParameter[]) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value
	return val1 - val2
}
export function numberMultiply(params: FunctionParameter[]) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value
	return val1 * val2
}
export function numberDivide(params: FunctionParameter[]) {
	if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
	const val1 = typeof params[0].value==='string'? Number.parseFloat(params[0].value) : params[0].value
	const val2 = typeof params[1].value==='string'? Number.parseFloat(params[1].value) : params[1].value
	return val1 / val2
}
