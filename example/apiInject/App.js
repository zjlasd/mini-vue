import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js"

const Provider = {
    name: "Provider",
    setup() {
        provide("foo", "fooVal")
        provide("bar", "barVal")
    },
    render() {
        return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)])
    }
}
const ProviderTwo = {
    name: "ProviderTwo",
    setup() {
        provide("foo", "fooTwo")
        const foo = inject("foo")
        return {
            foo
        }
    },
    render() {
        return h("div", {}, [h("p", {}, `ProviderTwo foo:${this.foo}`), h(Consumer)])
    }
}

const Consumer = {
    name: "Consumer",
    setup() {
        const foo = inject("foo")
        const bar = inject("bar")
        const baz = inject("baz",()=>"default")
        return {
            foo,
            bar,
            baz
        }
    },
    render() {
        return h("div", {}, `Comsumer:-${this.foo}-${this.bar}-${this.baz}`)
    }
}


export default {
    name: "App",
    render() {
        return h("div", {}, [h("p", {}, "apiInject"), h(Provider)])
    },

    setup() {
    }
}
// import { h } from "../../lib/guide-mini-vue.esm.js"
// import { Foo } from './Foo.js'

// window.self = null
// export default  {

//     render() {
//         window.self = this
//         return h(
//             "div",
//             {},
//             [h("div", {}, "hi," + "App"),]            
//         )
//     },

//     setup() {
//         return {

//         }
//     }
// }