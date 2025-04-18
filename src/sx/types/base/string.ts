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

import { ValueResult } from "src/sx/SxEvaluation";
import { EvaluationScope } from "../../eval/EvaluationScope";
import { ExpressionType } from "../ExpressionType";
import { anyType } from "./any";
import { numberAdd, numberDivide, numberMultiply, numberSubstract } from "./numbers";

const stringScope = new EvaluationScope()

export const stringType: ExpressionType = {
	name: 'String',
	extends: anyType,
	scope: stringScope,
}

export function initializeStringTypes() {
	stringScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberAdd,
		definition: [
			{ type: 'Operator', text: '+' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	stringScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberSubstract,
		definition: [
			{ type: 'Operator', text: '-' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	stringScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberMultiply,
		definition: [
			{ type: 'Operator', text: '*' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})
	stringScope.register({
		type: 'Function',
		valueType: 'Number',
		evaluate: numberDivide,
		definition: [
			{ type: 'Operator', text: '/' },
			{ type: 'Parameter', parameterType: 'Number | String' },
		],
	})

	stringScope.register({
		type: 'Function',
		valueType: 'Integer',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly one parameter, got: '+params.length) }
			const resultValue = params[0].value.length
			const result: ValueResult = {
				resultType: 'value',
				type: context.types['Number'],
				value: resultValue,
				asString: `${resultValue}`
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: 'length' },
		],
	})
}
