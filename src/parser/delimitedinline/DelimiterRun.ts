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

import { isLineEnding, isPunctuation, isWhitespace } from "../../mbuffer/characters";
import { TemporaryLocation, TextLocation } from "../../mbuffer/TextLocation";
import { finiteLoop } from "../../utilities/finiteLoop";

interface DelimiterInfo {
	isLeftFlanking: boolean,
	isRightFlanking: boolean,
}
interface SearchOptions {
	rightFlanking: boolean,
	minLength: number,
}
export function findNextDelimiterRun(delimiters: string[], start: TextLocation, end: TextLocation, searchOptions: Partial<SearchOptions> = {}): [TextLocation, TextLocation, DelimiterInfo] | null {
	const options: SearchOptions = {
		rightFlanking: false,
		minLength: 0,
		...searchOptions,
	}
	let delimiterStart = start.accessor()
	let beforeStart = ''

	const outerLoop = finiteLoop(() => [ delimiterStart.info() ])
	while(!delimiterStart.isEqualTo(end)) {
		outerLoop.ensure()

		let delimiter = ''
		delimiters.forEach(d => { if(delimiterStart.get() === d) { delimiter = d }})

		if(delimiter !== '') {
			const delimiterEnd = delimiterStart.accessor()
			let delimiterLength = 0

			const innerLoop = finiteLoop(() => [ delimiterEnd.info() ])
			while(!delimiterEnd.isEqualTo(end) && delimiterEnd.get() === delimiter) {
				innerLoop.ensure()
				delimiterEnd.advance()
				delimiterLength++
			}
		
			if(!delimiterStart.isEqualTo(delimiterEnd)) {
				const isLeftFlanking = isLeftFlankingRun(beforeStart, delimiterEnd, end)
				const isRightFlanking = isRightFlankingRun(delimiterStart, start, beforeStart, delimiterEnd, end)

				const isFlanking = isLeftFlanking || isRightFlanking
				const isLongEnough = delimiterLength >= options.minLength
				const isRightFlankingLikeSearch = options.rightFlanking==false || isRightFlanking

				if(isFlanking && isLongEnough && isRightFlankingLikeSearch) {
					return [delimiterStart, delimiterEnd, { isLeftFlanking, isRightFlanking }]
				}
			}
		
			delimiterStart = delimiterEnd
		} else {
			beforeStart = delimiterStart.get()
			delimiterStart.advance()	
		}
	}

	return null
}

function isLeftFlankingRun(beforeStart: string, delimiterEnd: TemporaryLocation, end: TextLocation): boolean {
	//ATTENTION: For purposes of this definition, the beginning and the end
	//of the line count as Unicode whitespace.

	//A left-flanking delimiter run is a delimiter run that is...
	if(!delimiterEnd.isEqualTo(end)) {
		//(1) not followed by Unicode whitespace,
		const isFollowedByUnicodeWhitespace = delimiterEnd.isWhitespace() || delimiterEnd.isLineEnding()
		if(isFollowedByUnicodeWhitespace) {
			return false
		}

		//and either
		const isFollowedByPunctuation = delimiterEnd.isPunctuation()
		if(isFollowedByPunctuation) {
			//or (2b) followed by a punctuation character and preceded by
			//Unicode whitespace or a punctuation character. 
			return beforeStart==='' || //proxy comparison for start of the range
				isWhitespace(beforeStart) || isLineEnding(beforeStart) ||
				isPunctuation(beforeStart)
		} else {
			//(2a) not followed by a punctuation character,
			return true
		}
	}
	return false
}
function isRightFlankingRun(delimiterStart: TemporaryLocation, start: TextLocation, beforeStart: string, afterDelimiter: TemporaryLocation, end: TextLocation): boolean {
	//ATTENTION: For purposes of this definition, the beginning and the end 
	//of the line count as Unicode whitespace.

	//A right-flanking delimiter run is a delimiter run that is...
	if(!delimiterStart.isEqualTo(start)) {
		//(1) not preceded by Unicode whitespace,
		const isPrecededByUnicodeWhitespace = isWhitespace(beforeStart) || isLineEnding(beforeStart)
		if(isPrecededByUnicodeWhitespace) {
			return false
		}
		//and either
		const isPrecededByPunctuation = isPunctuation(beforeStart)
		if(isPrecededByPunctuation) {
			//or (2b) preceded by a punctuation character and followed by
			//Unicode whitespace or a punctuation character.
			return afterDelimiter.isEqualTo(end) ||
				afterDelimiter.isWhitespace() || afterDelimiter.isLineEnding() ||
				afterDelimiter.isPunctuation()
		} else {
			//(2a) not preceded by a punctuation character,
			return true
		}
	}
	return false
}
