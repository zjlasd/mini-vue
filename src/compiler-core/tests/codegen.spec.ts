import { transform } from '../src/transform'
import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";

describe('codegen', () => {
    it('string', () => {
        const ast = baseParse("hi")
        transform(ast)
        const { code } = generate(ast)

        expect(code).toMatchInlineSnapshot(`"return function render(_ctx, _cache){return 'hi'}"`)

    })
})