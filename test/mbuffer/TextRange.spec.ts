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

describe('TextRange', () => {
	it('gets back a substring from a buffer when something was inserted', () => {
		const buffer = new MBuffer('the quick fox jumps over the lazy dog')
		buffer.insert(' brown', 'the quick'.length)
		
		const range = buffer.range('the '.length, 'the quick brown fox'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})

	it('gets back a substring from a buffer when something was inserted AFTER getting the range', () => {
		const buffer = new MBuffer('the quick fox jumps over the lazy dog')
		
		const range = buffer.range('the '.length, 'the quick fox'.length)
		buffer.insert(' brown', 'the quick'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})

	it('gets back a substring from a buffer when something was inserted TWICE AFTER getting the range', () => {
		const buffer = new MBuffer('the quick fox jumps over the dog')
		
		const range = buffer.range('the '.length, 'the quick fox jumps over the dog'.length)
		buffer.insert(' brown', 'the quick'.length)
		buffer.insert(' lazy', 'the quick brown fox jumps over the'.length)

		expect(range.asString()).toEqual('quick brown fox jumps over the lazy dog')
	})

	it('gets back a substring after inserting at the end of the range', () => {
		const buffer = new MBuffer('the quick brown jumps over the dog')
		
		const range = buffer.range('the '.length, 'the quick brown'.length)
		buffer.insert(' fox', 'the quick brown'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})
	it('gets back a substring after inserting at the end of the string', () => {
		const buffer = new MBuffer('the quick brown')
		
		const range = buffer.range('the '.length, 'the quick brown'.length)
		buffer.insert(' fox', 'the quick brown'.length)

		expect(range.asString()).toEqual('quick brown fox')
	})
	it('gets back a substring after inserting at the end of the string (after an insert)', () => {
		const buffer = new MBuffer('the brown')
		
		const range = buffer.range(''.length, 'the brown'.length)
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
			buffer.insert('  ', 'the'.length)
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
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back a substring from a buffer after inserting ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.insert('red-', 'the quick '.length)
	
			expect(range.asString()).toEqual('quick red-brown fox')
		})
	
		it('gets back the correct range when deleting content after the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown fox jumps'.length, ' over the lazy dog'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content RIGHT after the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown fox'.length, ' jumps over the lazy dog'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content in the middle of the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick '.length, 'brown '.length)
	
			expect(range.asString()).toEqual('quick fox')
		})
		it('gets back the correct range when deleting content in the middle of the range, right after the start ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete('the '.length, 'quick '.length)
	
			expect(range.asString()).toEqual('brown fox')
		})
		it('gets back the correct range when deleting content in the middle of the range, right before the end ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete('the quick brown'.length, ' fox'.length)
	
			expect(range.asString()).toEqual('quick brown')
		})
		it('gets back the correct range when deleting content before the range ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete(''.length, 'the'.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
		it('gets back the correct range when deleting content before the range, up-to the start ['+i+']', () => {
			const buffer = createBuffer()
			
			const range = buffer.range('the '.length, 'the quick brown fox'.length)
			buffer.delete(''.length, 'the '.length)
	
			expect(range.asString()).toEqual('quick brown fox')
		})
	})

	it('invalidates the range when deleting the start of the range', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		const range = buffer.range('the '.length, 'the quick brown fox'.length)
		buffer.delete(''.length, 'the q'.length)

		expect(range.isValid).toEqual(false)
	})
	it('invalidates the range when deleting the end of the range', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		const range = buffer.range('the '.length, 'the quick brown fox'.length)
		buffer.delete('the quick brown fo'.length, 'x jumps'.length)

		expect(range.isValid).toEqual(false)
	})
})
