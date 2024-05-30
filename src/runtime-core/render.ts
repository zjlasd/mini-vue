import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vonde"

export function render(vnode, container) {
    //patch
    patch(vnode, container)
}

function patch(vnode, container) {
    const { type, shapeFlag } = vnode

    //Fragment =>只渲染children
    switch (type) {
        case Fragment:
            processFragement(vnode, container)
            break
        case Text:
            processText(vnode, container)
            break
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container)
            }
            break
    }
}

function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}

function processFragement(vnode, container) {
    mountChildren(vnode, container)
}

function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
    const el = (vnode.el = document.createElement(vnode.type))

    const { children, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
    }


    //props
    const { props } = vnode
    for (const key in props) {
        const val = props[key]

        const isOn = (key: string) => /^on[A-Z]/.test(key)
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }



    }
    container.append(el)

}


function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container)
    })
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode)

    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container)

    initialVnode.el = subTree.el
}




