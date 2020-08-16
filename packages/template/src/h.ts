import { createWalker, isElement } from './utils'
import { DirectiveModifiers } from './directive'

export type TemplatePart = NodePart | AttributePart | DirectivePart

export type NodePart = {
  type: 'node'
  nodeIndex: number
  childIndex: number
}

type ExtractedDirective = Pick<DirectivePart, 'name' | 'arg' | 'modifiers'>

export type DirectivePart = {
  type: 'directive'
  name: string
  modifiers: DirectiveModifiers
  arg?: string
  nodeIndex: number
}

export type AttributePart = {
  type: 'attribute'
  name: string
  nodeIndex: number
}

type ParsedTemplate = {
  template: HTMLTemplateElement
  parts: TemplatePart[]
}

export type TemplateResult = ParsedTemplate & {
  type: 'template-result'
  values: unknown[]
}

const parsedTemplates = new Map<TemplateStringsArray, ParsedTemplate>()

export function h(
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult {
  let parsedTemplate = parsedTemplates.get(strings)

  if (!parsedTemplate) {
    parsedTemplate = parseTemplate(strings, values)
    parsedTemplates.set(strings, parsedTemplate)
  }

  return {
    type: 'template-result',
    values,
    ...parsedTemplate,
  }
}

const uuid = String(Math.random()).slice(2)
const markerRegex = RegExp(`{{vu-${uuid}-(\\d+)}}`, 'g')
const markerSplitRegex = RegExp(`({{vu-${uuid}-\\d+}})`, 'g')
const createMarker = (i: number) => `{{vu-${uuid}-${i}}}`

function parseTemplate(
  strings: TemplateStringsArray,
  values: unknown[],
): ParsedTemplate {
  const l = strings.length - 1
  let content = ''

  for (let i = 0; i < l; i++) {
    content += strings[i] + createMarker(i)
  }
  content += strings[l]

  const template = document.createElement('template')
  template.innerHTML = content
  const parts = generateParts(template, values.length)
  return { parts, template }
}

function generateParts(
  template: HTMLTemplateElement,
  numberOfParts: number,
): TemplatePart[] {
  let nodeIndex: number = -1
  const parts: TemplatePart[] = []
  const nodesToRemove: Set<Node> = new Set()
  const walker = createWalker(template.content)

  while (parts.length <= numberOfParts) {
    const node = walker.nextNode() as Element | Comment | Text | null
    if (!node) {
      // error
      break
    }

    nodeIndex++

    if (isElement(node)) {
      if (node.hasAttributes()) {
        // We are not guarenteed the same order that attributes were added
        const length = node.attributes.length
        // Shallow copy of attributes since we are removing them
        const attributes = { ...node.attributes }
        const attributeParts: (AttributePart | DirectivePart)[] = []
        for (let i = 0; i < length; i++) {
          const { value, name } = attributes[i]
          const matches = [...value.matchAll(markerRegex)]

          if (matches.length === 1) {
            const partIndex = parseInt(matches[0][1]) - parts.length

            attributeParts[partIndex] = isDirective(name)
              ? { type: 'directive', nodeIndex, ...extractDirective(name) }
              : { type: 'attribute', name, nodeIndex }

            node.removeAttribute(name)
          } else if (__DEV__ && matches.length > 1) {
            throw new Error(`Attribute ${name} can only be interpolated once.`)
          }
        }
        // sort attributes and push to parts
        parts.push(...attributeParts)
      }
    } else {
      const { data } = node
      if (markerRegex.test(data)) {
        const strings = data.split(markerSplitRegex)

        for (let i = 0; i < strings.length; i++) {
          const string = strings[i]
          if (markerRegex.test(string)) {
            parts.push({
              type: 'node',
              nodeIndex: ++nodeIndex,
              childIndex: i,
            })
          } else {
            const parent = node.parentNode!
            parent.insertBefore(document.createTextNode(string), node)
            nodesToRemove.add(node)
          }
        }
      }
    }
  }

  // Remove text binding nodes after the walk to not disturb the TreeWalker
  for (const node of nodesToRemove) {
    node.parentNode!.removeChild(node)
  }

  return parts
}

const directiveShorthands: Record<string, string> = {
  ':': 'bind',
  '@': 'on',
}

const isDirective = (name: string) => /^(v-|:|@|#)/.test(name)

const directiveRegex = (name: string) =>
  /(?:^v-([a-z0-9-]+))?(?:(?::|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(name)

function extractDirective(name: string): ExtractedDirective {
  const [
    ,
    dirName = directiveShorthands[name[0]],
    arg,
    modifiers,
  ] = directiveRegex(name)!

  return {
    name: dirName,
    arg,
    modifiers: modifiers ? extractDirectiveModifiers(modifiers) : {},
  }
}

function extractDirectiveModifiers(modifiers: string): DirectiveModifiers {
  return modifiers
    .substr(1)
    .split('.')
    .reduce((acc, modifier) => {
      acc[modifier] = true
      return acc
    }, {} as DirectiveModifiers)
}
