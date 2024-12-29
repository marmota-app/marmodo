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

import { TextLocation, TemporaryLocation, PersistentLocation } from "./TextLocation";

export abstract class TextRange {
	abstract readonly start: TextLocation
	abstract readonly end: TextLocation

	asString(): string {
		this.start.ensureValid('Range not valid! Start:')
		this.end.ensureValid('Range not valid! End:')

		let result = ''
	
		const currentLocation = this.start.accessor()
		while(currentLocation.isInRange(this.end)) {
			result += currentLocation.get()
			currentLocation.advance()
		}
	
		return result
	}

	ensureValid() {
		this.start.ensureValid('Range invalid: Start of range is invalid!')
		this.end.ensureValid('Range invalid: End of range is invalid!')
	}
	get isValid() {
		return this.start.isValid && this.end.isValid
	}
}
export class PersistentRange extends TextRange {
	constructor(public readonly start: PersistentLocation, public readonly end: PersistentLocation) {
		super()
	}

	unregister() {
		this.start.invalidate()
		this.end.invalidate()
	}
}

export class TemporaryRange extends TextRange {
	constructor(public readonly start: TemporaryLocation, public readonly end: TemporaryLocation) {
		super()
	}
}
