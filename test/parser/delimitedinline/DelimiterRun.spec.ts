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

import { TextContent } from "../../../src/mbuffer"
import { findNextDelimiterRun } from "../../../src/parser/delimitedinline/DelimiterRun"

describe('DelimiterRun', () => {
	describe('simple ranges', () => {
		it('finds delimiter run of only * until next character', () => {
			const tc = new TextContent('***a')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end())
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual(0)
			expect(end.index).toEqual(3)
			expect(start.stringUntil(end)).toEqual('***')
		})

		it('does not find delimiter run if there is no delimter', () => {
			const tc = new TextContent('abce')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end())
			expect(result).toBeNull()
		})

		it('finds delimiter run that is not at the start of the range', () => {
			const tc = new TextContent('some text ***a')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end())
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some text '.length)
			expect(end.index).toEqual('some text '.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})

		it('finds first of mixed search: [*, _]', () => {
			const tc = new TextContent('some text ***___a')

			const result = findNextDelimiterRun(['*', '_'], tc.start(), tc.end())
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some text '.length)
			expect(end.index).toEqual('some text '.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('finds first of mixed search: [_, *]', () => {
			const tc = new TextContent('some text ___***a')

			const result = findNextDelimiterRun(['*', '_'], tc.start(), tc.end())
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some text '.length)
			expect(end.index).toEqual('some text '.length+3)
			expect(start.stringUntil(end)).toEqual('___')
		})

		it('cuts delimiter run that goes beyond the end', () => {
			const tc = new TextContent('a****')
			const parseEnd = tc.start()
			parseEnd.advance()
			parseEnd.advance()
			parseEnd.advance()

			const result = findNextDelimiterRun(['*', '_'], tc.start(), parseEnd)
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual(1)
			expect(end.index).toEqual(3)
			expect(start.stringUntil(end)).toEqual('**')
		})
	})

	describe('finding matching delimiter runs', () => {
		it('finds next matching delimiter run based on search criteria (first occurence)', () => {
			const tc = new TextContent('some text***')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				rightFlanking: true,
				minLength: 3,
			})
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some text'.length)
			expect(end.index).toEqual('some text'.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('finds next matching delimiter run based on search criteria (second occurence, first too short)', () => {
			const tc = new TextContent('some** text***')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				rightFlanking: true,
				minLength: 3,
			})
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some** text'.length)
			expect(end.index).toEqual('some** text'.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('finds next matching delimiter run based on search criteria (second occurence, first not right-flanking)', () => {
			const tc = new TextContent('some ***text***both')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				rightFlanking: true,
				minLength: 3,
			})
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some ***text'.length)
			expect(end.index).toEqual('some ***text'.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('finds next matching delimiter run based on search criteria (second occurence, first not left-flanking)', () => {
			const tc = new TextContent('some*** text ***left')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				leftFlanking: true,
			})
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some*** text '.length)
			expect(end.index).toEqual('some*** text '.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('finds next matching delimiter run based on search criteria (max index)', () => {
			const tc = new TextContent('some ***text***both')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				maxStartIndex: 'some *'.length,
			})
			expect(result).not.toBeNull()

			const [start, end] = result!
			expect(start.index).toEqual('some '.length)
			expect(end.index).toEqual('some '.length+3)
			expect(start.stringUntil(end)).toEqual('***')
		})
		it('does not next matching delimiter run based on search criteria (index > max index)', () => {
			const tc = new TextContent('some ***text***both')

			const result = findNextDelimiterRun(['*'], tc.start(), tc.end(), {
				maxStartIndex: 'some'.length,
			})
			expect(result).toBeNull()
		})
	})

	//Tests from the GfM Spec...
	describe('left-flanking, but not right-flanking', () => {
		[
			['',   '***', 'abc'],
			['  ', '_',   'abc'],
			['',   '**',  '"abc"'],
			[' ',  '_',   '"abc"'],
		].forEach(([before, delimiter, after]) => {
			it('finds delimiter run at the start of the range', () => {
				const text = `${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual(before.length)
				expect(end.index).toEqual(before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(true)
				expect(info.isRightFlanking).toEqual(false)
			})
			it('finds delimiter run in the middle of the range', () => {
				const text = `some text ${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual('some text '.length + before.length)
				expect(end.index).toEqual('some text '.length + before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(true)
				expect(info.isRightFlanking).toEqual(false)
			})
			it('does not find delimiter run after the range', () => {
				const text = `some text --end--${before}${delimiter}${after}`
				const tc = new TextContent(text)
				const end = tc.start().accessor()
				while(end.get() !== '-') { end.advance() }

				const result = findNextDelimiterRun(['_', '*'], tc.start(), end)
				expect(result).toBeNull()
			})
		})
	})

	describe('right-flanking, but not left-flanking', () => {
		[
			['abc', '***', ''],
			['abc', '_', ''],
			['   "abc"', '**', ''],
			['   "abc"', '_', ''],
		].forEach(([before, delimiter, after]) => {
			it('finds delimiter run at the start of the range', () => {
				const text = `${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual(before.length)
				expect(end.index).toEqual(before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(false)
				expect(info.isRightFlanking).toEqual(true)
			})
			it('finds delimiter run in the middle of the range', () => {
				const text = `some text ${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual('some text '.length + before.length)
				expect(end.index).toEqual('some text '.length + before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(false)
				expect(info.isRightFlanking).toEqual(true)
			})
		})
	})

	describe('both right-flanking and left-flanking', () => {
		[
			[' abc', '***', 'def'],
			['abc"', '_', '"def'],
		].forEach(([before, delimiter, after]) => {
			it('finds delimiter run at the start of the range', () => {
				const text = `${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual(before.length)
				expect(end.index).toEqual(before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(true)
				expect(info.isRightFlanking).toEqual(true)
			})
			it('finds delimiter run in the middle of the range', () => {
				const text = `some text ${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).not.toBeNull()

				const [start, end, info] = result!
				expect(start.index).toEqual('some text '.length + before.length)
				expect(end.index).toEqual('some text '.length + before.length+delimiter.length)
				expect(start.stringUntil(end)).toEqual(delimiter)

				expect(info.isLeftFlanking).toEqual(true)
				expect(info.isRightFlanking).toEqual(true)
			})
		})
	})
	
	describe('neither left-flanking, nor right-flanking', () => {
		[
			['abc ', '***', ' def'],
			['a ', '_', ' b'],
		].forEach(([before, delimiter, after]) => {
			it('does not find delimiter run at the start of the range', () => {
				const text = `${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).toBeNull()
			})
			it('does not find delimiter run in the middle of the range', () => {
				const text = `some text ${before}${delimiter}${after}`
				const tc = new TextContent(text)

				const result = findNextDelimiterRun(['_', '*'], tc.start(), tc.end())
				expect(result).toBeNull()
			})
		})
	})
})