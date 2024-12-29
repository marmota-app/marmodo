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

import { ContentUpdate } from "./ContentUpdate"
import { MBuffer } from "./MBuffer"
import { TemporaryLocation } from "./TextLocation"
import { TemporaryRange } from "./TextRange"

export interface UpdateInfo {
	replacedText: string,
	newText: string,
	range: TemporaryRange,
}
export class TextContent {
	private buffer: MBuffer
	constructor(text: string) {
		this.buffer = new MBuffer(text)
	}

	get internalBuffer() {
		return this.buffer
	}

	update(cu: ContentUpdate): UpdateInfo {
		const start = this.buffer.startLocation(cu.rangeOffset).persist()
		const end = this.buffer.endLocation(cu.rangeOffset+cu.rangeLength).persist()
		const replacedText = start.stringUntil(end)
		const newText = cu.text

		if(cu.rangeLength > 0) {
			this.buffer.delete(cu.rangeOffset, cu.rangeLength)
		}
		if(cu.text.length > 0) {
			this.buffer.insert(cu.text, cu.rangeOffset)
		}

		//When the range was deleted completely and start === end, then
		//inserting text will move the start pointer together with the end
		//(one cannot insert into an empty range). So, we have to get the
		//new start pointer after the update here, as updatedStart.

		const updatedStart = this.buffer.startLocation(cu.rangeOffset)
		const range = updatedStart.temporaryRangeUntil(end.accessor())

		start.invalidate()
		end.invalidate()

		return {
			replacedText,
			newText,
			range,
		}
	}

	text(): string {
		return this.buffer.asString()
	}

	start(): TemporaryLocation {
		return this.buffer.startLocation(0)
	}
	end(): TemporaryLocation {
		return this.buffer.end()
	}
}