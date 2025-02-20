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

import { Token } from "../SxToken";
import { ExpressionType } from "../types/ExpressionType";
import { EvaluationScope, NewReference, ScopedValue, ScopeTreeNode } from "./EvaluationScope";

interface Symbol {
	type: 'Symbol',
	text: string,
}
interface Operator {
	type: 'Operator',
	text: string,
}
interface Value {
	type: 'Value',
	valueType: ExpressionType,
	value: any,
}
interface FunctionApplication {
	type: 'FunctionApplication',
	valueType: ExpressionType,
	func: (ScopedValue & { type: 'Function'}),
	parts: ParseTreeNode[],
	self?: ParseTreeNode,
}
export interface ReferenceNode {
	type: 'Reference',
	valueType: ExpressionType,
	references: string,
}

interface LeafNode {
	nodeType: 'Leaf',
	token: Token,
}
interface InnerNode {
	nodeType: 'Node',
}
type TreeNode = LeafNode | InnerNode

export type ParseTreeNode = (Symbol | Operator | Value | FunctionApplication | ReferenceNode) & (TreeNode)

interface ParseContext {
	readonly types: { [key: string]: ExpressionType }
	readonly scope: EvaluationScope
}

//TODO parse does not handle errors very well. It should report errors to the
//     caller, since several things can go wrong here. Especially when processing
//     references: Those are evaluated during "parse", otherwise we could not
//     really determine their return type. The caller only gets an "undefined"
//     if something goes wrong here, and cannot report the error in its result.
export function parse(tokens: Token[], context: ParseContext, evalId?: string): ParseTreeNode | undefined {
	let leafNodes = initializeTreeLeafNodes(tokens, context)

	const result = parseValue(leafNodes[0], leafNodes, 0, context, evalId)
	if(result[1] !== leafNodes.length) { return undefined }

	return result[0]
}

function parseFrom(
	leafNodes: ((Symbol | Operator | Value) & (TreeNode))[],
	start: number,
	scope: ScopeTreeNode,
	context: ParseContext,
	evalId?: string,
	self?: ParseTreeNode,
	firstPart?: ParseTreeNode,
): [ ParseTreeNode | undefined, number ] {
	let i = 0
	const parsedParts: ParseTreeNode[] = []
	if(firstPart) { parsedParts.push(firstPart) }

	let lastResult: ParseTreeNode | undefined = undefined

	let scopeNode = scope
	while((start+i) < leafNodes.length) {
		lastResult = undefined
		let currentLeaf: ParseTreeNode = leafNodes[start+i]
		if(currentLeaf.type === 'Symbol' || currentLeaf.type === 'Operator') {
			let nextNode = scopeNode.node(currentLeaf)
			if(nextNode && nextNode.value?.type!=='Reference') {
				scopeNode = nextNode
				parsedParts.push(currentLeaf)
				i++
			} else {
				const [parsedValue, parsedLength] = parseValue(currentLeaf, leafNodes, start+i, context, evalId,)
				if(parsedValue != null) {
					let selfType = (self?.type==='FunctionApplication' || self?.type==='Reference' || self?.type==='Value')?
						self.valueType :
						undefined
					nextNode = scopeNode.node(parsedValue, selfType)
					if (nextNode) {
						scopeNode = nextNode
						parsedParts.push(parsedValue)
						i += parsedLength
					} else {
						return [undefined, 0];
					}
				} else {
					break;
				}
			}
		} else {
			const [ parsedValue, parsedLenght ] = parseValue(currentLeaf, leafNodes, start+i, context, evalId)
			if(parsedValue == null) { return [undefined, 0] }

			lastResult = parsedValue
			currentLeaf = lastResult
			parsedParts.push(currentLeaf)

			let selfType = (self?.type==='FunctionApplication' || self?.type==='Reference' || self?.type==='Value')?
				self.valueType :
				undefined

			let nextNode = scopeNode.node(currentLeaf, selfType)
			if(nextNode) {
				scopeNode = nextNode
			} else {
				return [ undefined, 0 ]
			}
			i += parsedLenght
		}
	}

	const value = scopeNode.value
	if(value?.type === 'Function') {
		let returnType = value.valueType
		if(returnType === '<Self>') {
			if(self?.type==='FunctionApplication' || self?.type==='Reference' || self?.type==='Value') {
				returnType = self.valueType.name
			}
		} else if(returnType[0]==='<' && returnType[returnType.length-1]==='>') {
			//find the correct type from the parameter
			for (let i=0; i < value.definition.length; i++) {
				const d = value.definition[i]
				if(d.type === 'Parameter') {
					if(d.parameterType===returnType) {
						returnType = (parsedParts[i] as any)?.valueType?.name
						break;
					}
				}
			}
		}
		return [
			{
				type: 'FunctionApplication',
				nodeType: 'Node',
				valueType: context.types[returnType],
				func: value,
				parts: parsedParts,
				self,
			},
			i
		]
	} else if(lastResult) {
		return [ lastResult, i ]
	}
	return [ undefined, 0 ]
}

function parseValue(
	currentLeaf: ((Symbol | Operator | Value) & (TreeNode)),
	leafNodes: ((Symbol | Operator | Value) & (TreeNode))[],
	start: number,
	context: ParseContext,
	evalId?: string,
): [ ParseTreeNode | undefined, number ] {
	let result: [ ParseTreeNode | undefined, number ] = [ undefined, 0 ]
	if(currentLeaf.type === 'Symbol' || currentLeaf.type === 'Operator') {
		const newScopeNode = context.scope.node(currentLeaf)
		if(newScopeNode != null) {
			if (newScopeNode.value?.type === 'EvalReference') {
				if(newScopeNode.fullPath.length !== 1) {
					throw new Error('Cannot reference a value when the full path does not have length 1, has: '+newScopeNode.fullPath.length)
				}
				const scopedValue = newScopeNode.value as NewReference
				const value = scopedValue.referenced.evaluate(evalId ?? '-fixme-')
				if(value.resultType === 'value') {
					const definition = newScopeNode.fullPath[0]
					if(definition.type!=='Operator' && definition.type!=='Symbol') {
						throw new Error('Cannot reference a value when the definition is not either an operator or a symbol, is: '+definition.type)
					}
					result = [
						{
							type: 'Reference',
							nodeType: 'Node',
							valueType: value.type,
							references: definition.text,
						},
						1
					]
				} else {
					//TODO handle parse error here, too.
				}
			} else if(newScopeNode.value?.type === 'Reference') {
				if(newScopeNode.fullPath.length !== 1) {
					throw new Error('Cannot reference a value when the full path does not have length 1, has: '+newScopeNode.fullPath.length)
				}
				const value = newScopeNode.value
				const definition = newScopeNode.fullPath[0]
				if(definition.type!=='Operator' && definition.type!=='Symbol') {
					throw new Error('Cannot reference a value when the definition is not either an operator or a symbol, is: '+definition.type)
				}
				result = [
					{
						type: 'Reference',
						nodeType: 'Node',
						valueType: value.referencedValue.type,
						references: definition.text,
					},
					1
				]
			} else {
				const innerResult = parseFrom(leafNodes, start+1, newScopeNode, context, evalId, undefined, currentLeaf)
				if(innerResult[0] != null) {
					//continue parsing on inner result...
					result = [ innerResult[0], innerResult[1]+1 ]
				} else {
					result = [undefined, 0]
				}
			}
		}
	} else {
		result = [ currentLeaf, 1 ]
	}

	let [ nextValue, nextLength ] = result
	let startIndex = nextLength
	while(nextValue?.type==='Value' || nextValue?.type==='FunctionApplication' || nextValue?.type==='Reference') {
		let type = nextValue.valueType
		let innerScope = type.scope
		while(innerScope == null && type.extends != null) {
			type = type.extends
			innerScope = type.scope
		}
		if(innerScope != null) {
			[nextValue, nextLength] = parseFrom(leafNodes, start+startIndex, innerScope, context, evalId, nextValue)
			if (nextValue != null) {
				result = [nextValue, result[1] + nextLength]
				startIndex += nextLength
			}
		} else {
			nextValue = undefined
		}
	}

	return result
}

export function initializeTreeLeafNodes(tokens: Token[], context: ParseContext): ((Symbol | Operator | Value) & (TreeNode))[] {
	return tokens.map(t => initializeLeafNode(t, context))
}
function initializeLeafNode(token: Token, context: ParseContext): (Symbol | Operator | Value) & (TreeNode) {
	if(token.type === 'Number') {
		if(token.text.indexOf('.') >= 0) {
			return {
				type: 'Value', valueType: context.types['Float'], nodeType: 'Leaf', token: token,
				value: Number.parseFloat(token.text),
			}
		} else {
			return {
				type: 'Value', valueType: context.types['Integer'], nodeType: 'Leaf', token: token,
				value: Number.parseInt(token.text),
			}
		}
	} else if(token.type === 'String') {
		return {
			type: 'Value', valueType: context.types['String'], nodeType: 'Leaf', token: token,
			value: token.text,
		}
	} else if(token.type === 'Boolean') {
		return {
			type: 'Value', valueType: context.types['Boolean'], nodeType: 'Leaf', token: token,
			value: token.text==='true',
		}
	} else if(token.type === 'Symbol') {
		return { type: 'Symbol', nodeType: 'Leaf', token: token, text: token.text }
	} else if(token.type === 'Operator') {
		return { type: 'Operator', nodeType: 'Leaf', token: token, text: token.text }
	}

	throw new Error('Cannot map token to parse tree node: '+token.type+': "'+token.text+'"')
}
