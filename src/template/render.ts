import { TemplateResult } from './html'
import { RenderOptions, NodePart, createNodePart } from './part'


const renders = new WeakMap<Node, NodePart>()

export function render(
	result: TemplateResult,
	container: Node,
	options: RenderOptions = {}
) {
	let nodePart = renders.get(container)
	if (!nodePart) {
		removeNodes(container)
		renders.set(
			container,
			nodePart = createNodePart(container, 0, options)
		)
	}
	nodePart.commit(result)
}

function removeNodes(node: Node) {
	while (node.firstChild) {
		if (node.lastChild) {
			node.removeChild(node.lastChild)
		}
	}
}

