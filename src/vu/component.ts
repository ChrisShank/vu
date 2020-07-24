import { render, html, svg } from 'lit-html'
import { ReactiveEffect, stop, shallowReadonly, shallowReactive } from '@vue/reactivity'
import { watchEffect } from './watch'
import { setCurrentComponent } from './instance'
import { __DEV__ } from './constants'

export { html as h, svg }

export type H = typeof html

export type RenderFunction = (h: H) => ReturnType<H>

type Props<PropNames> = PropNames extends string ? Record<PropNames, string> : {}

type Setup<PropNames, EventNames> = (
	props: Readonly<Props<PropNames>>,
	emit: (event: EventNames, payload: any) => void
) => RenderFunction

export type ComponentOptions<PropNames, EventNames> = {
	name: string
	setup: Setup<PropNames, EventNames>
	emits?: EventNames[]
	props?: PropNames[]
	shadow?: ShadowRootInit
}

export const enum Lifecycle {
	BEFORE_MOUNT = 'bm',
	MOUNT = 'm',
	BEFORE_UPDATE = 'bu',
	UPDATE = 'u',
	BEFORE_UNMOUNT = 'bum',
	UNMOUNT = 'um',
}

export type Hook = () => (void | Promise<void>)

export type ComponentInstance<Props> = {
	isMounted: boolean,
	props?: Props
	effects: ReactiveEffect[]
	[Lifecycle.BEFORE_MOUNT]: Hook[]
	[Lifecycle.MOUNT]: Hook[]
	[Lifecycle.BEFORE_UPDATE]: Hook[]
	[Lifecycle.UPDATE]: Hook[]
	[Lifecycle.BEFORE_UNMOUNT]: Hook[]
	[Lifecycle.UNMOUNT]: Hook[]
}

export function defineComponent<PropNames extends string, EventNames extends string>(
	options: ComponentOptions<PropNames, EventNames>
) {
	const { name, setup, shadow = {}, props = [], emits = [] } = options

	const instance: ComponentInstance<Props<PropNames>> = {
		isMounted: false,
		props: undefined,
		effects: [],
		[Lifecycle.BEFORE_MOUNT]: [],
		[Lifecycle.MOUNT]: [],
		[Lifecycle.BEFORE_UPDATE]: [],
		[Lifecycle.UPDATE]: [],
		[Lifecycle.BEFORE_UNMOUNT]: [],
		[Lifecycle.UNMOUNT]: [],
	}

	class VuElement extends HTMLElement {
		static get observedAttributes() {
			return props
		}

		constructor() {
			super()

			const rawProps: Props<PropNames> = props.reduce((acc, prop) => {
				acc[prop] = this.getAttribute(prop) || this[prop as string]
				return acc
			}, {} as Props<PropNames>)

			instance.props = shallowReactive(rawProps)

			// TODO: create proxy to observe property changes
			// return new Proxy(this, {
			// 	get(target, name, reciever) {

			// 	}
			// })
		}

		connectedCallback() {
			setCurrentComponent(instance)

			const renderFunction = setup(
				(__DEV__ ? shallowReadonly(instance.props) : instance.props) as Readonly<Props<PropNames>>,
				(event: EventNames, payload: any) => {
					if (emits.includes(event)) {
						const e = new CustomEvent(event, { detail: payload })
						this.dispatchEvent(e)
					}
				},
			)

			setCurrentComponent(null)

			const container = this.attachShadow({ mode: 'open', ...shadow })

			watchEffect(() => {
				instance[instance.isMounted ? Lifecycle.BEFORE_UPDATE : Lifecycle.BEFORE_MOUNT].forEach(hook => hook())

				render(renderFunction(html), container)

				if (!instance.isMounted) {
					instance.isMounted = true
				}

				instance[instance.isMounted ? Lifecycle.UPDATE : Lifecycle.MOUNT].forEach(hook => hook())
			})
		}

		attributeChangedCallback(name: string, oldValue, newValue) {
			if (instance.isMounted && props.includes(name as PropNames)) {
				instance.props[name as PropNames] = newValue
			}
		}

		disconnectedCallback() {
			instance[Lifecycle.BEFORE_UNMOUNT].forEach(hook => hook())
			instance.effects.forEach(effect => stop(effect))
			instance[Lifecycle.UNMOUNT].forEach(hook => hook())
		}
	}

	customElements.define(name, VuElement)
}
