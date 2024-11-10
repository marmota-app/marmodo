import { ElementContent } from './test/setup'

declare global {
	namespace jest {
		// Register as a Symmetric Matcher
		interface Matchers<R> {
			toHaveChildren(expected: ElementContent[]): CustomMatcherResult;
		}
	}
}
