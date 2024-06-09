import { EMPTY_OBJ, isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"
import { ShapeFlags } from "../shared/ShapeFlags"
import { Fragment, Text } from "./vonde"
import { createAppAPI } from "./createApp"
import { effect } from "../reactivity/effect"
import { shouldUpdateComponent } from "./componentUpdateUtils"
import { queueJobs } from "./scheduler"


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
        patch(null, vnode, container, null, null)
    }
    //n1:old n2:new
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2

        //Fragment =>只渲染children
        switch (type) {
            case Fragment:
                processFragement(n1, n2, container, parentComponent, anchor)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break
        }
    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }

    function processFragement(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }

    }

    function patchElement(n1, n2, container, parentComponent, anchor) {

        console.log(n1)
        console.log(n2)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, container, parentComponent, anchor) {
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
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                //array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l2 = c2.length
        let i = 0;
        let e1 = c1.length - 1
        let e2 = l2 - 1

        function isSomeVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key
        }
        //1.左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }
            i++;
        }

        //2.右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]

            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break;
            }

            e1--
            e2--

        }
        //3.新的比旧的多
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos + 1 < l2 ? c2[nextPos].el : null
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
            //新的比旧的少
        } else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {
            //中间对比
            let s1 = i
            let s2 = i

            const toBePatched = e2 - s2 + 1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched)
            let moved = false
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatched; i++)newIndexToOldIndexMap[i] = 0;

            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]

                if (patched >= toBePatched) {
                    hostRemove(prevChild.el)
                    continue
                }

                //null undefined
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el)
                } else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }

                    newIndexToOldIndexMap[newIndex - s2] = i + 1

                    patch(prevChild, c2[newIndex], container, parentComponent, null)
                    patched++
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0; i--) {

                const nextIndex = i + s2
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;

                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor)
                }

                if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }

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

    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { children, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent, anchor)
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
        hostInsert(el, container, anchor)
    }


    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor)
        })
    }

    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountComponent(n2, container, parentComponent, anchor)
        } else {
            updateComponent(n1, n2)
        }
    }

    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2
            instance.update()
        } else {
            n2.el = n1.el
            instance.vnode = n2
        }

    }

    function mountComponent(initialVnode, container, parentComponent, anchor) {
        const instance = (initialVnode.component = createComponentInstance(initialVnode, parentComponent))

        setupComponent(instance)
        setupRenderEffect(instance, initialVnode, container, anchor)
    }

    function setupRenderEffect(instance, initialVnode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log('init')
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                patch(null, subTree, container, instance, anchor)

                initialVnode.el = subTree.el
                instance.isMounted = true
            }
            else {
                console.log('update')
                //需要一个vnode
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el

                    updateComponentRenderer(instance, next)
                }


                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                instance.subTree = subTree
                patch(preSubTree, subTree, container, instance, anchor)
            }

        }, {
            scheduler() {
                console.log('scheduler')
                queueJobs(instance.update)
            }
        }

        )

    }

    return {
        createApp: createAppAPI(render)
    }

}

function updateComponentRenderer(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null

    instance.props = nextVNode.props
}


function getSequence(arr) {
    if (arr.length === 0) return [];

    const dp = new Array(arr.length).fill(1);
    const prev = new Array(arr.length).fill(-1);
    let res = 1;
    let resIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < i; j++) {
            if (arr[i] > arr[j]) {
                if (dp[i] < dp[j] + 1) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }
        }
        if (res < dp[i]) {
            res = dp[i];
            resIndex = i;
        }
    }

    const lisIndices: Array<number> = [];
    for (let i = resIndex; i >= 0; i = prev[i]) {
        lisIndices.push(i);
        if (prev[i] === -1) break;
    }
    lisIndices.reverse();
    return lisIndices;
}

