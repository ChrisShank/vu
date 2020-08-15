import { defineComponent, h } from '@vu/component'

defineComponent({
  name: 'foo',
  setup: () => () => h`hello world`,
})
