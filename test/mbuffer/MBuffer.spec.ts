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
})
