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

import { parse, ParseTreeNode } from "./eval/parse";
import { EvaluationContext, ReferenceUser } from "./EvaluationContext";
import { tokenize } from "./SxToken";
import { ExpressionType } from "./types/ExpressionType";

export class ResultContext implements ReferenceUser {
	private invalidatedCallback = () => {}
	public result?: ValueResult

	invalidate() {
		this.invalidatedCallback()
	}
	onResultInvalidated(callback: () => unknown) {
		this.invalidatedCallback = callback
	}
}
export interface ErrorResult {
	resultType: 'error',
	message: string,
	near: [string, number],
}
export interface ValueResult {
	resultType: 'value',
	valueType: 'literal' | 'computed',
	type: ExpressionType,
	value: any,
	asString: string,
	context: ResultContext,
}
export type EvalResult = ErrorResult | ValueResult

export function evaluate(input: string, context: EvaluationContext): EvalResult {
	try {
		const tokens = tokenize(input)
		const parseRoot = parse(tokens, context)

		if(parseRoot != null) {
			const resultContext = new ResultContext()
			const result = evaluateParseTree(parseRoot, context, resultContext)
			if(result.resultType === 'value') {
				resultContext.result = result
			}
			return result
		}
	} catch(e) {
		console.error(e)
		//FIXME should probably return a different error than the default error below...
	}

	return {
		resultType: 'error',
		message: '',
		near: ['', 0]
	}
}

function evaluateParseTree(node: ParseTreeNode, context: EvaluationContext, resultContext: ResultContext): EvalResult {
	if(node.nodeType==='Leaf' && node.type==='Value') {
		return {
			resultType: 'value',
			type: node.valueType,
			valueType: 'literal',
			value: node.value,
			asString: node.token.text,
			context: resultContext,
		}
	} else if(node.type==='Reference') {
		const value = context.use(node, resultContext)
		if(value != null) {
			return {
				resultType: 'value',
				type: value.type,
				valueType: 'computed',
				value: value.value,
				asString: value.asString,
				context: resultContext,
			}
		}
	} else if(node.type==='FunctionApplication') {
		const params: ValueResult[] = []
		if(node.self) {
			const selfResult = evaluateParseTree(node.self, context, resultContext)
			if(selfResult.resultType==='error') { return selfResult }
			params.push(selfResult)
		}
		for(let part of node.parts) {
			if(part.type==='Value' || part.type==='FunctionApplication' || part.type==='Reference') {
				const partResult = evaluateParseTree(part, context, resultContext)
				if(partResult.resultType === 'error') { return partResult }
				params.push(partResult)
			}
		}

		const result = node.func.evaluate(params, context)
		return {
			resultType: 'value',
			type: node.valueType,
			valueType: 'computed',
			value: result,
			asString: result.asString ?? (''+result),
			context: resultContext,
		}
	}
	return {
		resultType: 'error',
		message: '',
		near: ['', 0]
	}
}
