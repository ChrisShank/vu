import { defineComponent, h, ref, render } from '/vu/'
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

// const div = (style: string = '', disabled: boolean = false) => h`
// 	<div disabled=${disabled} style=${style}>Hello World</div>
// `

// render(div('background: red; padding: 15px', true), document.body)

// setTimeout(() => render(div(), document.body), 2000)
