export { defineComponent, h, svg } from './component'
export { computed } from './computed'
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

export { directive } from 'lit-html'

export { asyncReplace } from 'lit-html/directives/async-replace'
export { asyncAppend } from 'lit-html/directives/async-append'
export { cache } from 'lit-html/directives/cache'
export { classMap } from 'lit-html/directives/class-map'
export { guard } from 'lit-html/directives/guard'
export { ifDefined } from 'lit-html/directives/if-defined'
export { repeat } from 'lit-html/directives/repeat'
export { styleMap } from 'lit-html/directives/style-map'
export { until } from 'lit-html/directives/until'
