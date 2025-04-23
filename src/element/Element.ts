/*
marmodo - A typescript library to parse marmota-flavored-markdown
Copyright (C) 2020-2025  David Tanzer - @dtanzer@social.devteams.at

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

import { UpdateInfo } from "../mbuffer/TextContent";
import { TextLocation } from "../mbuffer/TextLocation";
import { PersistentRange, } from "../mbuffer/TextRange";
import { SxContext } from "../sx/SxContext";

interface UpdateCheckResultPositive {
	canUpdate: true,
	rangeStart: TextLocation,
	rangeEnd: TextLocation,
	and: (otherResult: UpdateCheckResult)=>UpdateCheckResult,
}
interface UpdateCheckResultNegative {
	canUpdate: false,
	and: (otherResult: UpdateCheckResult)=>UpdateCheckResult,
}
export type UpdateCheckResult = UpdateCheckResultPositive | UpdateCheckResultNegative

export interface ParsingContext {
	sxContext?: SxContext,
}

export interface Parser<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	ELEMENT extends Element<TYPE, CONTENT, ELEMENT>,
> {
	type: TYPE,
	parse: (start: TextLocation, end: TextLocation, parsingContext: ParsingContext) => ELEMENT | null,
	checkUpdate: (element: ELEMENT, update: UpdateInfo, documentEnd: TextLocation) => UpdateCheckResult,
	acceptUpdate: (original: ELEMENT, updated: ELEMENT) => boolean,
	startsBlockAtStartOfRange: (start: TextLocation, end: TextLocation) => boolean,
}

export interface ElementOptions {
	keys: string[],
	get: (key: string) => string | null | undefined,
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

export type ReferencedByElement = string | number | boolean | Element<any, any, any> | Element<any, any, any>[] | null

export interface Element<
	TYPE extends string,
	CONTENT extends Element<any, any, any>,
	THIS extends Element<TYPE, CONTENT, THIS>,
> {
	readonly id: string,
	parent: Element<any, any, any> | null,
	readonly type: TYPE,
	readonly options: ElementOptions,
	readonly parsingContext: ParsingContext,

	readonly parsedWith: Parser<TYPE, CONTENT, THIS>,
	readonly parsedRange: PersistentRange,

	readonly asText: string,
	readonly content: CONTENT[],

	onUpdate: (cb: ElementUpdateCallback<TYPE, CONTENT, THIS>) => ElementUpdateRegistration,
	onSubtreeUpdate: (cb: ElementUpdateCallback<TYPE, CONTENT, THIS>) => ElementUpdateRegistration,
	updateParsed: () => void,
	subtreeUpdateParsed: () => void,
	removeFromTree: () => void,
	replaces: (replaced: THIS) => void,

	readonly referenceMap: { [key: string]: ReferencedByElement },

	updateSxResults: (evaluationId: string)=> void,
}
