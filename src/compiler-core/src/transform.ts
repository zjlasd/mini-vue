import { NodeTypes } from "./ast"
import { TO_DISPALY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
    const context = createTransformContext(root, options)
    traverseNode(root, context)
    createRootCodegen(root)
    // console.log(context.helpers.keys())
    root.helpers = [...context.helpers.keys()]
    console.log(...root.helpers)
}
function createRootCodegen(root) {
    root.codegenNode = root.children[0]
}

function createTransformContext(root: any, options: any) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1)
        }
    }
    return context
}

function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i]
        transform(node)
    }

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPALY_STRING)
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context)
            break
        default:
            break;
    }



}

function traverseChildren(node: any, context: any) {
    const children = node.children

    for (let i = 0; i < children.length; i++) {
        const node = children[i]
        traverseNode(node, context)
    }
} 
