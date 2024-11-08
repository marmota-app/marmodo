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

import { PersistentLocation, TemporaryLocation } from "./TextLocation"

export class MBuffer {
	private locations: PersistentLocation[] = []
	private previous?: MBuffer
	private next?: MBuffer

	constructor(
		private buffered: string, private _start = 0, private _length = buffered.length,
		private hasSharedBuffer = false
	) {}

	get start() { return this._start }
	get length() { return this._length }

	insert(newContent: string, at: number): void {
		if(at === this._length) {
			if(this.hasSharedBuffer) {
				const inserted = new MBuffer(newContent, 0, newContent.length, false)
				if(this.next) { this.linkBuffers(inserted, this.next) }
				this.linkBuffers(this, inserted)

				this.updateLocationsAfterInsert(at, inserted)
			} else {
				this.buffered = this.buffered + newContent
				this._length += newContent.length
				this.updateLocationsAfterInsert(at, this)
			}
		} else if(at > this._length && this.next) {
			this.next.insert(newContent, at - this._length)
		} else {
			const inserted = new MBuffer(newContent, 0, newContent.length, false)
			const last = this.split(at)
			if(this.next) { this.linkBuffers(last, this.next) }
			this.linkBuffers(inserted, last)
			this.linkBuffers(this, inserted)


			this.updateLocationsAfterInsert(at, inserted, last)
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
			const remainingLocations: PersistentLocation[] = []
			for(let location of this.locations) {
				if(location.buffer !== this) {
					throw new Error(`Invalid location found registered in this buffer ("${this.buffered}" [${this._start}, ${this._length}]) but pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`)
				}
	
				if(location.index >= (at+charsToDelete)) {
					if(!next) { throw new Error(`cannot insert at ${at} because there is no "next" buffer ("${this.buffered}" [${this._start}, ${this._length}]), location pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`) }
					location.update(next, location.index - at - charsToDelete)
				} else if(location.index > at) {
					location.invalidate()
				} else {
					remainingLocations.push(location)
				}
			}
			this.locations = remainingLocations
		}
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
		return `"${this.buffered}" [${this._start}, ${this._length}]`
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

	location(index: number): TemporaryLocation {
		if(index <= this._length) {
			return new TemporaryLocation(this, index)
		} else {
			if(this.next) {
				return this.next.location(index - this._length)
			}
		}
		throw new Error(`Cannot find location at index ${index} in buffer "${this.buffered}" [${this._start}, ${this._length}]`)
	}

	end(): TemporaryLocation {
		if(this.next) {
			return this.next.end()
		}
		return new TemporaryLocation(this, this.length)
	}

	private split(splitAt: number): MBuffer {
		const newLength = this._length-splitAt
		this._length = splitAt
		this.hasSharedBuffer = true

		const secondBufferAfterSplit = new MBuffer(this.buffered, this._start+splitAt, newLength, true)

		return secondBufferAfterSplit
	}

	private updateLocationsAfterInsert(insertedAt: number, inserted: MBuffer, last?: MBuffer) {
		const remainingLocations: PersistentLocation[] = []

		for(let location of this.locations) {
			if(location.buffer !== this) {
				throw new Error(`Invalid location found registered in this buffer ("${this.buffered}" [${this._start}, ${this._length}]) but pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`)
			}

			if(location.index === insertedAt) {
				location.update(inserted, inserted._length)
			} else if(location.index > insertedAt) {
				if(!last) { throw new Error(`cannot insert at ${insertedAt} because there is no "last" buffer ("${this.buffered}" [${this._start}, ${this._length}]), location pointing to buffer "${location.buffer.buffered}" [${location.buffer._start}, ${location.buffer._length}]`) }
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
}
