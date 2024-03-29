import { h } from '../src/h'

it('should contain no parts', () => {
  const result = h`<div></div>`
  expect(result.parts.length).toBe(0)
  expect(result.values.length).toBe(0)
  expect(result.template.content.childNodes[0]).toBeDefined()
  expect(result.template.content.childNodes[0].nodeName).toBe('DIV')
})

it('should contain one node part', () => {
  const { parts, values, template } = h`<div>${'Hello'}</div>`
  expect(parts.length).toBe(1)
  expect(parts[0]).toMatchObject({
    type: 'node',
    nodeIndex: 2,
    childIndex: 1,
  })
  expect(values.length).toBe(1)
  expect(values[0]).toBe('Hello')
  expect(template.content.childNodes[0]).toBeDefined()
  expect(template.content.childNodes[0].nodeName).toBe('DIV')
})

it('should return matching template results', () => {
  const render = (str: string) => h`<div>${str}</div>`
  expect(render('foo')).toMatchObject(render('foo'))
  expect(render('foo').parts).toBe(render('bar').parts)
  expect(render('foo').template).toBe(render('bar').template)
})

it('should contain a v-on directive part', () => {
  const handler = () => {}
  const { parts, values, template } = h`<div @click=${handler}></div>`
  expect(parts.length).toBe(1)
  expect(parts[0]).toMatchObject({
    type: 'directive',
    name: 'on',
    arg: 'click',
    modifiers: {},
    nodeIndex: 0,
  })
  expect(values.length).toBe(1)
  expect(values[0]).toBe(handler)
  expect(template.content.childNodes[0]).toBeDefined()
  expect(template.content.childNodes[0].nodeName).toBe('DIV')
})
