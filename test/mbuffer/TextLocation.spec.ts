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

import { MBuffer } from "../../src/mbuffer/MBuffer"
import { PersistentRange } from "../../src/mbuffer/TextRange"

function createBuffer(): MBuffer {
	const buffer = new MBuffer('thedog')
	buffer.insert(' quicklazy ', 'the'.length)
	buffer.insert(' brownthe ', 'the quick'.length)
	buffer.insert(' foxover ', 'the quick brown'.length)
	buffer.insert(' jumps ', 'the quick brown fox'.length)
	return buffer
}
describe('TextLocation', () => {
	describe('before, after, equal', () => {
		it('can be equal to antoher location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick brown'.length)
			const second = buffer.location('the quick brown'.length)

			expect(first.isEqualTo(second)).toEqual(true)
		})
		it('can be before another location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick br'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isBefore(second)).toEqual(true)
		})
		it('can be before another location (different buffer)', () => {
			const buffer = createBuffer()
			const first = buffer.location('th'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isBefore(second)).toEqual(true)
		})
		it('can be after another location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('the quick br'.length)

			expect(first.isAfter(second)).toEqual(true)
		})
		it('can be after another location (different buffer)', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('th'.length)

			expect(first.isAfter(second)).toEqual(true)
		})

		it('is not equal to another location when it is after that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('th'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isEqualTo(second)).toEqual(false)
		})
		it('is not equal to another location when it is before that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('th'.length)

			expect(first.isEqualTo(second)).toEqual(false)
		})

		it('is not before another location when it is equal to that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('th quick bro'.length)

			expect(first.isBefore(second)).toEqual(false)
		})
		it('is not before another location when it is after that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('the quick br'.length)

			expect(first.isBefore(second)).toEqual(false)
		})
		it('is not before another location when it is after that location (different buffer)', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('th'.length)

			expect(first.isBefore(second)).toEqual(false)
		})

		it('is not after another location when it is equal to that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick bro'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isAfter(second)).toEqual(false)
		})
		it('is not after another location when it is before that location', () => {
			const buffer = createBuffer()
			const first = buffer.location('the quick br'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isAfter(second)).toEqual(false)
		})
		it('is not after another location when it is before that location (different buffer)', () => {
			const buffer = createBuffer()
			const first = buffer.location('th'.length)
			const second = buffer.location('the quick bro'.length)

			expect(first.isAfter(second)).toEqual(false)
		})
	})

	describe('finding strings', () => {
		function createRange(buffer: MBuffer, start: number, end: number): PersistentRange {
			return buffer.location(start).persistentRangeUntil(buffer.location(end))
		}
		
		it('can find one of the given strings inside a range', () => {
			const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')
			const range = createRange(buffer, 0, buffer.length)
	
			const found = range.start.findNext(['brown', 'quick'], range.end)
	
			expect(found).not.toBeNull()
			expect(found?.asString()).toEqual('quick')
			expect(found?.start.index).toEqual('the '.length)
			expect(found?.end.index).toEqual('the quick'.length)
		})
		it('returns null when the given string is not found', () => {
			const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')
			const range = createRange(buffer, 0, buffer.length)
	
			const found = range.start.findNext(['dinosaur', 'bird'], range.end)
	
			expect(found).toBeNull()
		})
		it('can find a single string inside a range', () => {
			const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')
			const range = createRange(buffer, 0, buffer.length)
	
			const found = range.start.findNext('quick', range.end)
	
			expect(found).not.toBeNull()
			expect(found?.asString()).toEqual('quick')
			expect(found?.start.index).toEqual('the '.length)
			expect(found?.end.index).toEqual('the quick'.length)
		})
		it('finds a word correctly when there is a different partial match before', () => {
			const buffer = new MBuffer('the quick frog quacks')
			const range = createRange(buffer, 0, buffer.length)
	
			const found = range.start.findNext('quack', range.end)
	
			expect(found).not.toBeNull()
			expect(found?.asString()).toEqual('quack')
			expect(found?.start.index).toEqual('the quick frog '.length)
			expect(found?.end.index).toEqual('the quick frog quack'.length)
		})
		it('does not find text that is outside of the range', () => {
			const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')
			const range = createRange(buffer, 0, 'the quick brown fox ju'.length)
	
			const found = range.start.findNext(['dog', 'lazy'], range.end)
	
			expect(found).toBeNull()
		})
		it('does not find text that is partially outside of the range', () => {
			const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')
			const range = createRange(buffer, 0, 'the quick brown fox ju'.length)
	
			const found = range.start.findNext('jumps', range.end)
	
			expect(found).toBeNull()
		})	
	})
})