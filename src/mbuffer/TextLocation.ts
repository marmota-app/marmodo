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

import { MBuffer } from "./MBuffer"

export interface Location {
	readonly buffer: MBuffer,
	readonly index: number,

	isEqualTo: (other: Location) => boolean,
	isBefore: (other: Location) => boolean,
	isAfter: (other: Location) => boolean,
	isAtLeast: (other: Location) => boolean,
	isAtMost: (other: Location) => boolean,
	isInRange: (end: Location) => boolean,

	accessor: () => TextAccessor,
}
export class TextLocation implements Location {
	constructor(protected _buffer: MBuffer | undefined, protected _index: number | undefined) {
		//TODO bounds checks necessary?
		_buffer?.registerLocation(this)
	}

	get buffer(): MBuffer {
		if(this._buffer !== undefined) { return this._buffer }
		throw new Error(`Cannot get buffer of invalid location (buffer: {undefined}, index: ${this._index})`)
	}
	get index(): number {
		if(this._index !== undefined) { return this._index }
		throw new Error(`Cannot get index of invalid location (buffer: {${this._buffer?.info()}}, index: ${this._index})`)
	}

	isEqualTo: (other: Location)=>boolean = _isEqualTo.bind(this)
	isBefore: (other: Location)=>boolean = _isBefore.bind(this)
	isAfter: (other: Location)=>boolean = _isAfter.bind(this)
	isAtLeast: (other: Location)=>boolean = _isAtLeast.bind(this)
	isAtMost: (other: Location)=>boolean = _isAtMost.bind(this)
	isInRange: (other: Location)=>boolean = _isInRange.bind(this)

	accessor(): TextAccessor {
		if(this._buffer!==undefined && this._index!==undefined) {
			return new TextAccessor(this._buffer, this._index)
		}
		throw new Error(`Cannot get accessor of invalid location (buffer: {${this._buffer?.info()}}, index: ${this._index})`)
	}

	update(newBuffer: MBuffer, newIndex: number) {
		const oldBuffer = this._buffer

		this._buffer = newBuffer
		this._index  = newIndex

		if(oldBuffer !== newBuffer) {
			newBuffer.registerLocation(this)
		}
	}

	get isValid(): boolean {
		return this._buffer !== undefined && this.index !== undefined
	}

	invalidate() {
		this._buffer = undefined
		this._index = undefined
	}
}

export class TextAccessor implements Location {
	constructor(private _buffer: MBuffer, private _index: number) {
		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
			this._index = 0
		}
	}

	get buffer(): MBuffer {
		if(this._buffer !== undefined) { return this._buffer }
		throw new Error(`Cannot get buffer of invalid location (buffer: {undefined}, index: ${this._index})`)
	}
	get index(): number {
		if(this._index !== undefined) { return this._index }
		throw new Error(`Cannot get index of invalid location (buffer: {${this._buffer?.info()}}, index: ${this._index})`)
	}

	isEqualTo: (other: Location)=>boolean = _isEqualTo.bind(this)
	isBefore: (other: Location)=>boolean = _isBefore.bind(this)
	isAfter: (other: Location)=>boolean = _isAfter.bind(this)
	isAtLeast: (other: Location)=>boolean = _isAtLeast.bind(this)
	isAtMost: (other: Location)=>boolean = _isAtMost.bind(this)
	isInRange: (other: Location)=>boolean = _isInRange.bind(this)
	
	accessor(): TextAccessor {
		return new TextAccessor(this._buffer, this._index)
	}

	get(): string {
		return this._buffer.at(this._index)
	}

	is(other: string | string[]): boolean {
		const char = this._buffer.at(this._index)

		if(Array.isArray(other)) {
			for(const o of other) {
				if(o === char) { return true }
			}	
		} else {
			if(other === char) { return true }
		}

		return false
	}

	advance(): void {
		if(this._index === undefined) {
			throw new Error(`Cannot advance index of invalid location (buffer: {${this._buffer?.info()}}, index: ${this._index})`)
		}
		this._index++

		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
			this._index = 0
		}
	}
}

function _isBefore(this: Location, other: Location) {
	const isSameBuffer = this.buffer === other.buffer
	if(isSameBuffer) {
		return this.index < other.index
	} else {
		let sameBufferAfterThis = false
		let b: MBuffer = this.buffer

		while(!sameBufferAfterThis && b.nextBuffer) {
			b = b.nextBuffer
			sameBufferAfterThis = b===other.buffer
		}

		if(sameBufferAfterThis) { return true }
	}
	return false
}
function _isEqualTo(this: Location, other: Location): boolean {
	return this.buffer===other.buffer && this.index===other.index
}
function _isAfter(this: Location, other: Location): boolean {
	return !this.isEqualTo(other) && !this.isBefore(other)
}
function _isAtLeast(this: Location, other: Location) {
	return this.isEqualTo(other) || this.isAfter(other)
}
function _isAtMost(this: Location, other: Location) {
	return this.isEqualTo(other) || this.isBefore(other)
}
function _isInRange(this: Location, end: Location): boolean {
	return this.isBefore(end)
}
