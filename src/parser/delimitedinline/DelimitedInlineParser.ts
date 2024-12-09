import { AnyInline, ContainerInline, ElementOptions } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMParser } from "../MfMParser"
import { findNextDelimiterRun } from "./DelimiterRun"

export abstract class DelimitedMfMElement<
	TYPE extends string,
	ELEMENT extends DelimitedMfMElement<TYPE, ELEMENT, PARSER>,
	PARSER extends DelimitedInlineParser<TYPE, ELEMENT, PARSER>,
> extends MfMElement<TYPE, AnyInline, ELEMENT, PARSER> {
	constructor(
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: PARSER,
		public readonly delimiter: string,
		public readonly content: AnyInline[],
	) {
		super(id, options, parsedRange, parsedWith)
	}

	get asText(): string {
		return this.delimiter +
			this.content.map(c => c.asText).join('') +
			this.delimiter
	}

	override get referenceMap(): { [key: string]: string; } {
		return {
			...super.referenceMap,
		}
	}
}

export abstract class DelimitedInlineParser<
	TYPE extends string,
	ELEMENT extends ContainerInline<TYPE, ELEMENT>,
	PARSER extends DelimitedInlineParser<TYPE, ELEMENT, PARSER>,
> extends MfMParser<TYPE, AnyInline, ELEMENT> {
	abstract readonly type: TYPE
	abstract readonly ElementClass: new (
		id: string,
		options: ElementOptions,
		parsedRange: PersistentRange,
		parsedWith: PARSER,
		delimiter: string,
		content: AnyInline[],
	) => ELEMENT
	abstract readonly self: PARSER
	abstract readonly delimiters: string[]
	abstract readonly delimiterLength: number

	parse(start: TextLocation, end: TextLocation): ELEMENT | null {
		const options: ElementOptions = {}

		const startDelimiter = findNextDelimiterRun(this.delimiters, start, end, {
			minLength: this.delimiterLength,
			maxStartIndex: 0,
			leftFlanking: true,
		})

		if(startDelimiter != null) {
			const contentStart = startDelimiter[1]
			const endDelimiter = findNextDelimiterRun([ startDelimiter[2].delimiterChar ], contentStart, end, {
				rightFlanking: true,
				minLength: this.delimiterLength,
			})

			if(endDelimiter != null) {
				const contentEnd = endDelimiter[0]

				const text = this.parsers.Text.parse(contentStart, contentEnd)

				if(text !== null) {
					return new this.ElementClass(
						this.idGenerator.nextId(),
						options,
						start.persistentRangeUntil(end),
						this.self,
						startDelimiter[0].stringUntil(startDelimiter[1]),
						[ text ]
					)
				}
			}
		}

		return null
	}

	nextPossibleStart(start: TextLocation, end: TextLocation): TextLocation | null {
		const possibleStart = findNextDelimiterRun(this.delimiters, start, end, {
			minLength: this.delimiterLength,
			leftFlanking: true,
		})

		return possibleStart?.[0] ?? null
	}
}
