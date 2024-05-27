import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
    private _value: any
    public dep
    private _rawValue: any
    public __v_isref = true
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        //判断是不是对象
        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        //newValue=>this._value
        //hasChange
        if (hasChanged(newValue, this._value)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffects(this.dep)
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}
export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
    return !!ref.__v_isref
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}