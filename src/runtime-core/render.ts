import { EMPTY_OBJ, isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vonde"
import { createAppAPI } from "./createApp"
import { effect } from "../reactivity/effect"


export function createRender(options) {
    const { createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElemnetText

    }
        = options


    function render(vnode, container) {
        //patch
        patch(null, vnode, container, null)
    }
    //n1:old n2:new
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2

        //Fragment =>只渲染children
        switch (type) {
            case Fragment:
                processFragement(n1, n2, container, parentComponent)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break
        }
    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragement(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processElement(n1, n2: any, container: any, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container,parentComponent)
        }

    }

    function patchElement(n1, n2, container,parentComponent) {

        console.log(n1)
        console.log(n2)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el,parentComponent)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container,parentComponent) {
        const prevShapeFlag = n1.shapeFlag
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                //清空旧的
                unmountChildren(n1.children)
            }
            if (c1 !== c2) {
                hostSetElemnetText(container, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElemnetText(container, "")
                mountChildren(c2,container,parentComponent)
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            //remove
            hostRemove(el)
        }
    }


    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]

                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }

        }
    }

    function mountElement(vnode: any, container: any, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { children, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent)
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

            hostPatchProp(el, key, null, val)

        }
        // container.append(el)
        hostInsert(el, container)
    }


    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent)
        })
    }

    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container)
    }

    function setupRenderEffect(instance, initialVnode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init')
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                patch(null, subTree, container, instance)

                initialVnode.el = subTree.el
                instance.isMounted = true
            }
            else {
                console.log('update')
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree, subTree, container, instance)
            }

        })

    }

    return {
        createApp: createAppAPI(render)
    }

}

