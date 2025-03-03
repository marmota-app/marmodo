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

import { EvaluationScope } from "../../sx/eval/EvaluationScope";
import { SxContext } from "../../sx/SxContext";
import { anyType } from "../../sx/types/base/any";
import { ExpressionType } from "../../sx/types/ExpressionType";
import { MfMTable } from "./TableParser";

const stringListScope = new EvaluationScope()
export const stringListType: ExpressionType = {
	name: 'List<String>',
	extends: anyType,
	scope: stringListScope,
}

export class TableSxContext extends SxContext {
	public table: MfMTable | undefined

	constructor(public readonly parent?: SxContext) {
		super(parent)

		this.types[stringListType.name] = stringListType

		initializeScope(this.scope)
	}
}

function initializeScope(scope: EvaluationScope) {
	scope.register({
		type: 'Function',
		valueType: 'String',
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
		valueType: 'List<String>',
		evaluate: (params, context) => {
			if(params.length !== 4) { throw new Error('Expected exactly two parameter, got: '+params.length) }
			if(context.table == null) { throw new Error('Expected to be called with a table SX context, got: '+context) }

			const fromCol = params[0].value
			const fromRow = params[1].value
			const toCol   = params[2].value
			const toRow   = params[3].value

			const result: string[] = []
			for(var c=fromCol; c<=toCol; c++) {
				for(var r=fromRow; r<=toRow; r++) {
					result.push(getColumnValue(context, c, r))
				}
			}
			return { list: result, asString: `[${result}]` }
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
		valueType: 'Number',
		evaluate: (params, context) => {
			if(params.length !== 1) { throw new Error('Expected exactly two parameter, got: '+params.length) }
			if(context.table == null) { throw new Error('Expected to be called with a table SX context, got: '+context) }

			const list = params[0].value.list as string[]
			return list.reduce((prev, cur) => {
				return prev + Number.parseFloat(cur)
			}, 0)
		},
		definition: [
			{ type: 'Symbol', text: 'sum' },
			{ type: 'Parameter', parameterType: 'List<String>' },
		],
	})

}

function getColumnValue(context: any, col: number, row: number): string {
	const table = context.table as MfMTable
	const column = table.tableRows[row-1].columns[col-1]
	if(column.type === 'CustomTableColumn') {
		return `${column.referenceMap['sx.result']}`
	}

	return column.plainContent.trim()
}
