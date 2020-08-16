export interface DirectiveBinding<V = any> {
  value: V
  oldValue: V | null
  arg?: string
  modifiers: DirectiveModifiers
  dir: Directive<V>
}

export type DirectiveModifiers = Record<string, boolean>

export interface Directive<V = any> {
  mounted?: DirectiveHook<V>
  updated?: DirectiveHook<V>
  unmounted?: DirectiveHook<V>
}

export type DirectiveHook<V = any> = (
  el: Element,
  binding: DirectiveBinding<V>,
) => void
