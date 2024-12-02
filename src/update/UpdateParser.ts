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
import { TextLocation } from "../mbuffer/TextLocation";

interface UpdateResult<
	T extends string,
	C extends Element<any, any, any>,
	E extends Element<T, C, E>
> {
	updated: E | null,
	isFirstUpdate: boolean,
}
export class UpdateParser {
	parseUpdate<
		T extends string,
		C extends Element<any, any, any>,
		E extends Element<T, C, E>
	>(update: UpdateInfo, rootElement: E, documentEnd: TextLocation): E | null {
		return this.#updateElement(update, rootElement, documentEnd).updated
	}

	#updateElement<
		T extends string,
		C extends Element<any, any, any>,
		E extends Element<T, C, E>
	>(update: UpdateInfo, currentElement: E, documentEnd: TextLocation): UpdateResult<T, C, E> {
		const updateStart = update.range.start
		const updateEnd = update.range.end

		const isInsideCurrentElement =
			currentElement.parsedRange.start.isValid &&
			currentElement.parsedRange.end.isValid &&
			updateStart.isAtLeast(currentElement.parsedRange.start) &&
			updateEnd.isAtMost(currentElement.parsedRange.end)

		if(isInsideCurrentElement) {
			//drill down if possible
			for(let i in currentElement.content) {
				const result = this.#updateElement(update, currentElement.content[i], documentEnd)
				if(result.updated != null) {
					if(result.isFirstUpdate) {
						//the current element **was** updated here, now need to replace
						//it and schedule a callback.
						currentElement.content[i].removeFromTree()
						currentElement.content[i] = result.updated
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
			const checkResult = parser.checkUpdate(currentElement, update, documentEnd)
			const updated = checkResult.canUpdate?
				parser.parse(checkResult.rangeStart, checkResult.rangeEnd):
				null

			if(updated != null) {
				const updateInomplete = !this.#isCompleteUpdate(updated, currentElement)
				const updateRejected = !parser.acceptUpdate(currentElement, updated)
				if(updateInomplete || updateRejected) {
					return { updated: null, isFirstUpdate: true, }
				}
			}

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

	#isCompleteUpdate(updated: Element<any, any, any>, original: Element<any, any, any>): boolean {
		const hasParsedFullRange =
			updated.parsedRange.start.isEqualTo(original.parsedRange.start) &&
			updated.parsedRange.end.isEqualTo(original.parsedRange.end)

		return hasParsedFullRange
	}

	#scheduleUpdatedCallback(element: Element<any, any, any>) {
		element.updateParsed()
	}
}
