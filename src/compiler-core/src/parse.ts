import { NodeTypes } from "./ast";

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))

}
function parseChildren(context) {
    const nodes: any = [];
    let node;
    const s = context.source
    if (s.startsWith("{{")) {
        node = parseInterpolation(context)
    } else if (s[0] === "<") {
        if (/[a-z]/i.test(s[1])) {
            node = parseElement(context)
        }
    }

    if (!node) {
        node = parseText(context)
    }

    nodes.push(node)
    return nodes
}

function parseText(context) {
    //1.获取content
    const content = parseTextData(context, context.source.length);
    console.log(content.source)

    return {
        type: NodeTypes.TEXT,
        content: "some text"
    }
}


function parseTextData(context: any, length) {
    const content = context.source.slice(0, length);
    //2.推进
    advanceBy(context, length);
    return content;
}

function parseElement(context) {
    //解析tag
    const element = parseTag(context, TagType.Start)
    parseTag(context, TagType.End)
    return element
}

function parseTag(context, type) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);

    // console.log(match)
    const tag = match[1];
    //删除处理完成的代码
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    console.log(context.source);
    if (type === TagType.End) return;


    return {
        type: NodeTypes.ELEMENT,
        tag
    };
}


function parseInterpolation(context) {

    //{{message}}

    const openDelimiter = "{{"
    const closeDelimiter = "}}"



    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);

    advanceBy(context, openDelimiter.length)

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = parseTextData(context, rawContentLength)

    const content = rawContent.trim()

    advanceBy(context, closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function createRoot(children) {
    return {
        children,
    }
}

function createParserContext(content: string) {
    return {
        source: content
    }
}

function advanceBy(context, length) {
    context.source = context.source.slice(length)
}