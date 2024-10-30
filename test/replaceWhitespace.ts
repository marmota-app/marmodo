export function replaceWhitespace(text: string): string {
	return text
		.replaceAll(' ', '·')
		.replaceAll('\t', '→')
		.replaceAll('\r', '܀')
		.replaceAll('\n', '↓')
}
