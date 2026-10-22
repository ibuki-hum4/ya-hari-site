// いまどの演出が動いているか。同時に動くのは常に1つだけで、動いている間はほかの発動を受け付けない
// React からは useSyncExternalStore(subscribe, getMode) で読む
//   terminal → collapse → reboot   （rm -rf /）
//   terminal → collapse → outage   （kubectl delete pod）
//   terminal → blackout            （poweroff）

export type PlaygroundMode = "idle" | "terminal" | "collapse" | "reboot" | "outage" | "destroy" | "blackout";

let mode: PlaygroundMode = "idle";
const listeners = new Set<() => void>();

function set(next: PlaygroundMode) {
    mode = next;
    listeners.forEach((listener) => listener());
}

export function getMode(): PlaygroundMode {
    return mode;
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// 何も動いていないときだけ入れる。入れたら true
export function enter(next: Exclude<PlaygroundMode, "idle">): boolean {
    if (mode !== "idle") return false;
    set(next);
    return true;
}

// 自分が動いているときだけ抜ける（他のモードを誤って止めない）
export function exit(current: Exclude<PlaygroundMode, "idle">): void {
    if (mode === current) set("idle");
}

// ターミナル → 破壊モード のように、間に idle を挟まず切り替える
export function transition(from: Exclude<PlaygroundMode, "idle">, to: Exclude<PlaygroundMode, "idle">): boolean {
    if (mode !== from) return false;
    set(to);
    return true;
}
