import { transform } from '../src/transform'
import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transformExpression } from '../src/transforms/transformExpression';

describe('codegen', () => {
    it('string', () => {
        const ast = baseParse("hi")
        transform(ast)
        const { code } = generate(ast)

        expect(code).toMatchInlineSnapshot(`
"
return function render(_ctx, _cache){return 'hi'}"
`)

    })


    it('interpolation', () => {
        const ast = baseParse("{{message}}")
        transform(ast, {
            nodeTransforms: [transformExpression]
        })
        const { code } = generate(ast)

        expect(code).toMatchInlineSnapshot(`
"const {toDisplayString:_toDisplayString } = Vue
return function render(_ctx, _cache){return _toDisplayString(_ctx.message)}"
`)
    })
})