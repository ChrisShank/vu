import { TemplateResult } from './html'
import { instantiateTemplate } from './template-instance'
import { Directive } from './directive'
import { isTemplateResult } from './utils'
import { isPrimitive } from '../utils'
import { __DEV__ } from '../constants'

export type RenderOptions = Partial<{
	directives: Directive[]
}>

export type Part = {
	type: 'node' | 'attribute' | 'directive'
	commit(value: unknown): void
}

export type NodePart = Part & { type: 'node' }

export type AttributePart = Part & { type: 'attribute' }

export function createNodePart(
	container: Node,
	childIndex: number,
	options: RenderOptions,
): NodePart {
	let currentValue: unknown
	let currentNode: Node
	let parts: Part[] = []

	function commitTemplate(result: TemplateResult) {
		if (!currentNode) {
			const instance = instantiateTemplate(result.template, result.parts, options)
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
		console.log(value)

		if (currentNode) {
			container.removeChild(currentNode)
		}

		appendNode(
			container,
			currentNode = document.createTextNode(value as string),
			childIndex,
		)
	}

	return {
		type: 'node',
		commit(value: unknown) {
			if (value === currentValue) {
				return
			}

			if (isPrimitive(value)) {
				commitText(value)
			} else if (isTemplateResult(value)) {
				commitTemplate(value)
			} else {
				commitText(value)
			}

			currentValue = value
		},
	}
}

export function createAttributePart(element: Element, name: string): AttributePart {
	let currentValue: unknown

	return {
		type: 'attribute',
		commit(value: unknown) {
			if (value === currentValue) {
				return
			}

			if (isPrimitive(value)) {
				if (typeof value === "boolean") {
					if (value) {
						element.setAttribute(name, '')
					} else {
						element.removeAttribute(name)
					}
				} else {
					value = typeof value === 'string' ? value : String(value)
					element.setAttribute(name, value as string)
				}

				value = currentValue
			}
		}
	}
}

function appendNode(container: Node, child: Node, index: number) {
	if (index < container.childNodes.length) {
		container.insertBefore(child, container.childNodes[index])
	} else {
		container.appendChild(child)
	}
}