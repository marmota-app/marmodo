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

import { jsonTransientPrivate } from "../utilities/jsonTransient";
import { parse, ParseTreeNode } from "./eval/parse";
import { SxContext } from "./SxContext";
import { tokenize } from "./SxToken";
import { ExpressionType } from "./types/ExpressionType";

export interface ErrorResult {
	resultType: 'error',
	message: string,
}
export interface ValueResult {
	resultType: 'value',
	type: ExpressionType,
	value: any,
	asString: string,
}
export interface ReferenceResult {
	resultType: 'reference',
	referenced: SxEvaluation,
}
export type ValidEvalResult = ValueResult | ReferenceResult
export type EvalResult = ErrorResult | ValueResult | ReferenceResult

export class SxEvaluation {
	private lastResult: EvalResult | null = null
	private lastEvalId: string | null = null

	constructor(private readonly expression: string, private readonly context: SxContext) {
		jsonTransientPrivate(this, 'context')
	}

	get result(): EvalResult | null {
		return this.lastResult
	}

	evaluate(evalId: string): EvalResult {
		if(this.lastEvalId === evalId) {
			if(this.lastResult != null) {
				return this.lastResult
			}
			return {
				resultType: 'error',
				message: 'Circular dependency detected',
			}
		}

		this.lastResult = null
		this.lastEvalId = evalId

		this.lastResult = evaluateExpression(this.expression, this.context, evalId)
		return this.lastResult
	}
}

function evaluateExpression(expression: string, context: SxContext, evalId: string): EvalResult {
	try {
		const tokens = tokenize(expression)
		const parseRoot = parse(tokens, context, evalId)

		if(parseRoot != null) {
			const result = evaluateParseTree(parseRoot, context, evalId)
			return result
		}
	} catch(e) {
		console.error(e)
		//FIXME should probably return a different error than the default error below...
	}

	return {
		resultType: 'error',
		message: '',
	}
}

function evaluateParseTree(node: ParseTreeNode, context: SxContext, evalId: string): EvalResult {
	if(node.nodeType==='Leaf' && node.type==='Value') {
		return {
			resultType: 'value',
			type: node.valueType,
			value: node.value,
			asString: node.token.text,
		}
	} else if(node.type==='Reference') {
		const referenced = context.get(node)

		if(referenced != null) {
			const value = referenced.evaluate(evalId)
			if(value.resultType === 'value') {
				return {
					resultType: 'value',
					type: value.type,
					value: value.value,
					asString: value.asString,
				}
			} else {
				//TODO handle error
			}
		}
	} else if(node.type==='FunctionApplication') {
		const params: ValueResult[] = []
		if(node.self) {
			const selfResult = evaluateParseTree(node.self, context, evalId)
			let currentResult = selfResult
			while(currentResult.resultType==='reference') {
				currentResult = currentResult.referenced.evaluate(evalId)
			}
			if(currentResult.resultType==='error') { return currentResult }
			params.push(currentResult)
		}
		for(let part of node.parts) {
			if(part.type==='Value' || part.type==='FunctionApplication' || part.type==='Reference') {
				const partResult = evaluateParseTree(part, context, evalId)
				let currentResult = partResult
				while(currentResult.resultType==='reference') {
					currentResult = currentResult.referenced.evaluate(evalId)
				}
				if(currentResult.resultType==='error') { return currentResult }
				params.push(currentResult)
			}
		}

		let result = node.func.evaluate(params, context)
		while(result.resultType === 'reference') {
			result = result.referenced.evaluate(evalId)
		}
		if(result.resultType === 'value') {
			if(typeof result.value === 'number') {
				result.asString = `${Number(result.value.toFixed(12))}`
			}
		}
		return result
	}
	return {
		resultType: 'error',
		message: '',
	}
}
