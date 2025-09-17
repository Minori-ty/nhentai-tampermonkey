// 响应式系统核心
let activeEffect: (() => void) | null = null;
const targetMap = new WeakMap<object, Map<string | symbol, Set<() => void>>>();

function track(target: object, key: string | symbol) {
    if (!activeEffect) return;

    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Set()));
    }

    dep.add(activeEffect);
}

function trigger(target: object, key: string | symbol) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (dep) {
        dep.forEach((effect) => effect());
    }
}

export function reactive<T extends object>(target: T): T {
    return new Proxy(target, {
        get(target: T, key: string | symbol, receiver: any): any {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(
            target: T,
            key: string | symbol,
            value: any,
            receiver: any,
        ): boolean {
            const oldValue = Reflect.get(target, key, receiver);
            if (oldValue === value) return true;

            const result = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return result;
        },
    });
}

export function effect(fn: () => void): void {
    activeEffect = fn;
    fn();
    activeEffect = null;
}
