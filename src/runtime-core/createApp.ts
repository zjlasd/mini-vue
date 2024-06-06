// import { render } from "./render"
import { createVNode } from "./vonde"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
    console.log(rootComponent,111)
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
}
}


