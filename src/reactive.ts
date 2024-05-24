import { mutableHandlers, readonlyHandles } from "./baseHandlers"

export const enum ReactiveFlages{
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}

export function reactive(raw) {
    return new Proxy(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandles)
}

export function isReactive(value) {
    return !!value[ReactiveFlages.IS_REACTIVE]
}
export function isReadonly(value) {
    return !!value[ReactiveFlages.IS_READONLY]
}




function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}