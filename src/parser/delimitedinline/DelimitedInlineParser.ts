import { AnyInline, ContainerInline, ElementOptions } from "../../element"
import { MfMElement } from "../../element/MfMElement"
import { TextLocation } from "../../mbuffer/TextLocation"
import { PersistentRange } from "../../mbuffer/TextRange"
import { MfMParser } from "../MfMParser"

export abstract class DelimitedMfMElement<
	TYPE extends string,
	ELEMENT extends DelimitedMfMElement<TYPE, ELEMENT, PARSER>,
	PARSER extends DelimitedInlineParser<TYPE, ELEMENT, PARSER>,
> extends MfMElement<TYPE, AnyInline, ELEMENT, PARSER> {
	get textContent() {
		//TODO WRONG! Should return the delimiters and the inline content!
		return this.parsedRange.asString()
	}

	get asText(): string {
		return this.parsedRange.asString()
	}

	override get referenceMap(): { [key: string]: string; } {
		return {
			...super.referenceMap,
			'element.textContent': this.textContent,
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
	) => ELEMENT
	abstract readonly self: PARSER

	parse(start: TextLocation, end: TextLocation): ELEMENT | null {
		const options: ElementOptions = {}

		return new this.ElementClass(
			this.idGenerator.nextId(),
			options,
			start.persistentRangeUntil(end),
			this.self,
		)
	}
}
