
export function emit(instance, event, ...args) {
    console.log(event) 
    const { props } = instance

    //TPP
    //先去写一个特定的行为=>重构通用的行为
    //add=》Add
    //add-foo=>addFoo

    const camlize = (str: string) => {
        return str.replace(/-(\w)/g, (_, c: string) => {
            return c ? c.toUpperCase() : "";
        })
    }

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const toHandlerKey = (str: string) => {
        return str ? "on" + capitalize(str) : "";
    }
    console.log(camlize(event))
    const handlerName = toHandlerKey(camlize(event))

    const handler = props[handlerName]
    handler && handler(...args)
}