# Vu

> A Vue-esque Web Component library. 🎶

## Overview

Vu is a 5kb library that combines everything you love about [Vue 3's](https://v3.vuejs.org/) reactivity, template syntax, and Composition API, with an HTML template library inspired by [lit-html](https://lit-html.polymer-project.org/). All outputted as a framework agnostic, spec-compliant [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

Our goal is to make a smaller alternative to Vue (hopefully half the size 🤞) with the _same_ API while making sure that your components are locked into one framework. A benefit of using a template library similar to `lit-html` is that the is no overhead of the Virtual DOM and we are able to get _similar_ static template analysis as Vue 3's template complier, all with smaller and quicker solution. A couple of ways that we are try to stay small and quick is by:

1. Removing unnecessary parts of Vue 3's API such as the Options API, mixins, ect.
2. Writing our own template library that is be smaller and quicker than `lit-html`.
3. Ensure great DX such as templating and encapsulated styles without and build process necessary.
4. Binding directly to web component lifecycle hooks rather than creating our own.

### Why output web components?

In their current form, web components should not be seen as a replacement to JS frameworks/libraries but rather as an framework agnostic output target that makes it possible to interop Vu components with any other library or framework. Binding directly to web component lifecycle hooks rather than creating our own reduces bundle size. The ShadowDOM also provides style encapsulation without the need for a build step that is necessary for Vue Single File Components (SFCs).

### Why model Vu after Vue?

### Why use tagged template literals, but not use lit-html directly?

## Installation

```bash
# Setup Vite (dev server and bundler)
$ yarn create vite-app vu-app

$ cd vu-app

# Remove Vue dependencies
$ yarn remove vue @vue/sfc-compiler

# Add Vu
$ yarn add @vu/component
```

```html
<!-- index.html -->
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vu App</title>
  </head>

  <body>
    <vu-counter></vu-counter>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```ts
// src/main.ts

import { defineComponent, h, ref } from '@vu/component'

defineComponent({
	name: 'vu-counter',
	setup() {
		const count = ref(0)
		const decrement = () count.value--
		const increment = () count.value++

		return () => h`
			<button @click="decrement">-</button>
			<div>${count}</div>
			<button @click="increment">+</button>
		`
	}
})
```
