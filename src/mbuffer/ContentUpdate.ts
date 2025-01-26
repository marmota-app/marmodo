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


/**
 * An update to the content of a document, e.g. a keystroke in the editor. 
 * 
 * Updates to the document occur all the time while the document is being edited.
 * All possible updates can be represented by a `rangeOffset`, `rangeLength` and
 * a `text` to insert:
 * 
 * - **A key stroke**: `rangeOffset` is where the new character should appear,
 *   `rangeLength` is 0 (just insert) and `text` is the character to insert
 * - **Deleting a character**: `rangeOffset` is the position of the character,
 *   `rangeLength` is 0 and `text` is ""
 * - **Deleting / cutting some selected text**: `rangeOffset` is the start of
 *   the selection, `rangeLength` is the length of the selection and `text` is ""
 * - **Replacing selected text with other text**: `rangeOffset` is the start of
 *   the selection, `rangeLength` is the length of the selection and `text`
 *   is the replacement text
 * - ...
 */
export interface ContentUpdate {
	/** The start of the content update. */
	readonly rangeOffset: number,

	/** The length of the text to be replaced (0 for inserts). */
	readonly rangeLength: number,
	/** The replacement text (empty string for deleting / cutting). */
	readonly text: string,
}