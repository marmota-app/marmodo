import { MBuffer } from "./MBuffer";

export class TextLocation {
	constructor(private _buffer: MBuffer | undefined, private _index: number | undefined) {
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

export class TextAccessor {
	constructor(private _buffer: MBuffer, private _index: number) {
		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
			this._index = 0
		}
	}

	isInRange(end: TextLocation): boolean {
		const sameBuffer = this._buffer == end.buffer

		if(sameBuffer) {
			const indexInRange = this._index < end.index
			const indexInsideBuffer = this._index < this._buffer.length
	
			return indexInsideBuffer && indexInRange	
		} else {
			let sameBufferBefore = false
			let b: MBuffer = this._buffer
			while(!sameBufferBefore && b.previousBuffer) {
				sameBufferBefore = b.previousBuffer === end.buffer
				b = b.previousBuffer
			}

			if(sameBufferBefore) { return false }
		}

		return true
	}
	
	get(): string {
		return this._buffer.at(this._index)
	}

	advance(): void {
		this._index++

		while(this._index >= this._buffer.length && this._buffer.nextBuffer) {
			this._buffer = this._buffer.nextBuffer
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
