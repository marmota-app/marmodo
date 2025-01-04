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

import { Element } from "../element/Element";
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

		//Allow updates to append to an existing element! This is done by
		//accepting updates to an element that are 1 char beyond the element's
		//range.
		let elementRangeEnd: TextLocation = currentElement.parsedRange.end
		if(elementRangeEnd.isValid) {
			if(elementRangeEnd.isBefore(documentEnd)) {
				const a = elementRangeEnd.accessor()
				a.advance()
				elementRangeEnd = a
			}
		}

		const isInsideCurrentElement =
			currentElement.parsedRange.start.isValid &&
			currentElement.parsedRange.end.isValid &&
			updateStart.isAtLeast(currentElement.parsedRange.start) &&
			updateEnd.isAtMost(elementRangeEnd)

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
						result.updated.parent = currentElement
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
				const incompletelyParsedUpdateRange = !updated.parsedRange.end.isAtLeast(updateEnd)
				if(updateInomplete || updateRejected || incompletelyParsedUpdateRange) {
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
