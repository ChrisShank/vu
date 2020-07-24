import { defineComponent, h, ref } from './vu'

defineComponent({
	name: 'my-counter',
	setup() {
		const count = ref(0)

		return () => h`
			<style>
				* {
					font-size: 200%;
				}

				span {
					width: 4rem;
					display: inline-block;
					text-align: center;
				}

				button {
					width: 64px;
					height: 64px;
					border: none;
					border-radius: 10px;
					background-color: seagreen;
					color: white;
				}
			</style>
			<button @click=${() => count.value--}>-</button>
			<span>${count.value}</span>
			<button @click=${() => count.value++}>+</button>
		`
	}
})
