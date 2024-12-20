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

export function jsonTransient<KEY extends string>(obj: { [key in KEY]: any}, propertyName: KEY) {
	jsonTransientPrivate(obj, propertyName)
}

export function jsonTransientPrivate(obj: any, propertyName: string) {
	let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName) || {};
	descriptor.enumerable = false;
	Object.defineProperty(obj, propertyName, descriptor)
}
