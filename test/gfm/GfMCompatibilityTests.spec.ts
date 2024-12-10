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



import { JSDOM } from 'jsdom'
import fs from 'fs'
import { MfMDocument } from '../../src/MfMDocument'
import { html } from './html'

interface ImplementedExample {
	name: string,
	reason: string,
}
interface RequiredTransformation {
	name: string,
	transforms: [string | RegExp, string][],
}
interface ImplementedSection {
	chapter: string,
	name: string,
	notYetImplemented: ImplementedExample[],
	incompatible: ImplementedExample[],
	transform?: RequiredTransformation[],
}

const NYI = {
	line_indentation: 'Indentation of lines that does not create any element',
	escaping: 'Escaping characters with backslashes',
	indentation: 'Indenting elements with up-to three whitespace characters',
	paragraph_continuation: 'Continuing a paragraph with indentation after the first line',

	elements: {
		indented_code_blocks: 'Element still missing: Indented code block',
		heading: {
			closing_sequences: 'Missing feature: Closing sequences of "#" and " " after a heading',
		},
		horizontal_rule: 'Element still missing: Horizontal rule',

		line_breaks: 'Element still missing: Line break',

		inline_code_spans: 'Element still missing: Inline code spans',
		links: 'Element still missing: Hyperlink',
	}
}
const INCOMPATIBLE = {
	removing_trailing_spaces: 'Trailing spaces are not removed',
	html_elements: 'HTML Elements are not supported',
	shortest_delimited_span: 'Finding the shortest delimited span (for em, strong, ...) and other delimtier-run edge-cases are not supported',
	delimited_elements_precedence: 'Precedence of delimited elements with longer delimiter runs is different than in GfM (and should be avoided anyway)'
}

const implementedSections: ImplementedSection[] = [
	{ chapter: '4.2', name: 'ATX headings',
		notYetImplemented: [
			{ name: 'Example 35', reason: NYI.escaping },
			{ name: 'Example 36', reason: NYI.escaping },
			{ name: 'Example 38', reason: NYI.indentation },
			{ name: 'Example 39', reason: NYI.elements.indented_code_blocks },
			{ name: 'Example 40', reason: NYI.paragraph_continuation },
			{ name: 'Example 41', reason: NYI.elements.heading.closing_sequences },
			{ name: 'Example 42', reason: NYI.elements.heading.closing_sequences },
			{ name: 'Example 43', reason: NYI.elements.heading.closing_sequences },
			{ name: 'Example 46', reason: NYI.escaping },
			{ name: 'Example 47', reason: NYI.elements.horizontal_rule },
			{ name: 'Example 49', reason: NYI.elements.heading.closing_sequences },
		],
		incompatible: [
			{ name: 'Example 37', reason: INCOMPATIBLE.removing_trailing_spaces },
		],
	},
	{ chapter: '4.8', name: 'Paragraphs',
		notYetImplemented: [
			{ name: 'Example 192', reason: NYI.line_indentation },
			{ name: 'Example 193', reason: NYI.line_indentation },
			{ name: 'Example 194', reason: NYI.line_indentation },
			{ name: 'Example 195', reason: NYI.elements.indented_code_blocks },
			{ name: 'Example 196', reason: NYI.elements.line_breaks },
		],
		incompatible: [],
	},
	{ chapter: '6.4', name: 'Emphasis and strong emphasis',
		notYetImplemented: [
			{ name: 'Example 362', reason: NYI.escaping },
			{ name: 'Example 368', reason: NYI.escaping },
			{ name: 'Example 372', reason: NYI.escaping },
			{ name: 'Example 389', reason: NYI.escaping },
			{ name: 'Example 394', reason: NYI.escaping },
			{ name: 'Example 404', reason: NYI.escaping },
			{ name: 'Example 413', reason: NYI.elements.links },
			{ name: 'Example 428', reason: NYI.elements.links },
			{ name: 'Example 431', reason: NYI.elements.links },
			{ name: 'Example 442', reason: NYI.elements.links },
			{ name: 'Example 446', reason: NYI.escaping },
			{ name: 'Example 449', reason: NYI.escaping },
			{ name: 'Example 458', reason: NYI.escaping },
			{ name: 'Example 461', reason: NYI.escaping },
			{ name: 'Example 482', reason: NYI.elements.links },
			{ name: 'Example 483', reason: NYI.elements.links },
			{ name: 'Example 487', reason: NYI.elements.inline_code_spans },
			{ name: 'Example 488', reason: NYI.elements.inline_code_spans },
		],
		incompatible: [
			{ name: 'Example 369', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 370', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 371', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 378', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 382', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 383', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 384', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 385', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 395', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 396', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 397', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 398', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 402', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 408', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 409', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 410', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 411', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 415', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 416', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 417', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 419', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 420', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 421', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 422', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 424', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 425', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 427', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 434', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 435', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 441', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 451', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 453', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 454', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 463', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 465', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 466', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 476', reason: INCOMPATIBLE.delimited_elements_precedence },
			{ name: 'Example 477', reason: INCOMPATIBLE.delimited_elements_precedence },
			{ name: 'Example 480', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 481', reason: INCOMPATIBLE.shortest_delimited_span },
			{ name: 'Example 484', reason: INCOMPATIBLE.html_elements },
			{ name: 'Example 485', reason: INCOMPATIBLE.html_elements },
			{ name: 'Example 486', reason: INCOMPATIBLE.html_elements },
			{ name: 'Example 489', reason: INCOMPATIBLE.html_elements },
			{ name: 'Example 490', reason: INCOMPATIBLE.html_elements },
		],
	},
]

const compatibility: string[] = []
describe('Github-flavored-Markdown (GfM) compatibility', () => {
	it('should be implemented, see below...', () => {})
	
	const gfmSpecContent = fs.readFileSync('test/gfm/GitHub Flavored Markdown Spec.html', 'utf-8')
	const gfmSpec = new JSDOM(gfmSpecContent)
	

	compatibility.push('# Markdown compatibility')
	compatibility.push('')

	findTestsFrom(gfmSpec.window.document.body.children)
	
	if(process.env.WRITE_COMPAT_INFO) {
		fs.writeFileSync('./docs/github-flavored-markdown-compatibility.md', compatibility.join('\n'))
	}

	function describeSection(children: HTMLCollection, startIndex: number, sectionInfo?: ImplementedSection) {
		return () => {
			for(let i=startIndex; i < children.length; i++) {
				const child = children[i]
	
				if(child.nodeName === 'H1' || child.nodeName === 'H2') { return }
	
				if(child.nodeName === 'DIV' && child.classList.contains('example')) {
					const example = withoutEmptyLines(child.querySelector('.examplenum')?.textContent)
					const md = child.querySelector('.language-markdown')?.textContent
						?.replaceAll('→', '\t')
					const html = child.querySelector('.language-html')?.textContent
						?.replaceAll('→', '\t')
	
					if(example != null && md != null && html != null) {
						testExample(example, md, html, sectionInfo)
					}
				}
			}
		}
	}
	
	function testExample(name: string, md: string, expected: string, sectionInfo?: ImplementedSection) {
		if(sectionInfo?.notYetImplemented.filter(nyi => nyi.name === name)?.length??0 > 0) {
			const info = sectionInfo?.notYetImplemented?.filter(nyi => nyi.name === name)[0] as ImplementedExample
			compatibility.push('* '+info.name+': '+info.reason+';  ')
			writeExample('Markdown input', 'markdown', md)
			writeExample('Expected HTML', 'html', expected)
			it.skip(name+'(-- '+info.reason+' --)', () => {
			})
		} else if(sectionInfo?.incompatible.filter(nyi => nyi.name === name)?.length??0 > 0) {
			const info = sectionInfo?.incompatible?.filter(nyi => nyi.name === name)[0] as ImplementedExample
			compatibility.push('* INCOMPATIBLE - '+info.name+': '+info.reason+';  ')
			writeExample('Markdown input', 'markdown', md)
			writeExample('Expected HTML', 'html', expected)
			//In this case, the example is not a test, since we don't add
			//tests for known incompatibilities.
		} else {
			it(name, () => {
				const document = new MfMDocument(md)

				let expectedResult = expected
				const currentTransform = sectionInfo?.transform?.filter(t => t.name === name)?.[0]
				currentTransform?.transforms.forEach(t => expectedResult = expectedResult.replaceAll(t[0], t[1]))

				expect(withoutEmptyLines(html(document))).toEqual(withoutEmptyLines(expectedResult))
			})
		}
	}

	function withoutEmptyLines(text: string | null | undefined) {
		if(text == null) return ''

		return text
			.split('\n')
			.filter(s => s.length > 0)
			.join('\n')
	}

	function writeExample(label: string, format: string, content: string) {
		compatibility.push('  '+label+':')
		compatibility.push('  ```'+format)
		content.split('\n').forEach(l => compatibility.push('  '+l))
		compatibility.push('  ```')
	}

	function findTestsFrom(children: HTMLCollection) {
		for(let i=0; i<children.length; i++) {
			const child = children[i]
			
			if(child.nodeName === 'DIV' && child.classList.contains('appendices')) { return; }
	
			if(child.nodeName === 'H2') {
				const number = child.querySelector('span.number')?.textContent ?? ''
				let text = ''
				child.childNodes.forEach(cn => { if(cn.nodeName === '#text') { text = cn.textContent ?? '' } })
	
				if(implementedSections.filter(s => s.chapter===number).length > 0) {
					const sectionInfo = implementedSections.filter(s => s.chapter===number)[0]
	
					compatibility.push('## '+sectionInfo.chapter+' '+sectionInfo.name+' - Implemented')
					if(sectionInfo.notYetImplemented.length > 0 || sectionInfo.incompatible.length > 0) {
						compatibility.push('')
						compatibility.push('Except **not yet implemented** functionality and known **incompatibilities**:')
						compatibility.push('')
					}
	
					describe(number+': '+text, describeSection(children, i+1, sectionInfo))
				} else {
					compatibility.push('## '+number+' NOT yet Implemented')
					describe.skip(number+': '+text, describeSection(children, i+1))
				}
			} else if(child.nodeName === 'DIV' && child.classList.contains('extension')) {
				findTestsFrom(child.children)
			}
		}
	}
})
