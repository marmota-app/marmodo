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

import { replaceWhitespace } from "../../test/replaceWhitespace"
import { PersistentLocation, TemporaryLocation } from "./TextLocation"

let nextId = 1

export class MBuffer {
	private locations: PersistentLocation[] = []
	private previous?: MBuffer
	private next?: MBuffer
	private id: string

	constructor(
		private buffered: string, private _start = 0, private _length = buffered.length,
		private hasSharedBuffer = false
	) {
		this.id=`buffer-${nextId}`
		nextId++
	}

	get start() { return this._start }
	get length() { return this._length }

	insert(newContent: string, at: number): void {
		if(at === this._length) {
			if(this.hasSharedBuffer || (this._start+this.length)!==this.buffered.length) {
				const inserted = new MBuffer(newContent, 0, newContent.length, false)
				if(this.next) { this.linkBuffers(inserted, this.next) }
				this.linkBuffers(this, inserted)

				this.#updateLocationsAfterInsert(at, inserted)
			} else {
				this.buffered = this.buffered + newContent
				this._length += newContent.length
				this.#updateLocationsAfterInsert(at, this)
			}
		} else if(at > this._length && this.next) {
			this.next.insert(newContent, at - this._length)
		} else {
			const inserted = new MBuffer(newContent, 0, newContent.length, false)
			const last = this.split(at)
			if(this.next) { this.linkBuffers(last, this.next) }
			this.linkBuffers(inserted, last)
			this.linkBuffers(this, inserted)


			this.#updateLocationsAfterInsert(at, inserted, last)
		}
	}

	delete(at: number, charsToDelete: number) {
		if(at > this._length && this.next) {
			this.next.delete(at - this._length, charsToDelete)
		} else if(at+charsToDelete >= this._length && this.next) {
			const toDeleteHere = this._length - at
			const remainingToDelete = charsToDelete - toDeleteHere

			//TODO might as well remove the current buffer if it's length
			//     should become zero...
			this._length = at
			this.next.delete(0, remainingToDelete)
			this.#updateLocationsAfterDelete(this, at, charsToDelete)
		} else {
			let next: MBuffer = this
			if(at > 0) {
				next = this.split(at)
				if(this.next) { this.linkBuffers(next, this.next) }
				this.linkBuffers(this, next)
			}
			next._start += charsToDelete
			next._length -= charsToDelete

			//update locations that are after the deleted content
			this.#updateLocationsAfterDelete(next, at, charsToDelete)
		}
	}

	#updateLocationsAfterDelete(buffer: MBuffer, at: number, charsToDelete: number) {
		const remainingLocations: PersistentLocation[] = []
		for(let location of this.locations) {
			if(location.buffer !== this) {
				throw new Error(`Invalid location found registered in this buffer ("${this.buffered}" [${this._start}, ${this._length}]) but pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`)
			}

			if(location.index >= (at+charsToDelete)) {
				if(!buffer) { throw new Error(`cannot delete at ${at} because there is no "next" buffer ("${this.buffered}" [${this._start}, ${this._length}]), location pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`) }
				location.update(buffer, location.index - at - charsToDelete)
			} else if(location.type === 'start' && location.index >= at) {
				location.invalidate()
			} else if(location.type === 'end' && location.index > at) {
				location.invalidate()
			} else {
				remainingLocations.push(location)
			}
		}
		this.locations = remainingLocations
	}

	at(index: number) {
		if(index >= this._length) {
			throw new Error(`Index out of bounds of this buffer: ${index}>=${this._length} ("${this.buffered}" [${this._start}, ${this._length}])`)
		}
		return this.buffered.charAt(this._start+index)
	}

	contentAsString(): string {
		return this.buffered.substring(this._start, this._start + this._length)
	}

	asString(): string {
		if(this.next) {
			return this.contentAsString() + this.next.asString()
		}
		return this.contentAsString()
	}

	info(): string {
		return `${this.id} "${this.buffered}" [${this._start}, ${this._length}]`
	}

	get nextBuffer(): MBuffer | undefined {
		return this.next
	}

	get previousBuffer(): MBuffer | undefined {
		return this.previous
	}

	registerLocation(location: PersistentLocation): void {
		if(this.locations.find(l => l === location)) {
			throw new Error(`Cannot register location ${location.index} at buffer "${this.buffered}" [${this._start}, ${this._length}] - Already registered!`)
		}
		this.locations.push(location)
	}
	unregisterLocation(location: PersistentLocation): void {
		const remainingLocations: PersistentLocation[] = []

		this.locations.forEach(l => {
			if(l !== location) {
				remainingLocations.push(l)
			}
		})
		
		this.locations = remainingLocations
	}

	startLocation(index: number): TemporaryLocation {
		if(index <= this._length) {
			return new TemporaryLocation(this, index, 'start')
		} else {
			if(this.next) {
				return this.next.startLocation(index - this._length)
			}
		}
		throw new Error(`Cannot find location at index ${index} in buffer "${this.buffered}" [${this._start}, ${this._length}]`)
	}
	endLocation(index: number): TemporaryLocation {
		if(index <= this._length) {
			return new TemporaryLocation(this, index, 'end')
		} else {
			if(this.next) {
				return this.next.endLocation(index - this._length)
			}
		}
		throw new Error(`Cannot find location at index ${index} in buffer "${this.buffered}" [${this._start}, ${this._length}]`)
	}

	end(): TemporaryLocation {
		if(this.next) {
			return this.next.end()
		}
		return new TemporaryLocation(this, this.length, 'end')
	}

	private split(splitAt: number): MBuffer {
		const newLength = this._length-splitAt
		this._length = splitAt
		this.hasSharedBuffer = true

		const secondBufferAfterSplit = new MBuffer(this.buffered, this._start+splitAt, newLength, true)

		return secondBufferAfterSplit
	}

	#updateLocationsAfterInsert(insertedAt: number, inserted: MBuffer, last?: MBuffer) {
		const remainingLocations: PersistentLocation[] = []

		for(let location of this.locations) {
			if(location.buffer !== this) {
				throw new Error(`Invalid location found registered in this buffer ("${this.buffered}" [${this._start}, ${this._length}]) but pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`)
			}

			if(location.index === insertedAt) {
				const hasUpdatedBuffer = location.update(inserted, inserted._length)
				if(!hasUpdatedBuffer) {
					remainingLocations.push(location)
				}
			} else if(location.index > insertedAt) {
				if(!last) { throw new Error(`cannot insert at ${insertedAt} because there is no "last" buffer ("${this.buffered}" [${this._start}, ${this._length}]), location pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}], locations: [${this.locations.map(l => l.info())}]`) }
				location.update(last, location.index - insertedAt)
			} else {
				remainingLocations.push(location)
			}
		}

		this.locations = remainingLocations
	}

	private linkBuffers(first: MBuffer, second: MBuffer) {
		first.next = second
		second.previous = first
	}

	printable(): string {
		let result = replaceWhitespace(this.buffered)
		const positions = new Array(this.buffered.length+1).fill(' ')
		positions[this._start] = 'S'
		positions[this._start+this.length] = 'E'

		result += '\n'+positions.join('')

		if(this.locations.length > 0) {
			const locs = new Array(this.buffered.length+1).fill(' ')
			this.locations.forEach(l => locs[this._start+l.index]='^')
			result += '\n'+locs.join('')
		}
		if(this.next) {
			result += '\n' + this.next.printable()
		}

		return result
	}
}
