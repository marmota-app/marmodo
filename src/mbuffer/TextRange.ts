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

import { MBuffer } from "./MBuffer";
import { Location, TextAccessor, TextLocation } from "./TextLocation";

export interface Range {
	readonly start: Location,
	readonly end: Location,
	readonly isValid: boolean,

	findNext: (toFind: string | string[]) => AccessorRange | null,

	rangeFrom: (location: Location) => AccessorRange,
	rangeUntil: (location: Location) => AccessorRange,

	fullTextRange: () => TextRange,
	textRangeUntil: (location: Location) => TextRange,
}
export class TextRange implements Range {
	constructor(public readonly start: TextLocation, public readonly end: TextLocation) {}

	asString = _asString.bind(this)
	findNext: (toFind: string | string[]) => AccessorRange | null = _findNext.bind(this)

	get isValid(): boolean {
		return this.start.isValid && this.end.isValid
	}

	rangeFrom: (location: Location) => AccessorRange = _rangeFrom.bind(this)
	rangeUntil: (location: Location) => AccessorRange = _rangeUntil.bind(this)

	fullTextRange(): TextRange {
		return this
	}
	textRangeUntil(location: Location): TextRange {
		const end = new TextLocation(location.buffer, location.index)
		return new TextRange(this.start, end)
	}
}

export class AccessorRange implements Range {
	constructor(public readonly start: TextAccessor, public readonly end: TextAccessor) {}
	readonly isValid = true

	asString = _asString.bind(this)
	findNext: (toFind: string | string[]) => AccessorRange | null = _findNext.bind(this)

	rangeFrom: (location: Location) => AccessorRange = _rangeFrom.bind(this)
	rangeUntil: (location: Location) => AccessorRange = _rangeUntil.bind(this)

	fullTextRange(): TextRange {
		const start = new TextLocation(this.start.buffer, this.start.index)
		const end = new TextLocation(this.end.buffer, this.end.index)
		return new TextRange(start, end)
	}
	textRangeUntil(location: Location): TextRange {
		const start = new TextLocation(this.start.buffer, this.start.index)
		const end = new TextLocation(location.buffer, location.index)
		return new TextRange(start, end)
	}
}

function _rangeFrom(this: Range, location: Location): AccessorRange {
	return new AccessorRange(
		location.accessor(),
		this.end.accessor()
	)
}
function _rangeUntil(this: Range, location: Location): AccessorRange {
	return new AccessorRange(
		this.start.accessor(),
		location.accessor(),
	)
}

function _asString(this: Range): string {
	if(!this.isValid) {
		throw new Error(`Range not valid! (start: "${this.start.buffer.asString()}", end: "${this.end.buffer.asString}")`)
	}
	let result = ''

	const currentLocation = this.start.accessor()
	while(currentLocation.isInRange(this.end)) {
		result += currentLocation.get()
		currentLocation.advance()
	}

	return result
}
function _findNext(this: Range, toFind: string | string[]): (AccessorRange | null) {
	//straight-forward implementation without considering any optimization
	//opportunities yet...
	interface FoundStatus {
		text: string,
		index: number,
		startBuffer: MBuffer | null,
		startIndex: number
	}
	const foundStatus: FoundStatus[] = Array.isArray(toFind)?
		toFind.map(s => ({
			text: s,
			index: 0,
			startBuffer: null,
			startIndex: 0,
		})):
		[{
			text: toFind,
			index: 0,
			startBuffer: null,
			startIndex: 0,
		}]
	const accessor = this.start.accessor()

	while(accessor.isInRange(this.end)) {
		const current = accessor.get()
		for(const status of foundStatus) {
			if(status.text[status.index] === current) {
				if(status.startBuffer == null) {
					status.startBuffer = accessor.buffer
					status.startIndex = accessor.index
				}
				status.index++
				if(status.index === status.text.length) {
					accessor.advance()
					const start = new TextAccessor(status.startBuffer, status.startIndex)
					const end = new TextAccessor(accessor.buffer, accessor.index)
					return new AccessorRange(start, end)
				}
			} else {
				status.startBuffer = null
				status.index = 0
			}
		}
		accessor.advance()
	}

	return null
}
