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

//import { Marmdown } from "../../../src/Marmdown"
//import { MfMDialect } from "../../../src/MfMDialect"
//import { html } from "../html"

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

const implementedSections: ImplementedSection[] = [
]

const compatibility: string[] = []
describe.skip('Github-flavored-Markdown (GfM) compatibility', () => {
	it('should be implemented, see below...', () => {})
	
	/*
	const marmdown = new Marmdown(new MfMDialect())

	const gfmSpecContent = fs.readFileSync('test/integration/gfm/GitHub Flavored Markdown Spec.html', 'utf-8')
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
				marmdown.textContent = md
				expect(withoutEmptyLines(html(marmdown))).toEqual(withoutEmptyLines(expected))
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
				marmdown.textContent = md

				let expectedResult = expected
				const currentTransform = sectionInfo?.transform?.filter(t => t.name === name)?.[0]
				currentTransform?.transforms.forEach(t => expectedResult = expectedResult.replaceAll(t[0], t[1]))

				expect(withoutEmptyLines(withoutEmptyLines(html(marmdown)))).toEqual(withoutEmptyLines(expectedResult))
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
	*/
})