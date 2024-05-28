import { craeteVNode } from './vonde'

export function h(type, props?, children?) {
    return craeteVNode(type, props, children)
}