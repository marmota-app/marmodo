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

export interface Token {
	type: 'Symbol' | 'Number' | 'Operator' | 'String' | 'Boolean',
	text: string,
}

export function tokenize(input: string): Token[] {
	const result: Token[] = []

	let nextToken: Token = {
		type: 'Symbol',
		text: '',
	}
	for(let i=0; i<input.length; i++) {
		if(input[i] === '"') {
			if(nextToken.type === 'String') {
				nextToken.text = nextToken.text.substring(1)
				addTokenTo(result, nextToken)
				nextToken = {
					type: 'Symbol',
					text: '',
				}
			} else {
				if(nextToken.text.length > 0) { addTokenTo(result, nextToken) }
				nextToken = {
					type: 'String',
					text: input[i],
				}
			}
			continue
		}
		if(nextToken.type === 'String') {
			nextToken.text += input[i]
			continue
		}

		if(input[i] === ' ') {
			if(nextToken.text.length > 0) { addTokenTo(result, nextToken) }
			nextToken = {
				type: 'Symbol',
				text: '',
			}
			continue
		}

		if(isDigit(input[i])) {
			if(nextToken.type === 'Number') {
				nextToken.text += input[i]
				continue
			} else {
				if(nextToken.type !== 'Symbol' || nextToken.text.length===0) {
					if(nextToken.text.length > 0) { addTokenTo(result, nextToken) }
					nextToken = {
						type: 'Number',
						text: input[i],
					}
					continue
				}
			}
		}
		if(input[i]==='.' && nextToken.type==='Number') {
			nextToken.text += input[i]
			continue
		}

		if(isOperator(input[i])) {
			if(nextToken.type === 'Operator' && canAppendOperator(nextToken, input[i])) {
				nextToken.text += input[i]
			} else {
				if(nextToken.text.length > 0) { addTokenTo(result, nextToken) }
				nextToken = {
					type: 'Operator',
					text: input[i],
				}
			}
			continue
		}

		if(nextToken.type === 'Symbol') {
			nextToken.text += input[i]
		} else {
			if(nextToken.text.length > 0) { addTokenTo(result, nextToken) }
			nextToken = {
				type: 'Symbol',
				text: input[i],
			}
		}
	}
	if(nextToken.text.length !== 0) {
		//If a string falls out of the loop, it was unfinished!
		if(nextToken.type === 'String') { nextToken.type = 'Symbol' }
		addTokenTo(result, nextToken)
	}

	return result
}

function addTokenTo(result: Token[], token: Token) {
	if(token.type === 'Symbol') {
		if(token.text === 'true' || token.text === 'false') {
			token.type = 'Boolean'
		}
	}
	result.push(token)
}
function isDigit(char: string): boolean {
	switch(char) {
		case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': return true
	}
	return false
}

function isOperator(char: string): boolean {
	switch(char) {
		case '.': case ',': case ';':
		case '-': case '+': case '*': case '/': case '%': case '^':
		case '(': case ')': case '[': case ']': case '<': case '>': case '{': case '}':
		case '|': case '#': case '°': case '!': case '§':
		case '%': case '&': case '=': case '?': case '\\': case '`':
		case '\'': case '´': case '~': case '#':
			return true
	}
	return false
}

function canAppendOperator(token: Token, input: string): boolean {
	if(isBracket(token.text.charAt(token.text.length-1)) || isBracket(input)) {
		return false
	}
	return true;
}

function isBracket(char: string) {
	switch(char) {
		case '(': case ')': case '[': case ']': case '{': case '}': return true
	}
	return false
}
