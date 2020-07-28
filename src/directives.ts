import { directive, Part, AttributePart, BooleanAttributePart } from 'lit-html'
import { Ref } from '@vue/reactivity'

export const model = directive((ref: Ref<unknown>) => (part: Part) => {
	if (part instanceof AttributePart) {
		const name = part.committer.name
		const el = part.committer.element
		el.addEventListener(`update:${name}`, (e: CustomEventInit<any[]>) => {
			if (e.detail) {
				ref.value = e.detail[0]
			}
		})
		part.setValue(ref.value)
	}
	console.log(ref, part)
})