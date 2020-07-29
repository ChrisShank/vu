import { defineComponent, h, ref } from '/vu/'

defineComponent({
	name: 'my-counter',
	setup() {
		const count = ref(0)
		const increment = () => count.value++
		const decrement = () => count.value--

		return () => h`
			<button @click=${decrement}>-</button>
			<span>${count.value}</span>
			<button @click=${increment}>+</button>
		`
	},
})
