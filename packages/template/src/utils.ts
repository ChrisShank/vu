import { isObject } from '@vu/shared'
import { TemplateResult } from './h'

/* 5 = NodeFilter.SHOW_{ELEMENT|TEXT} */
export const createWalker = (x: Node) =>
  document.createTreeWalker(x, 5, null, false)

export const isElement = (x: Node): x is Element => x.nodeType === 1

export const isTemplateResult = (x: unknown): x is TemplateResult =>
  isObject(x) && (x as any).type === 'template-result'
