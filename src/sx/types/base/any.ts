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

import { EvalResult, ValueResult } from "../../SxEvaluation";
import { EvaluationScope, FunctionParameter, ScopedValue } from "../../eval/EvaluationScope";
import { ExpressionType } from "../ExpressionType";
import { SxContext } from "../../SxContext";

export const anyScope = new EvaluationScope()
export const anyType: ExpressionType = {
	name: 'Any',
	extends: null,
	scope: anyScope,
}

export function initializeAnyType() {
	anyScope.register(dynamicDispatchOperator('*'))
	anyScope.register(dynamicDispatchOperator('+'))
	anyScope.register(dynamicDispatchOperator('-'))
	anyScope.register(dynamicDispatchOperator('/'))
}

function dynamicDispatchOperator(operatorName: string): ScopedValue {
	const dynamicOperator: ScopedValue = {
		type: 'Function',
		valueType: 'Any',
		evaluate: (params: FunctionParameter[], context: SxContext): EvalResult => {
			if(params[0].value.resultType === 'error' || params[1].value.resultType === 'error') {
				//FIXME correct response?
				throw new Error('cannot evaluate result when one of the parameters was an error')
			}

			const p0 = params[0].value.resultType === 'value'? params[0].value as ValueResult : params[0]
			const p1 = params[1].value.resultType === 'value'? params[1].value as ValueResult : params[1]

			let type = context.types[p0.type.name]
			while(type != null && type.scope == null && type.extends != null) {
				type = type.extends
			}
			const scope = type.scope

			const operator = scope?.node({ type: 'Operator', text: operatorName })?.node({ type: 'Value', valueType: p1.type }, p0.type)
			if(operator?.value != dynamicOperator && operator?.value?.type==='Function') {
				const resultValue = operator.value.evaluate([p0, p1], context)
				return resultValue
			}

			return {
				resultType: 'error',
				message: `Cannot find operator "${operatorName}" for values [${p0.value.asString ?? p0.value}] (${p0.type.name}) and [${p1.value.asString ?? p1.value}] (${p1.type.name})`
			}
		},
		definition: [
			{ type: 'Operator', text: operatorName },
			{ type: 'Parameter', parameterType: 'Any' },
		],
	}
	return dynamicOperator
}
