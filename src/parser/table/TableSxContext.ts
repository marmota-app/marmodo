/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { EvalResult, ReferenceResult, ValueResult } from "../../sx/SxEvaluation";
import { EvaluationScope } from "../../sx/eval/EvaluationScope";
import { SxContext } from "../../sx/SxContext";
import { anyType } from "../../sx/types/base/any";
import { ExpressionType } from "../../sx/types/ExpressionType";
import { MfMCustomTableColumn } from "./CustomTableColumnParser";
import { MfMTable } from "./TableParser";

const anyListScope = new EvaluationScope()
export const anyListType: ExpressionType = {
	name: 'List<Any>',
	extends: anyType,
	scope: anyListScope,
}

export class TableSxContext extends SxContext {
	public table: MfMTable | undefined

	constructor(public readonly parent?: SxContext) {
		super(parent)

		this.types[anyListType.name] = anyListType

		initializeScope(this.scope)
	}
}

function initializeScope(scope: EvaluationScope) {
	scope.register({
		type: 'Function',
		valueType: 'Any',
		evaluate: (params, context) => {
			if(params.length !== 2) { throw new Error('Expected exactly two parameter, got: '+params.length) }
			if(context.table == null) { throw new Error('Expected to be called with a table SX context, got: '+context) }

			return getColumnValue(context, params[0].value, params[1].value)
		},
		definition: [
			{ type: 'Operator', text: '[' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ',' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ']' },
		],
	})

	scope.register({
		type: 'Function',
		valueType: 'List<Any>',
		evaluate: (params, context) => {
			if(params.length !== 4) { throw new Error('Expected exactly two parameter, got: '+params.length) }
			if(context.table == null) { throw new Error('Expected to be called with a table SX context, got: '+context) }

			const fromCol = params[0].value
			const fromRow = params[1].value
			const toCol   = params[2].value
			const toRow   = params[3].value

			const result: EvalResult[] = []
			for(var c=fromCol; c<=toCol; c++) {
				for(var r=fromRow; r<=toRow; r++) {
					result.push(getColumnValue(context, c, r))
				}
			}
			return {
				list: result,
				get asString(): string {
					return '[' + result.map(li => {
						while(li.resultType === 'reference') {
							li = li.referenced.result ?? { resultType: 'error', message: 'Referenced result does not have any content', near: [ '', 0 ] }
						}
						if(li.resultType === 'error') { return 'ERROR'}
						return li.asString
					}).join(',') + ']'
				},
			}
		},
		definition: [
			{ type: 'Operator', text: '[' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ',' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ']' },
			{ type: 'Operator', text: ':' },
			{ type: 'Operator', text: '[' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ',' },
			{ type: 'Parameter', parameterType: 'Number' },
			{ type: 'Operator', text: ']' },
		],
	})

	scope.register({
		type: 'Function',
		valueType: 'Any',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly two parameter, got: '+params.length) }
			if(context.table == null) { throw new Error('Expected to be called with a table SX context, got: '+context) }

			const list = params[0].value.list as EvalResult[]
			const initial: EvalResult = {
				resultType: 'value',
				asString: '0',
				type: context.types['Number'],
				value: 0,
			}
			return list.reduce((prev, cur) => {
				while(cur.resultType === 'reference') {
					cur = cur.referenced.result ?? { resultType: 'error', message: 'Referenced result does not conatain a value', near: ['', 0]}
				}
				if(cur.resultType !== 'value') { throw new Error('Can only sum value results, got an error for current') }
				if(prev.resultType !== 'value') { throw new Error('Can only sum value results, got an error for previous') }

				let type = context.types[prev.type.name]
				while(type != null && type.scope == null && type.extends != null) {
					type = type.extends
				}
				const scope = type.scope! //FIXME: What if there is no type or scope??

				const operator = scope.node({ type: 'Operator', text: '+' })?.node({ type: 'Value', valueType: cur.type })
				if(operator?.value?.type==='Function') {
					const operatorResult = operator.value.evaluate([prev, cur], context)
					const result: EvalResult = {
						resultType: 'value',
						type: context.types[operator.value.valueType],
						value: operatorResult,
						asString: `${operatorResult}`,
					}
					return result
				}

				throw new Error(`Cannot find plus-operator "${prev.type.name}+${cur.type.name}"`)
			}, initial)
		},
		definition: [
			{ type: 'Symbol', text: 'sum' },
			{ type: 'Parameter', parameterType: 'List<Any>' },
		],
	})

}

function getColumnValue(context: any, col: number, row: number): EvalResult {
	debugger
	const table = context.table as MfMTable
	const column = table.tableRows[row-1].columns[col-1]
	if(column.type === 'CustomTableColumn') {
		const evaluation = (column as MfMCustomTableColumn).evaluation
		if(evaluation) {
			const result: ReferenceResult = {
				resultType: 'reference',
				referenced: evaluation,
			}
			return result
		}
		return {
			resultType: 'error',
			message: '', //FIXME what could be the message here?
			near: ['', 0],
		}
	}

	const result: ValueResult = {
		resultType: 'value',
		type: context.types['String'],
		value: column.plainContent.trim(),
		asString: column.plainContent.trim()
	}
	return result
}
