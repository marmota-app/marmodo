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

import { ValueResult } from "src/sx/SxEvaluation";
import { EvaluationScope } from "../../sx/eval/EvaluationScope";
import { SxContext } from "../../sx/SxContext";
import { MfMCustomTableColumn } from "./CustomTableColumnParser";
import { MfMTable } from "./TableParser";
import { TableSxContext } from "./TableSxContext";

export class ColumnSxContext extends SxContext {
	public column: MfMCustomTableColumn | undefined
	
	constructor(public readonly parent?: SxContext) {
		super(parent)

		initializeScope(this.scope, this)
	}

	public get table(): MfMTable | undefined {
		return (this.parent as TableSxContext)?.table
	}
}

function initializeScope(scope: EvaluationScope, context: ColumnSxContext) {
	scope.register<ColumnSxContext>({
		type: 'Function',
		valueType: 'Number',
		evaluate: (params, context) => {
			if(context.column == null) { throw new Error('Cannot get table column: No column was set!') } //TODO can we get rid of this if by making column not-nullable?

			const columnNumber = context.column.tableColumn + 1
			const result: ValueResult = {
				resultType: 'value',
				value: columnNumber,
				type: context.types['Number'],
				asString: `${columnNumber}`,
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: 'col' },
		],
	})

	scope.register<ColumnSxContext>({
		type: 'Function',
		valueType: 'Number',
		evaluate: (params, context) => {
			if(context.column == null) { throw new Error('Cannot get table column: No column was set!') } //TODO can we get rid of this if by making column not-nullable?
			if(context.column.parent == null) { throw new Error('Cannot get table column: No parent row for the column was set!') } //TODO can we get rid of this if by making column not-nullable?

			const rowNumber = (context.column.parent as any).tableRow + 1
			const result: ValueResult = {
				resultType: 'value',
				value: rowNumber,
				type: context.types['Number'],
				asString: `${rowNumber}`,
			}
			return result
		},
		definition: [
			{ type: 'Symbol', text: 'row' },
		],
	})
}
