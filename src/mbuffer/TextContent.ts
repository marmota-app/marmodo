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

import { ContentUpdate } from "./ContentUpdate"
import { MBuffer } from "./MBuffer"
import { TextRange } from "./TextRange"

export interface UpdateInfo {
	replacedText: string,
	newText: string,
	range: TextRange,
}
export class TextContent {
	private buffer: MBuffer
	constructor(text: string) {
		this.buffer = new MBuffer(text)
	}

	update(cu: ContentUpdate): UpdateInfo {
		const replacedRange = this.buffer.range(cu.rangeOffset, cu.rangeOffset+cu.rangeLength)
		const replacedText = replacedRange.asString()
		const newText = cu.text

		if(cu.rangeLength > 0) {
			this.buffer.delete(cu.rangeOffset, cu.rangeLength)
		}
		if(cu.text.length > 0) {
			this.buffer.insert(cu.text, cu.rangeOffset)
		}

		const range = new TextRange(this.buffer.location(cu.rangeOffset), replacedRange.end)

		return {
			replacedText,
			newText,
			range,
		}
	}

	text(): string {
		return this.buffer.asString()
	}

	asRange(): TextRange {
		return this.buffer.range(0, this.buffer.length)
	}
}