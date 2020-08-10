import { TemplateResult } from './html'
import { isPrimitive } from '../utils'

/* 5 = NodeFilter.SHOW_{ELEMENT|TEXT} */
export const createWalker = (x: Node) => document.createTreeWalker(x, 5, null, false)

export const isElement = (x: Node): x is Element => x.nodeType === 1

export const isTemplateResult = (x: unknown): x is TemplateResult =>
	!isPrimitive(x) && (x as any).type === 'template-result'


export const isIterable = (value: unknown): value is Iterable<unknown> =>
	Array.isArray(value) || !!(value && (value as any)[Symbol.iterator])