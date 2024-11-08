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
import { TemporaryLocation } from "./TextLocation"
import { PersistentRange } from "./TextRange"

export interface UpdateInfo {
	replacedText: string,
	newText: string,
	range: PersistentRange,
}
export class TextContent {
	private buffer: MBuffer
	constructor(text: string) {
		this.buffer = new MBuffer(text)
	}

	update(cu: ContentUpdate): UpdateInfo {
		const start = this.buffer.location(cu.rangeOffset).persist()
		const end = this.buffer.location(cu.rangeOffset+cu.rangeLength).persist()
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
		const updatedStart = this.buffer.location(cu.rangeOffset).persist()
		const range = new PersistentRange(updatedStart, end)

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
		return this.buffer.location(0)
	}
	end(): TemporaryLocation {
		return this.buffer.end()
	}
}