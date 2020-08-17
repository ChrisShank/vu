import { TemplateResult } from './h'
import { Directive } from './directive'
import { NodePart, createNodePart } from './part'

export type RenderOptions = Partial<{
  directives: Record<string, Directive>
}>

const renders = new WeakMap<Node, NodePart>()

export function render(
  result: TemplateResult,
  container: Node,
  options: RenderOptions = {},
) {
  let nodePart = renders.get(container)

  if (!nodePart) {
    removeNodes(container)
    renders.set(container, (nodePart = createNodePart(container, 0, options)))
  }

  nodePart.commit(result)
}

function removeNodes(node: Node) {
  while (node && node.firstChild) {
    if (node.lastChild) {
      node.removeChild(node.lastChild)
    }
  }
}
