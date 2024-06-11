import { NodeTypes } from "./ast";
import { TO_DISPALY_STRING, helperMapName } from "./runtimeHelpers";

export function generate(ast) {
    const context = createCodegenContext()
    const { push } = context

    genFunctionPreamble(ast, context);

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    push(`function ${functionName}(${signature}){`)
    push("return ")
    genNode(ast.codegenNode, context)
    push("}")
    // console.log(context.code)
    return {
        code: context.code
    }
}

function genFunctionPreamble(ast: any, context) {
    const { push } = context
    const VueBinging = "Vue";
    const aliasHepler = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
    console.log(ast.helpers.map(aliasHepler).join(", "));
    if (ast.helpers.length > 0) {
        push(`const {${ast.helpers.map(aliasHepler).join(", ")} } = ${VueBinging}`);
    }

    push("\n");
    push("return ");
}

function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source
        },
        helper(key) {
            return `${helperMapName[key]}`
        }
    }
    return context
}

function genNode(node: any, context) {

    switch (node.type) {
        case NodeTypes.TEXT:

            genText(node, context)
            break;
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context)
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context)
        default:
            break;
    }
}

function genText(node, context) {
    const { push } = context
    push(`'${node.content}'`)

}

function genInterpolation(node: any, context: any) {
    const { push ,helper} = context

    push(`_${helper(TO_DISPALY_STRING)}(`)
    genNode(node.content, context)
    push(")")
}

function genExpression(node: any, context: any) {
    const { push } = context
    push(`${node.content}`)
}

