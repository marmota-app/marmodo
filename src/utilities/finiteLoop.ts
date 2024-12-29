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

class FL {
	#lastVars?: any[]
	constructor(private vars: () => any[]) {
	}

	ensure() {
		const lastVars = this.#lastVars

		const currentVars = this.vars()
		if(lastVars != undefined) {
			if(currentVars.length != lastVars.length) {
				throw new Error(`Cannot ensure finite loop: Current vars has a different length than last time (${currentVars.length} vs. ${lastVars.length}).`)
			}
			currentVars.forEach((v, i) => {
				if(v === lastVars[i]) {
					throw new Error(`Loop may be infinite: Variable ${i} has not changed ("${v}" === "${lastVars[i]}")`)
				}
			})
		}
		this.#lastVars = currentVars
	}
}
export function finiteLoop(vars: () => any[]) {
	return new FL(vars)
}
