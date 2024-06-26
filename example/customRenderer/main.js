import {  createRender } from '../../lib/guide-mini-vue.esm.js'
import { App } from './App.js'

const game = new PIXI.Application({
    width: 500,
    height: 500
})
// document.body.append(game.view)

console.log(PIXI)
const renderer = createRender({
    createElement(type) {
        if (type === "rect") {
            const rect = new PIXI.Graphics()
            rect.beginFill(0*ff0000);
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
        }
    },
    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    }
})

renderer.createApp(App).mount(game.stage)
// const rootContainer = document.querySelector("#app")
// createApp(App).mount(rootContainer)