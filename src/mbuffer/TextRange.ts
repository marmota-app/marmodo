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
}
export class PersistentRange extends TextRange {
	constructor(public readonly start: PersistentLocation, public readonly end: PersistentLocation) {
		super()
	}
}

export class TemporaryRange extends TextRange {
	constructor(public readonly start: TemporaryLocation, public readonly end: TemporaryLocation) {
		super()
	}
}
