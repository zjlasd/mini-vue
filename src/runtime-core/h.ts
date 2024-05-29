import { createVNode } from './vonde'

export function h(type, props?, children?) {
    return createVNode(type, props, children)
}