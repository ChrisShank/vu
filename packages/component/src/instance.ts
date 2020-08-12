import { ComponentInstance } from './component'

let currentComponentInstance: ComponentInstance | null = null

export function getCurrentComponentInstance(): ComponentInstance | null {
  return currentComponentInstance
}

export function setCurrentComponentInstance(component: ComponentInstance | null) {
  currentComponentInstance = component
}
