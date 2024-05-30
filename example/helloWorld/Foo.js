import { h } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
    setup(props) {
        //prop.count
        console.log(props)
        //shallowreadonly
        props.count++
        console.log(props)
    },
    render() {
        return h("div", {}, "foo:" + this.count)
    }

}