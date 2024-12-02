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

import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, } from "../mbuffer/TextRange";

interface UpdateCheckResultPositive {
	canUpdate: true,
	rangeStart: TextLocation,
	rangeEnd: TextLocation,
}
interface UpdateCheckResultNegative {
	canUpdate: false,
}
export type UpdateCheckResult = UpdateCheckResultPositive | UpdateCheckResultNegative

export interface Parser<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
> {
	type: TYPE,
	parse: (start: TextLocation, end: TextLocation) => ELEMENT | null,
	checkUpdate: (element: ELEMENT, update: UpdateInfo, documentEnd: TextLocation) => UpdateCheckResult,
	acceptUpdate: (original: ELEMENT, updated: ELEMENT) => boolean,
}

export type ElementOptions = {
	[key: string]: string,
}

export type ElementUpdateCallback<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
> = (elem: Element<TYPE, CONTENT, THIS>)=>unknown
export interface ElementUpdateRegistration {
	id: string,
	unsubscribe: () => void,
}

export interface Element<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
> {
	readonly id: string,
	readonly type: TYPE,
	readonly options: ElementOptions,

	readonly parsedWith: Parser<TYPE, CONTENT, THIS>,
	readonly parsedRange: PersistentRange,

	readonly asText: string,
	readonly content: CONTENT[],

	onUpdate: (cb: ElementUpdateCallback<TYPE, CONTENT, THIS>) => ElementUpdateRegistration,
	updateParsed: () => void,
	removeFromTree: () => void,

	readonly referenceMap: { [key: string]: string },
}

