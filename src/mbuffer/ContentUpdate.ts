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