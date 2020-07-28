import { render, html as h, svg } from 'lit-html'
import { ReactiveEffect, stop, shallowReadonly, shallowReactive } from '@vue/reactivity'
import { watchEffect } from './watch'
import { setCurrentComponent } from './instance'
import { ComponentPropOptions, ExtractPropTypes, getInitialProps, convertAttributeValue, validateProp } from './props'
import { hyphenate, camelize } from './utils'
import { __DEV__ } from './constants'

export type Data = Record<string, unknown>

export { h, svg }

export type H = typeof h | typeof svg

export type RenderFunction = () => ReturnType<H>

type Setup<Props, EventNames> = (
	props: Readonly<Props>,
	emit: (event: EventNames, ...args: any[]) => void
) => RenderFunction

type ComponentBaseOptions<Props, EventNames> = {
	name: string
	setup: Setup<Props, EventNames>
	emits?: EventNames[]
	shadow?: ShadowRootInit,
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
	isMounted: boolean,
	props: ExtractedProps
	effects: ReactiveEffect[]
	[Lifecycle.MOUNT]: Hook[]
	[Lifecycle.BEFORE_UPDATE]: Hook[]
	[Lifecycle.UPDATE]: Hook[]
	[Lifecycle.UNMOUNT]: Hook[]
}

// Overload 1: no props
export function defineComponent<
	EventNames extends string
>(options: ComponentOptionsWithoutProps<EventNames>): void

// Overload 2: props
export function defineComponent<
	EventNames extends string,
	// the Readonly constraint allows TS to treat the type of { required: true } as constant instead of boolean.
	PropsOptions extends Readonly<ComponentPropOptions>
>(options: ComponentOptionsWithProps<PropsOptions, EventNames>): void

export function defineComponent(options: ComponentOptions) {
	const { name, setup, style, shadow = {}, props = {}, emits = [] } = options
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
			setCurrentComponent(instance)

			let rawRenderFunction = setup(
				shallowReadonly(instance.props!),
				(event: string, args: any[]) => {
					if (emits.includes(event)) {
						const e = new CustomEvent(event, { bubbles: false, cancelable: false, detail: args })
						this.dispatchEvent(e)
					}
				},
			)

			let renderFunction: RenderFunction
			if (style) {
				renderFunction = () => h`
					<style>${style}</style>
					${rawRenderFunction()}
				`
			} else {
				renderFunction = rawRenderFunction
			}

			setCurrentComponent(null)

			const container = this.attachShadow({ mode: 'open', ...shadow })

			watchEffect(() => {
				instance[Lifecycle.BEFORE_UPDATE].forEach(hook => hook())

				render(renderFunction(), container)

				if (!instance.isMounted) {
					instance.isMounted = true
				}

				instance[instance.isMounted ? Lifecycle.UPDATE : Lifecycle.MOUNT].forEach(hook => hook())
			})
		}

		attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
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
			instance[Lifecycle.UNMOUNT].forEach(hook => hook())
			instance.effects.forEach(effect => stop(effect))
		}
	}

	// proxy props as Element properties
	propsList.forEach(key => {
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
			configurable: true
		})
	})

	customElements.define(name, VuElement)
}
