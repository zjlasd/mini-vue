import { NodeTypes } from "./ast";

const enum TagType {
    Start,
    End
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))

}
function parseChildren(context, ancestors) {
    const nodes: any = [];

    while (!isEnd(context, ancestors)) {
        let node;
        const s = context.source
        if (s.startsWith("{{")) {
            node = parseInterpolation(context)
        } else if (s[0] === "<") {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }

        if (!node) {
            node = parseText(context)
        }

        nodes.push(node)
    }

    return nodes
}

function isEnd(context, ancestors) {
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    //source有值的时候
    return !s
}


function parseText(context) {
    let endIndex = context.source.length
    let endToken = ["<", "{{"]

    for (let i = 0; i < endToken.length; i++) {
        const index = context.source.indexOf(endToken[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }



    //1.获取content
    const content = parseTextData(context, endIndex);
    console.log("context", content)

    return {
        type: NodeTypes.TEXT,
        content
    }
}


function parseTextData(context: any, length) {
    const content = context.source.slice(0, length);
    //2.推进
    advanceBy(context, length);
    return content;
}

function parseElement(context, ancestors) {
    //解析tag
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)

    ancestors.pop()
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    } else {
        throw new Error(`缺少结束标签${element.tag}`)
    }

    return element
}

function startsWithEndTagOpen(source, tag) {
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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