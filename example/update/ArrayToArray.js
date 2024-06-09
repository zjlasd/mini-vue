import { ref, h } from '../../lib/guide-mini-vue.esm.js'

//1.左侧的对比
//(a b) c
//(a b) d e
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ];
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
// ];

//2.右侧的对比
//a (b c)
//d e (b c)
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C")
// ];
// const nextChildren = [
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
// ];


//3.新的比旧的长
//左侧
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),

// ];
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "C" }, "C"),
// ];
//右侧
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),

// ];
// const nextChildren = [
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
// ];

// 4.新的比旧的短
// 左侧
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
// ];

// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),

// ];

// 右侧
// const prevChildren = [

//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
// ];


//5.对比中间的部分
//一样长
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C", id: "c-prev" }, "C"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "C", id: "c-next" }, "C"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];

//5.对比中间的部分
//旧的比新的多
const prevChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "C", id: "c-prev" }, "C"),
    h("p", { key: "E" }, "E"),
    h("p", { key: "D" }, "D"),
    h("p", { key: "F" }, "F"),
    h("p", { key: "G" }, "G"),
];
const nextChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "E" }, "E"),
    h("p", { key: "C", id: "c-next" }, "C"),
    h("p", { key: "F" }, "F"),
    h("p", { key: "G" }, "G"),
];



export default {
    name: "ArrayToText",
    setup() {
        const isChange = ref(false)
        window.isChange = isChange;

        return {
            isChange
        }
    },
    render() {
        const self = this

        return self.isChange === true ?
            h("div", {}, nextChildren) :
            h("div", {}, prevChildren)
    }
}