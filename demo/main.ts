import { defineComponent, h, ref, model } from '/vu/'

defineComponent({
	name: 'my-button',
	props: {
		count: { type: Number, required: true },
	},
	emits: ['update:count'],
	setup(props, { emit }) {
		const click = () => emit('update:count', props.count + 1)

		return () => h`<button @click=${click}>${props.count}</button>`
	},
})

defineComponent({
	name: 'my-counter',
	setup() {
		const count = ref(0)
		const increment = () => count.value++
		const decrement = () => count.value--

		return () => h`
			<my-button count="${model(count)}"></my-button>
		`
	},
})
