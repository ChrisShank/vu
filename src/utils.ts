export const { isArray } = Array

export const isObject = (x: unknown): x is object => x !== null && typeof x === 'object'

export const isFunction = (x: unknown): x is Function => typeof x === 'function'

// Compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: unknown, oldValue: unknown): boolean =>
	value !== oldValue && (value === value || oldValue === oldValue)

export function remove<T>(arr: T[], el: T): void {
	const i = arr.indexOf(el)
	if (i > -1) {
		arr.splice(i, 1)
	}
}

const camelizeRE = /-(\w)/g
export const camelize = (str: string) => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)


export const isBoolean = (val: any) => /function Boolean/.test(String(val))
export const isNumber = (val: any) => /function Number/.test(String(val))

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string => objectToString.call(value)
export const toRawType = (value: unknown) => toTypeString(value).slice(8, -1)

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
export function makeMap(
	str: string,
	expectsLowerCase?: boolean
): (key: string) => boolean {
	const map: Record<string, boolean> = Object.create(null)
	const list: Array<string> = str.split(',')
	for (let i = 0; i < list.length; i++) {
		map[list[i]] = true
	}
	return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}