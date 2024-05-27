import { extend } from "../shared/index";

let activeEffect;
let shuoldTrack;

class ReactiveEffect {
    private _fn: any;
    deps = [];
    active = true
    onStop?: () => void
    // public scheduler: Function | undefined
    constructor(fn, public scheduler?: Function) {
        this._fn = fn
    }

    run() {
        //使用shouledTrack来区分
        if (!this.active) {
            return this._fn()
        }
        shuoldTrack = true
        activeEffect = this

        const result = this._fn()
        //reset
        activeEffect = false

        return result
    }

    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

//依赖收集
const targetMap = new Map()
export function track(target, key) {
    //判断是否需要收集依赖
    if (!isTracking()) return;

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    trackEffects(dep)
}

export function trackEffects(dep) {
    //判断是否有添加过
    if (dep.has(activeEffect)) return
    dep.add(activeEffect)

    //反向收集
    activeEffect.deps.push(dep)
}

export function isTracking() {
    return shuoldTrack && activeEffect
}



export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    triggerEffects(dep)
}
export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}


export function effect(fn, options: any = {}) {
    const scheduler = options.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)
    // _effect.onStop = options.onStop
    // Object.assign(_effect, options)

    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()

}