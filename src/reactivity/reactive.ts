import { mutableHandlers, readonlyHandles, shallowReadonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlages {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

export function reactive(raw) {
    return new Proxy(raw, mutableHandlers)
}

export function readonly(raw) {
    return createReactiveObject(raw, readonlyHandles)
}

export function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value) {
    return !!value[ReactiveFlages.IS_REACTIVE]
}
export function isReadonly(value) {
    return !!value[ReactiveFlages.IS_READONLY]
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}


function createReactiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}