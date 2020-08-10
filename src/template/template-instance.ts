import { createWalker } from './utils'
import { TemplatePart } from './html'
import { Part, RenderOptions, createNodePart, createAttributePart } from './part'

export type TemplateInstance = {
	node: Node
	parts: Part[]
}

export function instantiateTemplate(
	template: HTMLTemplateElement,
	templateParts: TemplatePart[],
	options: RenderOptions,
): TemplateInstance {
	const canUpgradeCE = !!customElements.upgrade
	const parts: Part[] = []

	const content: Node = canUpgradeCE
		? template.content.cloneNode(true)
		: document.importNode(template.content, true)

	const walker = createWalker(content)
	let nodeIndex = 0
	let partIndex = 0
	let node = walker.nextNode()
	let part: TemplatePart


	while (partIndex < templateParts.length) {
		part = templateParts[partIndex]

		// Progress the tree walker until we find our next part's node.
		// Note that multiple parts may share the same node (attribute parts
		// on a single element), so this loop may not run at all.
		while (nodeIndex < part.nodeIndex) {
			nodeIndex++
			node = walker.nextNode()
		}

		if (part.type === 'node') {
			parts.push(createNodePart(node!.parentNode!, part.childIndex, options))
		} else if (part.type === 'attribute') {
			if (part.directive) {

			} else {
				parts.push(createAttributePart(node! as Element, part.name))
			}
		}
		partIndex++
	}

	if (canUpgradeCE) {
		document.adoptNode(content)
		customElements.upgrade(content)
	}

	return { node: content, parts }
}