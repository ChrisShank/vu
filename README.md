# Vu (NOT production ready)

> A Vue-esque Web Component library. 🎶

## Overview

Vu is a 5kb library that combines everything you love about [Vue 3's](https://v3.vuejs.org/) reactivity, template syntax, and Composition API, with an HTML template system inspired by [lit-html](https://lit-html.polymer-project.org/) and [uhtml](https://github.com/WebReflection/uhtml). All outputted as framework agnostic, spec-compliant [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

Our goal is to make a smaller alternative to Vue (hopefully half the size 🤞) with a _compatible_ API while making sure that your components are not locked into one framework. A benefit of using a template library similar to `lit-html` is that the is no overhead of the Virtual DOM and we are able to get _similar_ static template analysis as Vue 3's template complier, all with a smaller and quicker implementation.

A couple of ways that we are try to stay small and quick is by:

1. Removing unnecessary parts of Vue 3's API such as the Options API, mixins, ect.
2. Writing our own template library that is smaller and quicker than `lit-html`.
3. Ensure great DX such as templating and encapsulated styles without and build process necessary.
4. Binding directly to web component lifecycle hooks rather than creating our own.

### Why output web components?

In their current form, web components should not be seen as a replacement to JS frameworks/libraries but rather as an framework agnostic output target that makes it possible to interop Vu components with any other library or framework. Binding directly to web component lifecycle hooks rather than creating our own reduces bundle size. The ShadowDOM also provides style encapsulation without the need for a build step that is necessary for Vue Single File Components (SFCs).

### Why model Vu after Vue?

- Vue 3 exposes a low-level reactivity package called `@vue/reactivity`
- Inspired by Preact and HTM, I feel that it would awesome for a Vue-esque library to compete with Preact
- Without getting too ideological, there is something that I very much like about Vue's mental model. See Rich Harris's [talk](https://docs.google.com/presentation/d/1PUvpXMBEDS45rd0wHu6tF3j_8wmGC6cOLtOw2hzU-mw/edit#slide=id.g60d3ee4d75_0_183) since he has explained it better!

### Why use tagged template literals, but not use lit-html directly?

- [Tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) allow the flexibility and power of render functions in a easy to read template language without a virtual DOM
- Allow similar performance to Vue 3's statically analyzed templates in a much smaller package
- Align with Vue 3's template syntax and directives
- lit-html is more generic, but this comes at the cost of bundle size

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
    const decrement = () => count.value--
    const increment = () => count.value++

    return () => h`
      <button @click=${decrement}>-</button>
      <div>${count}</div>
      <button @click=${increment}>+</button>
    `
  },
  style: `
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
  `,
})
```
