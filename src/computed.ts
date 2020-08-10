import {
	computed as _computed,
	ComputedRef,
	WritableComputedOptions,
	ReactiveEffect,
	WritableComputedRef,
	ComputedGetter,
} from '@vue/reactivity'
import { getCurrentComponentInstance } from './instance'

// Record effects created during a component's setup() so that they can be
// stopped when the component unmounts
export function recordInstanceBoundEffect(effect: ReactiveEffect): void {
	const currentComponent = getCurrentComponentInstance()
	if (currentComponent) {
		currentComponent.effects.push(effect)
	}
}

export function computed<T>(getter: ComputedGetter<T>): ComputedRef<T>
export function computed<T>(
	options: WritableComputedOptions<T>
): WritableComputedRef<T>
export function computed<T>(
	getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
	const c = _computed(getterOrOptions as any)
	recordInstanceBoundEffect(c.effect)
	return c
}