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

import { Parsers } from "../../../src/parser/Parsers"
import { Element } from "../../../src/element"
import { MfMTable } from "../../../src/parser/table/TableParser"
import { parseAll } from "../../parse"
import { SxContext } from "../../../src/sx/SxContext"
import { parseAndUpdate } from "../../update/expectUpdate"

function evalSx(table: Element<any, any, any> | null, input: string) {
	return table!.parsingContext.sxContext!.createEvaluation(input).evaluate('id-1')
}
describe('Table: SX Values', () => {
	describe('evaluating table content (first parse)', () => {
		[
			[1, 1, '1'],
			[2, 1, 'foo'],
			[1, 2, 'true'],
			[2, 2, '3.3'],
		].forEach(([col, row, expected]) => it(`can access value [${col},${row}]=>${expected} from table`, () => {
			const result = parseAll('Table',
				'-----|----\n'+
				'1    | foo\n'+
				'true | 3.3'
			)

			const evaluated = evalSx(result, `[${col}, ${row}]`)
			expect(evaluated).toHaveProperty('resultType', 'value')
			expect(evaluated).toHaveProperty('asString', expected)
		}))

		it('can access value from within a column (from context evaluation)', () => {
			const result = parseAll('Table',
				'|---------|----\n'+
				'| 1.1     | foo\n'+
				'|{{[1,1]}}| 3.3'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const evaluated = evalSx(result, `[1, 2]`)
			expect(evaluated).toHaveProperty('resultType', 'value')
			expect(evaluated).toHaveProperty('asString', '1.1')
		})
		it('can access value from within a column (from column)', () => {
			const result = parseAll('Table',
				'|---------|----\n'+
				'| 1.1     | foo\n'+
				'|{{[1,1]}}| 3.3'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[1].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('1.1')
		})
		it('can access value from within a column (from column), accessing sx result', () => {
			const result = parseAll('Table',
				'|---------|----\n'+
				'|{{2*3  }}| foo\n'+
				'|{{[1,1]}}| 3.3'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[1].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('6')
		})

		it('can directly access a range of values', () => {
			const result = parseAll('Table',
				'|---------------|-----\n'+
				'|1              | foo \n'+
				'|2              | 3.3 \n' +
				'|3              | true\n' +
				'|{{[1,1]:[1,3]}}| 5   \n'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[3].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('[1,2,3]')
		})
		it('can access a range of values using row and col variables', () => {
			const result = parseAll('Table',
				'|---------------------------|-----\n'+
				'|1                          | foo \n'+
				'|2                          | 3.3 \n' +
				'|3                          | true\n' +
				'|{{[col,row-3]:[col,row-1]}}| 5   \n'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[3].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('[1,2,3]')
		})
		it('can sum a range of values using row and col variables', () => {
			const result = parseAll('Table',
				'|---------------------------|-----\n'+
				'|1.1                        | foo \n'+
				'|2                          | 3.3 \n' +
				'|3                          | true\n' +
				'|{{sum [1,1]:[col,row-1]  }}| 5   \n'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[3].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('6.1')
		})
		it('can sum a range of values using row and col variables with sx result in sum', () => {
			const result = parseAll('Table',
				'|---------------------------|-----\n'+
				'|1.1                        | foo \n'+
				'|{{[col+1,row]*2          }}| 3.3 \n' +
				'|3                          | true\n' +
				'|{{sum [1,1]:[col,row-1]  }}| 5   \n'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[3].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('10.7')
		})
		it('can double the result of a sum', () => {
			const result = parseAll('Table',
				'|-----------------------------|-----\n'+
				'|1.1                          | foo \n'+
				'|{{[col+1,row]*2            }}| 3.3 \n' +
				'|3                            | true\n' +
				'|{{(sum [1,1]:[col,row-1])*2}}| 5   \n'
			) as unknown as MfMTable
			result.updateSxResults('id-1')

			const col = result.tableRows[3].columns[0]
			expect(col.referenceMap['sx.result']).toEqual('21.4')
		})
	})

	describe('parsing updates', () => {
		const parser = new Parsers().Table

		it('updates sum when value changes', () => {
			const sxContext = new SxContext()
			const { original, updated } = parseAndUpdate(
				parser,
				'|-----------------------------|-----\n'+
				'|1.1                          | foo \n'+
				'|{{[col+1,row]*2            }}| 3.3 \n' +
				'|3                            | true\n' +
				'|{{(sum [1,1]:[col,row-1])*2}}| 5   \n',
				{ text: '2', rangeOffset: '|-----------------------------|-----\n|1.'.length, rangeLength: '1'.length },
				{ sxContext },
			)

			expect(updated).not.toBeNull()
			const col = updated?.tableRows[3].columns[0]
			expect(col?.referenceMap['sx.result']).toEqual('21.6')
		})
		it('updates sum when referenced value changes', () => {
			const sxContext = new SxContext()
			const { original, updated } = parseAndUpdate(
				parser,
				'|-----------------------------|-----\n'+
				'|1.1                          | foo \n'+
				'|{{[col+1,row]*2            }}| 3.3 \n' +
				'|3                            | true\n' +
				'|{{(sum [1,1]:[col,row-1])*2}}| 5   \n',
				{
					text: '2',
					rangeOffset: '|-----------------------------|-----\n|1.1                          | foo \n|{{[col+1,row]*2            }}| '.length,
					rangeLength: '3'.length
				},
				{ sxContext },
			)

			expect(updated).not.toBeNull()
			const col = updated?.tableRows[3].columns[0]
			expect(col?.referenceMap['sx.result']).toEqual('17.4')
		})
		it('updates sum when script changes', () => {
			const sxContext = new SxContext()
			const { original, updated } = parseAndUpdate(
				parser,
				'|-----------------------------|-----\n'+
				'|1.1                          | foo \n'+
				'|{{[col+1,row]*2            }}| 3.3 \n' +
				'|3                            | true\n' +
				'|{{(sum [1,1]:[col,row-1])*2}}| 5   \n',
				{
					text: '3',
					rangeOffset: '|-----------------------------|-----\n|1.1                          | foo \n|{{[col+1,row]*2            }}| 3.3 \n|3                            | true\n|{{(sum [1,1]:[col,row-1])*'.length,
					rangeLength: '2'.length
				},
				{ sxContext },
			)

			expect(updated).not.toBeNull()
			const col = updated?.tableRows[3].columns[0]
			expect(col?.referenceMap['sx.result']).toEqual('32.1')
		})
		it('updates sum when referenced script changes', () => {
			const sxContext = new SxContext()
			const { original, updated } = parseAndUpdate(
				parser,
				'|-----------------------------|-----\n'+
				'|1.1                          | foo \n'+
				'|{{[col+1,row]*2            }}| 3.3 \n' +
				'|3                            | true\n' +
				'|{{(sum [1,1]:[col,row-1])*2}}| 5   \n',
				{
					text: '3',
					rangeOffset: '|-----------------------------|-----\n|1.1                          | foo \n|{{[col+1,row]*'.length,
					rangeLength: '2'.length
				},
				{ sxContext },
			)

			expect(updated).not.toBeNull()
			const col = updated?.tableRows[3].columns[0]
			expect(col?.referenceMap['sx.result']).toEqual('28')
		})
	})
})
