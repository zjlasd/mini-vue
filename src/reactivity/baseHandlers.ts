import { track, trigger } from "./effect"
import { ReactiveFlages, isReactive, reactive, readonly } from "./reactive"
import { extend, isObject } from "../shared/index"

const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {

        if (key === ReactiveFlages.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlages.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)

        //判断浅拷贝
        if (shallow) {
            return res
        }

        //判断res是不是object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        //TODO 依赖收集
        if (!isReadonly) {
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)

        trigger(target, key)
        //DOTO触发依赖
        return res
    }
}


export const mutableHandlers = {
    get,
    set
}

export const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        // console.warn('error')
        return true
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandles, {
    get: shallowReadonlyGet
})