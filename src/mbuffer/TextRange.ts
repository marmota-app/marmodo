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

export class TextLocation {
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

	isEqualTo(other: TextLocation): boolean {
		return this.buffer===other.buffer && this.index===other.index
	}

	isBefore(other: TextLocation): boolean {
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

	isAfter(other: TextLocation): boolean {
		return !this.isEqualTo(other) && !this.isBefore(other)
	}

	isAtLeast(other: TextLocation) {
		return this.isEqualTo(other) || this.isAfter(other)
	}
	isAtMost(other: TextLocation) {
		return this.isEqualTo(other) || this.isBefore(other)
	}
	
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

export class TextAccessor extends TextLocation {
	constructor(_buffer: MBuffer, _index: number) {
		while(_index >= _buffer.length && _buffer.nextBuffer) {
			_buffer = _buffer.nextBuffer
			_index = 0
		}
		super(_buffer, _index)
	}

	isInRange(end: TextLocation): boolean {
		return this.isBefore(end)
	}
	
	get(): string {
		return this.buffer.at(this.index)
	}

	advance(): void {
		if(this._index === undefined) {
			throw new Error(`Cannot advance index of invalid location (buffer: {${this._buffer?.info()}}, index: ${this._index})`)
		}
		this._index++

		while(this.index >= this.buffer.length && this.buffer.nextBuffer) {
			this._buffer = this.buffer.nextBuffer
			this._index = 0
		}
	}
}

export class TextRange {
	constructor(public readonly start: TextLocation, public readonly end: TextLocation) {}

	asString(): string {
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

	get isValid(): boolean {
		return this.start.isValid && this.end.isValid
	}
}
