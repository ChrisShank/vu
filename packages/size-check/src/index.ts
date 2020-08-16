import { defineComponent, h } from '@vu/component'

defineComponent({
  name: 'hello-world',
  setup: () => () => h`hello world`,
})
