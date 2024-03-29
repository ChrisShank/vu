import { ReactiveEffect, stop, shallowReadonly } from '@vue/reactivity'
import { render, h, H } from '@vu/template'
import { watchEffect } from './watch'
import { setCurrentComponentInstance } from './instance'
import {
  ComponentPropOptions,
  ExtractPropTypes,
  getInitialProps,
  convertAttributeValue,
  validateProp,
} from './props'
import { hyphenate, camelize } from './utils'
import { Directive } from '../../template/src/directive'

export type Data = Record<string, unknown>

export type RenderFunction = () => ReturnType<H>

type Setup<Props, EventNames> = (
  props: Readonly<Props>,
  context: {
    emit: (event: EventNames, ...args: any[]) => void
  },
) => RenderFunction

type ComponentBaseOptions<Props, EventNames> = {
  name: string
  setup: Setup<Props, EventNames>
  directives?: Record<string, Directive>
  emits?: EventNames[]
  shadowRoot?: ShadowRootInit
  style?: string
}

type ComponentOptionsWithoutProps<
  EventNames extends string = string,
  Props = {}
> = ComponentBaseOptions<Props, EventNames> & { props?: undefined }

type ComponentOptionsWithProps<
  PropOptions = ComponentPropOptions,
  EventNames extends string = string,
  Props = ExtractPropTypes<PropOptions>
> = ComponentBaseOptions<Props, EventNames> & { props: PropOptions }

type ComponentOptions = ComponentOptionsWithProps | ComponentOptionsWithoutProps

export const enum Lifecycle {
  MOUNT = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATE = 'u',
  UNMOUNT = 'um',
}

export type AsyncHook = () => Promise<void>
export type SyncHook = () => void
export type Hook = AsyncHook | SyncHook

export type ComponentInstance<ExtractedProps = Data> = {
  isMounted: boolean
  props: ExtractedProps
  effects: ReactiveEffect[]
  [Lifecycle.MOUNT]: Hook[]
  [Lifecycle.BEFORE_UPDATE]: Hook[]
  [Lifecycle.UPDATE]: Hook[]
  [Lifecycle.UNMOUNT]: Hook[]
}

// Overload 1: no props
export function defineComponent<EventNames extends string>(
  options: ComponentOptionsWithoutProps<EventNames>,
): void

// Overload 2: props
export function defineComponent<
  EventNames extends string,
  // the Readonly constraint allows TS to treat the type of { required: true } as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropOptions>
>(options: ComponentOptionsWithProps<PropsOptions, EventNames>): void

export function defineComponent({
  name,
  setup,
  style,
  shadowRoot = { mode: 'open' },
  props = {},
  emits = [],
}: ComponentOptions) {
  const propsList = Object.keys(props)
  const hyphenatedPropsList = propsList.map(hyphenate)

  const instance: ComponentInstance = {
    isMounted: false,
    props: getInitialProps(props),
    effects: [],
    [Lifecycle.MOUNT]: [],
    [Lifecycle.BEFORE_UPDATE]: [],
    [Lifecycle.UPDATE]: [],
    [Lifecycle.UNMOUNT]: [],
  }

  class VuElement extends HTMLElement {
    static get observedAttributes() {
      return hyphenatedPropsList
    }

    connectedCallback() {
      setCurrentComponentInstance(instance)

      const emit = (event: string, ...args: any[]) => {
        if (emits.includes(event)) {
          const e = new CustomEvent(event, {
            bubbles: false,
            cancelable: false,
            detail: args,
          })
          this.dispatchEvent(e)
        }
      }

      const rawRenderFunction = setup(shallowReadonly(instance.props), { emit })

      const renderFunction: RenderFunction = !style
        ? rawRenderFunction
        : () => h`
					<style>${style}</style>
					${rawRenderFunction()}
				`

      setCurrentComponentInstance(null)

      const container = this.attachShadow(shadowRoot)

      watchEffect(() => {
        instance[Lifecycle.BEFORE_UPDATE].forEach((hook) => hook())

        render(renderFunction(), container)

        if (!instance.isMounted) {
          instance.isMounted = true
        }

        instance[
          instance.isMounted ? Lifecycle.UPDATE : Lifecycle.MOUNT
        ].forEach((hook) => hook())
      })
    }

    attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null,
    ) {
      const camelizedName = camelize(name)
      const prop = props[camelizedName]
      if (prop) {
        const convertedValue = convertAttributeValue(name, newValue, prop.type)
        if (__DEV__) {
          validateProp(camelizedName, convertedValue, prop, newValue == null)
        }
        instance.props[camelizedName] = convertedValue
      }
    }

    disconnectedCallback() {
      instance[Lifecycle.UNMOUNT].forEach((hook) => hook())
      instance.effects.forEach((effect) => stop(effect))
    }
  }

  // proxy props as Element properties
  propsList.forEach((key) => {
    Object.defineProperty(VuElement.prototype, key, {
      get() {
        return instance.props[key]
      },
      set(newValue) {
        if (__DEV__) {
          validateProp(key, newValue, props[key], newValue == null)
        }
        instance.props[key] = newValue
      },
      enumerable: false,
      configurable: true,
    })
  })

  customElements.define(name, VuElement)
}
