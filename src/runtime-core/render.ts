import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vonde"
import { createAppAPI } from "./createApp"


export function createRender(options) {
    const { createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert }
        = options


    function render(vnode, container, parentComponent) {
        //patch
        patch(vnode, container, parentComponent)
    }

    function patch(vnode, container, parentComponent) {
        const { type, shapeFlag } = vnode

        //Fragment =>只渲染children
        switch (type) {
            case Fragment:
                processFragement(vnode, container, parentComponent)
                break
            case Text:
                processText(vnode, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break
        }
    }

    function processText(vnode, container) {
        const { children } = vnode
        const textNode = (vnode.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragement(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { children, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }


        //props
        const { props } = vnode
        for (const key in props) {
            const val = props[key]

            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }

            hostPatchProp(el, key, val)

        }
        // container.append(el)
        hostInsert(el, container)
    }


    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent)
        })
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance, initialVnode, container) {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        patch(subTree, container, instance)

        initialVnode.el = subTree.el
    }

    return {
        createApp: createAppAPI(render)
    }

}

