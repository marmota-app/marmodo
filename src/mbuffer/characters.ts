/*
Copyright [2020-2024] [David Tanzer - @dtanzer@social.devteams.at]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export function isCharacter(other: string | string[], char: string): boolean {
	if(Array.isArray(other)) {
		for(const o of other) {
			if(o === char) { return true }
		}	
	} else {
		if(other === char) { return true }
	}

	return false
}

export function isWhitespace(char: string): boolean {
	return isCharacter([' ', '\t', '\u00A0', '\u202F', ], char)
}

export function isPunctuation(char: string): boolean {
	return isCharacter([
		'!',
		'"',
		'#',
		'$',
		'%',
		'&',
		'\'',
		'(',
		')',
		'*',
		'+',
		',',
		'-',
		'.',
		'/',
		':',
		';',
		'<',
		'=',
		'>',
		'?',
		'@',
		'[',
		'\\',
		']',
		'^',
		'_',
		'`',
		'{',
		'|',
		'}',
		'~',
	], char)
}

export function isLineEnding(char: string): boolean {
	return isCharacter(['\r', '\n'], char)
}
