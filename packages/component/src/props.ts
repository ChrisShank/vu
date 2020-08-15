import { shallowReactive } from '@vue/reactivity'
import { isFunction, isArray } from '@vu/shared'
import { isBoolean, isNumber, makeMap, capitalize, toRawType } from './utils'
import { Data } from './component'

type PropMethod<T, TConstructor = any> = T extends (...args: any) => any // if is function with args
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never

type PropConstructor<T = any> = { new (...args: any[]): T & object } | { (): T } | PropMethod<T>

export type PropType<T = any> = PropConstructor<T>

type DefaultFactory<T = any> = () => T | null

export type Prop<T = any> = {
  type: PropType<T>
  default?: T | DefaultFactory<T>
  required?: boolean
  validator?(value: unknown): boolean
}

export type ComponentPropOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]>
}

type RequiredKeys<T, MakeDefaultRequired> = {
  [K in keyof T]: T[K] extends
    | { required: true }
    | (MakeDefaultRequired extends true ? { default: any } : never)
    ? K
    : never
}[keyof T]

type OptionalKeys<T, MakeDefaultRequired> = Exclude<keyof T, RequiredKeys<T, MakeDefaultRequired>>

type InferPropType<T> = T extends { type: ObjectConstructor }
  ? Record<string, any>
  : T extends { type: BooleanConstructor }
  ? boolean
  : T extends Prop<infer V>
  ? V
  : T

export type ExtractPropTypes<O, MakeDefaultRequired extends boolean = true> = O extends object
  ? { [K in RequiredKeys<O, MakeDefaultRequired>]: InferPropType<O[K]> } &
      { [K in OptionalKeys<O, MakeDefaultRequired>]?: InferPropType<O[K]> }
  : { [K in string]: any }

export function getInitialProps(props: ComponentPropOptions<any>) {
  const initialProps = shallowReactive<Record<string, any>>({})
  Object.keys(props).forEach((key) => {
    const prop = props[key]
    if (prop.default) {
      initialProps[key] = isFunction(prop.default) ? prop.default() : prop.default
    } else {
      initialProps[key] = undefined
    }
  })
  return initialProps
}

export function convertAttributeValue(
  name: string,
  value: string | null,
  type: PropType
): string | boolean | number | undefined {
  if (isBoolean(type)) {
    if (value === 'true' || value === 'false') {
      return value === 'true'
    }
    if (value === '' || value === name) {
      return true
    }
    return value != null
  } else if (value === null) {
    return undefined
  } else if (isNumber(type)) {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? value : parsed
  } else {
    return value
  }
}

export function validateProp(name: string, value: unknown, prop: Prop, isAbsent: boolean) {
  const { type, required, validator } = prop
  // required!
  if (required && isAbsent) {
    console.warn('Missing required prop: "' + name + '"')
    return
  }
  // missing but optional
  if (value == null && !prop.required) {
    return
  }
  // type check
  // value is valid as long as one of the specified types match
  const { valid, expectedType } = assertType(value, type)
  if (!valid) {
    console.warn(getInvalidTypeMessage(name, value, expectedType))
    return
  }
  // custom validator
  if (validator && !validator(value)) {
    console.warn('Invalid prop: custom validator check failed for prop "' + name + '".')
  }
}

function assertType(value: unknown, type: PropType) {
  let valid: boolean
  const expectedType = getType(type)
  if (isSimpleType(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = toRawType(value) === 'Object'
  } else if (expectedType === 'Array') {
    valid = isArray(value)
  } else {
    valid = value instanceof type
  }
  return {
    valid,
    expectedType,
  }
}

const isSimpleType = /*#__PURE__*/ makeMap('String,Number,Boolean,Function,Symbol')

function getType(ctor: PropType): string {
  const match = ctor && ctor.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

function getInvalidTypeMessage(name: string, value: unknown, expectedType: string): string {
  const expectedValue = styleValue(value, expectedType)
  return `Invalid prop: type check failed for prop "${name}". Expected ${capitalize(
    expectedType
  )} with value ${expectedValue}`
}

function styleValue(value: unknown, type: string): string {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}
