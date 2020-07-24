import { getCurrentComponent } from "./instance"
import { Lifecycle, Hook } from "./component"

function injectHook(lifecycle: Lifecycle, hook: Hook) {
	const currentComponent = getCurrentComponent()

	if (currentComponent) {
		currentComponent[lifecycle].push(hook)
	}
}

export const onBeforeMounted = (hook: Hook) => injectHook(Lifecycle.BEFORE_MOUNT, hook)
export const onMounted = (hook: Hook) => injectHook(Lifecycle.MOUNT, hook)
export const onBeforeUpdate = (hook: Hook) => injectHook(Lifecycle.BEFORE_UPDATE, hook)
export const onUpdate = (hook: Hook) => injectHook(Lifecycle.UPDATE, hook)
export const onBeforeUnmounted = (hook: Hook) => injectHook(Lifecycle.BEFORE_UNMOUNT, hook)
export const onUnmounted = (hook: Hook) => injectHook(Lifecycle.UNMOUNT, hook)