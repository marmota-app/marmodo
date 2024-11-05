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

import { Element } from "../element/Element";
import { Container } from "../element/MfMElements";
import { UpdateInfo } from "../mbuffer/TextContent";

interface UpdateResult<
	T extends string,
	C extends Element<any, any, any>,
	E extends Element<T, C, E>
> {
	updated: E | null,
	isFirstUpdate: boolean,
}
export class UpdateParser {
	parseUpdate(update: UpdateInfo, rootElement: Container): Container | null {
		return this.#updateElement(update, rootElement).updated
	}

	#updateElement<
		T extends string,
		C extends Element<any, any, any>,
		E extends Element<T, C, E>
	>(update: UpdateInfo, currentElement: E): UpdateResult<T, C, E> {
		const updateStart = update.range.start
		const updateEnd = update.range.end

		const isInsideCurrentElement =
			updateStart.isAtLeast(currentElement.parsedRange.start) &&
			updateEnd.isAtMost(currentElement.parsedRange.end)
		if(isInsideCurrentElement) {
			//drill down if possible
			for(let i in currentElement.content) {
				const result = this.#updateElement(update, currentElement.content[i])
				if(result.updated != null) {
					//the current element **was** updated here, now need to replace
					//it and schedule a callback.
					currentElement.content[i] = result.updated
					if(result.isFirstUpdate) {
						this.#scheduleUpdatedCallback(currentElement)
					}
					return {
						updated: currentElement,
						isFirstUpdate: false,
					}
				}
			}

			//if the drilled down element could not be updated, update it here
			const parser = currentElement.parsedWith
			const range = currentElement.parsedRange
			const updated = parser.parse(range.start, range.end) as (E | null)

			//TODO check whether it's fully parsed
			//TODO check whether the original range was fully parsed
			
			return {
				updated,
				isFirstUpdate: true
			}
		}

		return {
			updated: null,
			isFirstUpdate: false,
		}
	}

	#scheduleUpdatedCallback(element: Element<any, any, any>) {
		//TODO callback not yet implemented!
	}
}
