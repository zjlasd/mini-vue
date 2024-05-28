import { render } from "./render"
import { craeteVNode } from "./vonde"

export function createApp(rootComponent) {
    return {
        mount(rootComponent) {
            const vnode = craeteVNode(rootComponent)

            render(vnode, rootComponent)
        }
    }
}