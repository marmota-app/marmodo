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

import { EvaluationScope } from "../../eval/EvaluationScope";
import { ExpressionType } from "../ExpressionType";
import { anyType } from "../base/any";

const currencyScope = new EvaluationScope()

export class Currency {
	constructor(public amount: number, public currency: string) {}

	get asString() {
		return this.amount+' '+this.currency
	}
}
export const currencyType: ExpressionType = {
	name: 'Currency',
	extends: anyType,
	scope: currencyScope,
}

export const euroCurrencyType: ExpressionType = {
	name: 'Currency:Euro',
	extends: currencyType,
}

export const dollarCurrencyType: ExpressionType = {
	name: 'Currency:Dollar',
	extends: currencyType,
}

export function initializeCurrency() {
	currencyScope.register({
		type: 'Function',
		valueType: '<Same>',
		evaluate: (params) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
			return new Currency(params[0].value.amount + params[1].value.amount, params[0].value.currency)
		},
		definition: [
			{ type: 'Operator', text: '+' },
			{ type: 'Parameter', parameterType: '<Same>' },
		],
	})

	currencyScope.register({
		type: 'Function',
		valueType: '<Self>',
		evaluate: (params) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
			return new Currency(params[0].value.amount * params[1].value.amount / 100.0, params[0].value.currency)
		},
		definition: [
			{ type: 'Operator', text: '*' },
			{ type: 'Parameter', parameterType: 'Percentage' },
		],
	})
	currencyScope.register({
		type: 'Function',
		valueType: '<Self>',
		evaluate: (params) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
			return new Currency(params[0].value.amount * params[1].value, params[0].value.currency)
		},
		definition: [
			{ type: 'Operator', text: '*' },
			{ type: 'Parameter', parameterType: 'Number' },
		],
	})
	currencyScope.register({
		type: 'Function',
		valueType: '<Self>',
		evaluate: (params) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameters, got: '+params.length) }
			return new Currency(params[0].value.amount + params[0].value.amount * params[1].value.amount / 100.0, params[0].value.currency)
		},
		definition: [
			{ type: 'Operator', text: '+' },
			{ type: 'Parameter', parameterType: 'Percentage' },
		],
	})
}
