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