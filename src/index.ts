export { defineComponent, h, svg } from './component'
export { computed } from './computed'
export { model } from './directives'
export { onMounted, onBeforeUpdate, onUpdate, onUnmounted } from './lifecycle'
export { watch, watchEffect } from './watch'

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

export { directive, nothing } from 'lit-html'

export { cache } from 'lit-html/directives/cache'
export { classMap } from 'lit-html/directives/class-map'
export { guard } from 'lit-html/directives/guard'
export { ifDefined as if } from 'lit-html/directives/if-defined'
export { repeat as for } from 'lit-html/directives/repeat'
export { styleMap } from 'lit-html/directives/style-map'
