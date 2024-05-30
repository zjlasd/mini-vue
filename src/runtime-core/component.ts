import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicinstance";

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }

    return component
}

export function setupComponent(instance) {
    //TODO
    initProps(instance, instance.vnode.props)
    //initSlots()

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.type;


    //ctx
    instance.proxy = new Proxy({ _: instance },
        PublicInstanceProxyHandlers
    )

    const { setup } = Component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props))

        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {

    if (typeof setupResult === "object") {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type


    instance.render = Component.render

}