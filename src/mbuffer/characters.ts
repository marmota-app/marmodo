/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2024  David Tanzer - @dtanzer@social.devteams.at

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
