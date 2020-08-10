export { defineComponent, } from './component'
export { computed } from './computed'
export { onMounted, onBeforeUpdate, onUpdate, onUnmounted } from './lifecycle'
export { watch, watchEffect } from './watch'

export { h, render } from './template'

export {
	// Core
	reactive,
	readonly,
	ref,

	// Utilities
	isProxy,
	isReactive,
	isReadonly,
	isRef,
	toRef,
	toRefs,
	unref,

	// Advanced
	shallowRef,
	shallowReactive,
	shallowReadonly,
} from '@vue/reactivity'
