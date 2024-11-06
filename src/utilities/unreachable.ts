export function unreachable(message: string, element: never) {
	throw new Error(message)
}
