import { TemplateResult } from './h'
import { instantiateTemplate } from './template-instance'
import { DirectiveModifiers } from './directive'
import { isTemplateResult } from './utils'
import { RenderOptions } from './render'

export type Part = {
  type: 'node' | 'attribute' | 'property' | 'event' | 'directive'
  commit(value: unknown): void
}

export type NodePart = Part & { type: 'node' }

export type AttributePart = Part & { type: 'attribute' }

export type EventPart = Part & { type: 'event' }

export type PropertyPart = Part & { type: 'property' }

export function createNodePart(
  container: Node,
  childIndex: number,
  options: RenderOptions,
): NodePart {
  let currentValue: unknown
  let currentNode: Node
  let parts: Part[] = []

  function commitTemplate(result: TemplateResult) {
    if (currentNode === undefined) {
      const instance = instantiateTemplate(
        result.template,
        result.parts,
        options,
      )
      currentNode = instance.node
      parts = instance.parts
      appendNode(container, currentNode, childIndex)
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const value = result.values[i]
      part.commit(value)
    }
  }

  function commitText(value: unknown) {
    value = typeof value === 'string' ? value : String(value)

    if (currentNode !== undefined) {
      currentNode.nodeValue = value as string
    } else {
      appendNode(
        container,
        (currentNode = document.createTextNode(value as string)),
        childIndex,
      )
    }
  }

  return {
    type: 'node',
    commit(value: unknown) {
      if (value === currentValue) {
        return
      }

      isTemplateResult(value) ? commitTemplate(value) : commitText(value) // value is a primitive or unknown

      currentValue = value
    },
  }
}

export function createAttributePart(
  element: Element,
  name: string,
): AttributePart {
  let currentValue: unknown

  return {
    type: 'attribute',
    commit(value: unknown) {
      if (value === currentValue) {
        return
      }

      if (typeof value === 'boolean') {
        value ? element.setAttribute(name, '') : element.removeAttribute(name)
      } else {
        value = typeof value === 'string' ? value : String(value)
        element.setAttribute(name, value as string)
      }

      currentValue = value
    },
  }
}

type Handler = (e: Event) => void | null | undefined

const isHandler = (handler: unknown): handler is Handler =>
  handler == null || typeof handler === 'function'

export function createEventPart(
  element: Element,
  name: string,
  modifiers: DirectiveModifiers,
): EventPart {
  let currentValue: (e: Event) => void | null | undefined
  const options: AddEventListenerOptions = {
    capture: modifiers.capture,
    passive: modifiers.passive,
    once: modifiers.once,
  }

  return {
    type: 'event',
    commit(value: unknown) {
      if (value === currentValue) {
        return
      }

      if (!isHandler(value)) {
        if (__DEV__) {
          console.warn(
            `Handler for event ${name} is not a function or a reference to a function.`,
          )
        }
        return
      }

      if (currentValue != null) {
        element.removeEventListener(name, currentValue, options)
      }

      if (value != null) {
        element.addEventListener(name, value, options)
      }

      currentValue = value
    },
  }
}

export function createPropertyPart(
  element: Element,
  name: string,
): PropertyPart {
  let currentValue: unknown

  return {
    type: 'property',
    commit(value: unknown) {
      if (value === currentValue) {
        return
      }

      ;(element as any)[name] = value
    },
  }
}

function appendNode(container: Node, child: Node, index: number) {
  if (index < container.childNodes.length) {
    container.insertBefore(child, container.childNodes[index])
  } else {
    container.appendChild(child)
  }
}
