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
