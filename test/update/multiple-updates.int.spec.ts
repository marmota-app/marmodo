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

import { MfMDocument } from '../../src/MfMDocument'

describe('Integration/Regression: Multiple Updates', () => {
	it('has the correct text after creating a paragraph with default option', () => {
		const doc = new MfMDocument('{}', { development: false, });

		[
			{ "rangeLength": 0, "text": "v", "rangeOffset": 1, },
			{ "rangeLength": 1, "text": "}", "rangeOffset": 2, },
			{ "rangeLength": 0, "text": "s", "rangeOffset": 3, },
			{ "rangeLength": 0, "text": "\n", "rangeOffset": 4, },
		].forEach(cu => doc.update(cu, () => { throw new Error('could not update document with '+JSON.stringify(cu))} ))

		expect(doc.text).toEqual('{v}s\n')
	})

	it('has correct text content after removing a custom inline by removing the closing bracket', () => {
		const doc = new MfMDocument('{}', { development: false, });

		[
			{ "rangeLength": 0, "text": "{}", "rangeOffset": 1, },
			{ "rangeLength": 0, "text": "1", "rangeOffset": 2, },
			{ "rangeLength": 0, "text": "0", "rangeOffset": 3, },
			{ "rangeLength": 0, "text": "s", "rangeOffset": 6, },
			{ "rangeLength": 1, "text": "", "rangeOffset": 5, },
		].forEach(cu => doc.update(cu, () => { throw new Error('could not update document with '+JSON.stringify(cu))} ))

		expect(doc.text).toEqual('{{10}s')
	})

	it('can remove most of a previously inserted custom inline', () => {
		const doc = new MfMDocument('{}', { development: false, });

		[
			{ "rangeLength": 0, "text": "{}", "rangeOffset": 1, },
			{ "rangeLength": 0, "text": "1", "rangeOffset": 2, },
			{ "rangeLength": 1, "text": "", "rangeOffset": 4, },
			{ "rangeLength": 1, "text": "", "rangeOffset": 3, },
			{ "rangeLength": 1, "text": "", "rangeOffset": 2, },
			{ "rangeLength": 1, "text": "", "rangeOffset": 1, }
		].forEach(cu => doc.update(cu, () => { throw new Error('could not update document with '+JSON.stringify(cu))} ))

		expect(doc.text).toEqual('{')
	})
})