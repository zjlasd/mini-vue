import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from './Foo.js'

window.self = null
export const App = {

    render() {
        window.self = this
        return h(
            "div",
            {
                id: "root",
                class: ["red", "hard"],
                onClick() {
                    console.log('click')
                },
                onMousedo() {
                    console.log('onmousedown')
                }
            },
            [h("div", {}, "hi," + this.msg),
                h(Foo, { count: 1 })
            ]
            // "hi," + this.msg
            //string
            // "hi，mini-vue"
            //Array
            // [h("p",{class:"red"},"hi"),h("p",{class:"blue"},"mini-vue")]
        )
    },

    setup() {
        return {
            msg: "mini-vue-hhhh"
        }
    }
}