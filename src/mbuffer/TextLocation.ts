/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { jsonTransient, jsonTransientPrivate } from "../utilities/jsonTransient"
import { isCharacter, isLineEnding, isPunctuation, isWhitespace } from "./characters"
import { MBuffer } from "./MBuffer"
import { PersistentRange, TemporaryRange } from "./TextRange"

export abstract class TextLocation {
	abstract readonly buffer: MBuffer
	abstract readonly index: number
	abstract readonly isValid: boolean
	abstract readonly type: 'start' | 'end'
	
	abstract ensureValid(message: string): void

	isBefore(other: TextLocation) {
		if(this === other) { return false }
		
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
	isEqualTo(other: TextLocation | null | undefined): boolean {
		if(other == null) { return false }
		return this.buffer===other.buffer && this.index===other.index
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
	isInRange(end: TextLocation): boolean {
		return this.isBefore(end)
	}
	
	abstract accessor(): TemporaryLocation
	abstract persist(): PersistentLocation
	abstract persistentRangeUntil(end: TextLocation): PersistentRange

	stringUntil(end: TextLocation): string {
		this.ensureValid('Cannot create string from invalid start location')
		end.ensureValid('Cannot create string from invalid end location')
		if(!end.isAtLeast(this)) {
			throw new Error(`Cannot create string, end location is not after this location [buffer: {${this.buffer?.info()}}, index: {${this.index}}]`)
		}

		let result = ''

		const currentLocation = this.accessor()
		while(currentLocation.isInRange(end)) {
			result += currentLocation.get()
			currentLocation.advance()
		}
	
		return result
	}

	startsWith(toFind: string | string[], until: TextLocation): boolean {
		const foundRange = this.findNext(toFind, until)
		if(this.isEqualTo(foundRange?.start)) {
			return true
		}
		return false
	}
	findNextNewline(until: TextLocation): (TemporaryRange | null) {
		let nextNewline = this.findNext(['\r', '\n'], until)
		//If it is '\r', try to skip a following '\n'
		if(nextNewline != null && nextNewline.start.get() === '\r' && nextNewline.end.get() === '\n') {
			nextNewline.end.advance()
		}
		return nextNewline
	}
	findNext(toFind: string | string[], until: TextLocation): (TemporaryRange | null) {
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
		const accessor = this.accessor()
	
		while(accessor.isInRange(until)) {
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
						const start = new TemporaryLocation(status.startBuffer, status.startIndex, 'start')
						const end = new TemporaryLocation(accessor.buffer, accessor.index, 'end')
						return new TemporaryRange(start, end)
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
	
	abstract info(): string
}
export class PersistentLocation extends TextLocation {
	constructor(private _buffer: MBuffer | undefined, private _index: number | undefined, public readonly type: 'start' | 'end') {
		super()
		jsonTransientPrivate(this, '_buffer')

		//TODO bounds checks necessary?
		_buffer?.registerLocation(this)
	}

	get buffer(): MBuffer {
		if(this._buffer !== undefined) { return this._buffer }
		throw new Error(`Cannot get buffer of invalid location ${this.info()}`)
	}
	get index(): number {
		if(this._index !== undefined) { return this._index }
		throw new Error(`Cannot get index of invalid location ${this.info()}`)
	}

	accessor(): TemporaryLocation {
		if(this._buffer!==undefined && this._index!==undefined) {
			return new TemporaryLocation(this._buffer, this._index, this.type)
		}
		throw new Error(`Cannot get accessor of invalid location ${this.info()}`)
	}
	persist(): PersistentLocation {
		this.ensureValid('Cannot get persistent location of invalid location')
		return this
	}
	persistentRangeUntil(end: TextLocation): PersistentRange {
		this.ensureValid('Cannot get persistent range of invalid location')
		end.ensureValid('Cannot get persistent range to invalid end location')
		if(!end.isAtLeast(this)) {
			throw new Error(`Cannot get persistent location when end is not after this location ${this.info()}`)
		}

		return new PersistentRange(this, end.persist())
	}

	update(newBuffer: MBuffer, newIndex: number): boolean {
		const oldBuffer = this._buffer

		this._buffer = newBuffer
		this._index  = newIndex

		if(oldBuffer !== newBuffer) {
			newBuffer.registerLocation(this)
			return true
		}
		return false
	}

	get isValid(): boolean {
		return this._buffer != undefined && this._index != undefined
	}
	ensureValid(message: string) {
		if(!this.isValid) {
			throw new Error(`${message} [buffer: {${this._buffer?.info}}, index: {${this.index}}]`)
		}
	}

	invalidate() {
		this._buffer?.unregisterLocation(this)

		this._buffer = undefined
		this._index = undefined
	}

	info() {
		return `[index: {${this._index}} in buffer: {${this._buffer?.info()}}]`
	}
}

export class TemporaryLocation extends TextLocation {
	constructor(private _buffer: MBuffer, private _index: number, public readonly type: 'start' | 'end') {
		super()
		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
			this._index = 0
		}
	}

	get buffer(): MBuffer {
		if(this._buffer !== undefined) { return this._buffer }
		throw new Error(`Cannot get buffer of invalid location ${this.info()}`)
	}
	get index(): number {
		if(this._index !== undefined) { return this._index }
		throw new Error(`Cannot get index of invalid location ${this.info()}`)
	}
	get isValid() {
		//TODO buffer has NOT been modified
		return true
	}
	ensureValid(message: string) {
		//if(!isValid) {
		//	throw new Error(`${message} [buffer: "${this._buffer?.info}", index: "${this.index}"]`)
		//}
	}

	accessor(): TemporaryLocation {
		return new TemporaryLocation(this._buffer, this._index, this.type)
	}

	get(): string {
		//Use at own risk if this is an END-Location: The buffer might not
		//have text at the index.
		return this._buffer.at(this._index)
	}

	isWhitespace(): boolean {
		return isWhitespace(this._buffer.at(this.index))
	}
	isPunctuation(): boolean {
		return isPunctuation(this._buffer.at(this.index))
	}
	isLineEnding(): boolean {
		return isLineEnding(this._buffer.at(this.index))
	}
	is(other: string | string[]): boolean {
		return isCharacter(other, this._buffer.at(this._index))
	}
	isOnlyWhitespaceUntil(end: TextLocation): boolean {
		const cur = this.accessor()
		while(cur.isBefore(end)) {
			if(!cur.isWhitespace()) { return false }
		}
		return true
	}

	advance(): void {
		this.ensureValid('Cannot advance index of invalid location')
		this._index++

		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
			this._index = 0
		}
	}
	backoff(): void {
		this.ensureValid('Cannot backoff index of invalid location')
		this._index--;
		while((this._index < 0 || this.buffer.length === 0) && this._buffer.previousBuffer) {
			this._buffer = this._buffer.previousBuffer
			this._index = 0
		}
	}

	persist(): PersistentLocation {
		this.ensureValid('Cannot get persistent location of invalid location')
		return new PersistentLocation(this._buffer, this._index, this.type)
	}
	persistentRangeUntil(end: TextLocation): PersistentRange {
		this.ensureValid('Cannot get persistent range of invalid location')
		end.ensureValid('Cannot get persistent range to invalid end location')
		if(!end.isAtLeast(this)) {
			throw new Error(`Cannot get persistent location when end is not after this location ${this.info()}`)
		}

		return new PersistentRange(this.persist(), end.persist())
	}

	temporaryRangeUntil(end: TemporaryLocation): TemporaryRange {
		this.ensureValid('Cannot get temporary range of invalid location')
		end.ensureValid('Cannot get temporary range to invalid end location')
		if(!end.isAtLeast(this)) {
			throw new Error(`Cannot get temporary location when end is not after this location ${this.info()}`)
		}

		return new TemporaryRange(this, end)
	}

	info() {
		return `[index: {${this._index}} in buffer: {${this._buffer?.info()}}]`
	}
}
