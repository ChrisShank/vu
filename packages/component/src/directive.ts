import { getCurrentComponentInstance } from './instance'
import { isFunction } from './utils'

export interface DirectiveBinding<V = any> {
  value: V
  oldValue: V | null
  arg?: string
  modifiers: DirectiveModifiers
  dir: ObjectDirective<any, V>
}

export type DirectiveHook<T = any, V = any> = (el: T, binding: DirectiveBinding<V>) => void

export interface ObjectDirective<T = any, V = any> {
  beforeMount?: DirectiveHook<T, V>
  mounted?: DirectiveHook<T, V>
  beforeUpdate?: DirectiveHook<T, V>
  updated?: DirectiveHook<T, V>
  beforeUnmount?: DirectiveHook<T, V>
  unmounted?: DirectiveHook<T, V>
}

export type FunctionDirective<T = any, V = any> = DirectiveHook<T, V>

export type Directive<T = any, V = any> = ObjectDirective<T, V> | FunctionDirective<T, V>

export type DirectiveModifiers = Record<string, boolean>

// Directive, value, argument, modifiers
export type DirectiveArguments = Array<
  | [Directive]
  | [Directive, any]
  | [Directive, any, string]
  | [Directive, any, string, DirectiveModifiers]
>

export function withDirectives(directives: DirectiveArguments) {
  const instance = getCurrentComponentInstance()

  if (instance === null) {
    __DEV__ && console.warn(`withDirectives can only be used inside render functions.`)
    return
  }

  const bindings: DirectiveBinding[] = []
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = {}] = directives[i]
    if (isFunction(dir)) {
      dir = {
        mounted: dir,
        updated: dir,
      }
    }
    bindings.push({
      value,
      oldValue: void 0,
      arg,
      modifiers,
      dir,
    })
  }
}

export function invokeDirectiveHook(bindings: DirectiveBinding[], name: keyof ObjectDirective) {
  const oldBindings: DirectiveBinding[] = []
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i]
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value
    }
    const hook = binding.dir[name] as DirectiveHook | undefined
    if (hook) {
      // call hook
    }
  }
}
