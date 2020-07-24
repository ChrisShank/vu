import { InternalComponent } from "./component"

let currentComponent: InternalComponent | null = null

export function getCurrentComponent(): InternalComponent | null {
	return currentComponent
}

export function setCurrentComponent(component: InternalComponent | null) {
	currentComponent = component
}