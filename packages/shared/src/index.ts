export const { isArray } = Array

export const isObject = (x: unknown): x is object => x !== null && typeof x === 'object'

export const isFunction = (x: unknown): x is Function => typeof x === 'function'

export const isIterable = (value: unknown): value is Iterable<unknown> =>
  isArray(value) || !!(value && (value as any)[Symbol.iterator])

// https://tc39.github.io/ecma262/#sec-typeof-operator
export type Primitive = null | undefined | boolean | number | string | symbol | bigint

export const isPrimitive = (x: unknown): x is Primitive => !isObject(x) && !isFunction(x)
