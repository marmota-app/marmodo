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

import { MBuffer } from "../../src/mbuffer/MBuffer"

describe('MBuffer', () => {
	it('creates a buffer from a backing string', () => {
		const buffer = new MBuffer('initial content')

		expect(buffer.contentAsString()).toEqual('initial content')
	})

	it('appends the text to append directly to the buffer', () => {
		const buffer = new MBuffer('the quick')

		buffer.insert(' brown', buffer.length)

		expect(buffer.contentAsString()).toEqual('the quick brown')
		expect(buffer.asString()).toEqual('the quick brown')
	})

	it('splits the buffer when inserting in the middle', () => {
		const buffer = new MBuffer('the brown fox')

		buffer.insert(' quick', 'the'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the quick brown fox')
	})

	it('splits the buffer when deleting in the middle', () => {
		const buffer = new MBuffer('the quick brown fox')

		buffer.delete('the'.length, ' quick'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the brown fox')
	})

	it('splits the next buffer when deleting in the middle', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		buffer.delete('the'.length, ' quick'.length)
		buffer.delete('the brown fox jumps over the'.length, ' lazy'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the brown fox jumps over the dog')
	})

	it('splits both buffers when deleting across a gap', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		buffer.delete('the quic'.length, 'k b'.length)
		buffer.delete('the '.length, 'quicr'.length)

		expect(buffer.contentAsString()).toEqual('the ')
		expect(buffer.asString()).toEqual('the own fox jumps over the lazy dog')
	})

	it('can delete complete buffers', () => {
		const buffer = new MBuffer('the quick brown fox jumps over the lazy dog')

		buffer.delete('the qu'.length, 'i'.length)
		buffer.delete('the quck br'.length, 'o'.length)
		buffer.delete('the'.length, ' quck brwn'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the fox jumps over the lazy dog')
	})

	it('can insert in a later buffer', () => {
		const buffer = new MBuffer('the quick brown')

		buffer.delete('the'.length, ' quick'.length)
		buffer.insert(' fox', 'the brown'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the brown fox')
	})

	it('can insert in a later buffer', () => {
		const buffer = new MBuffer('the quick fox')

		buffer.delete('the'.length, ' quick'.length)
		buffer.insert(' brown', 'the'.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the brown fox')
	})

	it('can insert into inserted text', () => {
		const buffer = new MBuffer('the fox')

		buffer.insert(' quick brown', 'the'.length)
		buffer.insert('red-', 'the quick '.length)

		expect(buffer.contentAsString()).toEqual('the')
		expect(buffer.asString()).toEqual('the quick red-brown fox')
	})

	describe('persistent locations and inserts', () => {
		function createBuffer(): MBuffer {
			const buffer = new MBuffer('the fox')

			buffer.insert('st brown', 'the'.length)
			buffer.insert(' quick fa', 'the'.length)
			buffer.delete('the quick '.length, 'fast '.length)

			return buffer
		}

		it('does not move a persistent location before the delete', () => {
			const buffer = createBuffer()

			const before = buffer.startLocation('the'.length).persist()
			
			buffer.delete('the '.length, 'quick '.length)
			
			expect(buffer.asString()).toEqual('the brown fox')
			expect(before.index).toEqual(0)
			expect(before.buffer.contentAsString()).toEqual(' ')
		})

		it('can delete before a persistent location at the end of a buffer', () => {
			const buffer = createBuffer()

			const location = buffer.startLocation('the quick brow'.length).persist()
			buffer.delete('the quick bro'.length, 'w'.length)

			expect(location).toHaveProperty('isValid', true)
			expect(location).toHaveProperty('index', 0)
			expect(location.buffer.contentAsString()).toEqual('n')
		})
		it('can delete AT a persistent location at the end of a buffer', () => {
			const buffer = createBuffer()

			const location = buffer.startLocation('the quick brow'.length).persist()
			buffer.delete('the quick brow'.length, 'n'.length)

			expect(location).toHaveProperty('isValid', false)
		})
	})
})
