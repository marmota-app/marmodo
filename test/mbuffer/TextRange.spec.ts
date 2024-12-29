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

import { MBuffer } from "../../src/mbuffer/MBuffer"
import { PersistentRange } from "../../src/mbuffer/TextRange"

function createRange(buffer: MBuffer, start: number, end: number): PersistentRange {
	return buffer.startLocation(start).persistentRangeUntil(buffer.endLocation(end))
}
describe('TextRange', () => {
	it('gets back a substring from a buffer when something was inserted', () => {
		const buffer = new MBuffer('the quick fox jumps over the lazy dog')
		buffer.insert(' brown', 'the quick'.length)
		
		const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})

	it('gets back a substring from a buffer when something was inserted AFTER getting the range', () => {
		const buffer = new MBuffer('the quick fox jumps over the lazy dog')
		
		const range = createRange(buffer, 'the '.length, 'the quick fox'.length)
		buffer.insert(' brown', 'the quick'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})

	it('gets back a substring from a buffer when something was inserted TWICE AFTER getting the range', () => {
		const buffer = new MBuffer('the quick fox jumps over the dog')
		
		const range = createRange(buffer, 'the '.length, 'the quick fox jumps over the dog'.length)
		buffer.insert(' brown', 'the quick'.length)
		buffer.insert(' lazy', 'the quick brown fox jumps over the'.length)

		expect(range.asString()).toEqual('quick brown fox jumps over the lazy dog')
	})

	it('gets back a substring after inserting at the end of the range', () => {
		const buffer = new MBuffer('the quick brown jumps over the dog')
		
		const range = createRange(buffer, 'the '.length, 'the quick brown'.length)
		buffer.insert(' fox', 'the quick brown'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})
	it('gets back a substring after inserting at the end of the string', () => {
		const buffer = new MBuffer('the quick brown')
		
		const range = createRange(buffer, 'the '.length, 'the quick brown'.length)
		buffer.insert(' fox', 'the quick brown'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})
	it('gets back a substring after inserting at the end of the string (after an insert)', () => {
		const buffer = new MBuffer('the brown')
		
		const range = createRange(buffer, ''.length, 'the brown'.length)
		buffer.insert(' quick', 'the'.length)
		buffer.insert(' fox', 'the quick brown'.length)

		expect(range.asString()).toEqual('the quick brown fox')
	});

	[
		() => new MBuffer('the quick brown fox jumps over the lazy dog'),
		() => {
			const buffer = new MBuffer('tg')
			buffer.insert('ho', 't'.length)
			buffer.insert('ed', 'th'.length)
			buffer.insert(' ', 'the'.length)
			buffer.insert('qy', 'the '.length)
			buffer.insert('uz', 'the q'.length)
			buffer.insert('ia', 'the qu'.length)
			buffer.insert('cl', 'the qui'.length)
			buffer.insert('k ', 'the quic'.length)
			buffer.insert(' e', 'the quick'.length)
			buffer.insert('bh', 'the quick '.length)
			buffer.insert('rt', 'the quick b'.length)
			buffer.insert('o ', 'the quick br'.length)
			buffer.insert('wr', 'the quick bro'.length)
			buffer.insert('ne', 'the quick brow'.length)
			buffer.insert(' v', 'the quick brown'.length)
			buffer.insert('fo', 'the quick brown '.length)
			buffer.insert('o ', 'the quick brown f'.length)
			buffer.insert('xs', 'the quick brown fo'.length)
			buffer.insert(' p', 'the quick brown fox'.length)
			buffer.insert('jum', 'the quick brown fox '.length)
			return buffer
		}
	].forEach((createBuffer, i) => {
		it('gets back a substring from a buffer ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back a substring from a buffer after inserting ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.insert('red-', 'the quick '.length)
	
			expect(range.asString()).toEqual('quick red-brown fox')
		})
	
		it('gets back the correct range when deleting content after the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown fox jumps'.length, ' over the lazy dog'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content RIGHT after the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown fox'.length, ' jumps over the lazy dog'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content in the middle of the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick '.length, 'brown '.length)
	
			expect(range.asString()).toEqual('quick fox')
		})
		it('gets back the correct range when deleting content in the middle of the range, right after the start ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the q'.length, 'uick '.length)
	
			expect(range.asString()).toEqual('qbrown fox')
		})
		it('cannot get back range when deleting content in the middle of the range, right AT the start ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the '.length, 'quick '.length)
	
			expect(range.isValid).toEqual(false)
		})
		it('gets back the correct range when deleting content in the middle of the range, right before the end ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown'.length, ' fox'.length)
	
			expect(range.asString()).toEqual('quick brown')
		})
		it('gets back the correct range when deleting content before the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete(''.length, 'the'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content before the range, up-to the start ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
			buffer.delete(''.length, 'the '.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
	})

	it('invalidates the range when deleting the start of the range', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
		buffer.delete(''.length, 'the q'.length)

		expect(() => range.ensureValid()).toThrow()
	})
	it('invalidates the range when deleting the end of the range', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		const range = createRange(buffer, 'the '.length, 'the quick brown fox'.length)
		buffer.delete('the quick brown fo'.length, 'x jumps'.length)

		expect(() => range.ensureValid()).toThrow()
	})
})