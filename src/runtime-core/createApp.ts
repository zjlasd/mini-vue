import { render } from "./render"
import { createVNode } from "./vonde"

export function createApp(rootComponent) {
    console.log(rootComponent,111)
    return {
        mount(rootContainer) {
            console.log(rootComponent)
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
}
