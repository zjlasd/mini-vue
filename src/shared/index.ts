export const extend = Object.assign

export const EMPTY_OBJ = {}


export const isObject = (val) => {
    return val !== null && typeof val === "object"
}

export const hasChanged = (val,newValue) => {
    return !Object.is(newValue, val) 
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)