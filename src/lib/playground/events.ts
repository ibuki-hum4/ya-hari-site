// 実績システムなどが拾うためのイベント。window に "playground:<名前>" の CustomEvent として流す
// 例: window.addEventListener("playground:terminal:command", (e) => console.log(e.detail))

import type { HealTrigger } from "@/lib/destroy/heal";

// 破壊モード（物理演算）はフッターの「壊す」からだけ。ターミナルの rm -rf / は別の演出（wipe:*）
export type DestroySource = "footer";
export type BlackoutSource = "footer" | "terminal";
export type BlackoutEndTrigger = "button" | "escape" | "footer";
export type CollapseKind = "wipe" | "pod-delete";

export type PlaygroundEvents = {
    "terminal:open": Record<string, never>;
    "terminal:close": Record<string, never>;
    "terminal:command": { command: string; exitCode: number };
    "destroy:start": { source: DestroySource; total: number; reducedMotion: boolean };
    "element:shatter": { destroyed: number; total: number };
    "heal:start": { trigger: HealTrigger; destroyed: number; total: number };
    // restoreCheck は開発時だけ入る。元と違っていた項目の名前（空なら完全に元通り）
    "heal:done": { trigger: HealTrigger; destroyed: number; total: number; healMs: number; restoreCheck?: string[] };
    "blackout:start": { source: BlackoutSource };
    "blackout:end": { trigger: BlackoutEndTrigger; durationMs: number };
    // ターミナルの隠しコマンドで、ページがだんだん壊れはじめた
    "collapse:start": { kind: CollapseKind };
    // rm -rf / → 崩壊 → 再起動 が終わってページが戻った
    "wipe:done": { skipped: boolean; restoreCheck?: string[] };
    // kubectl delete pod → 崩壊 → 500 が出た / 復活してページが戻った
    "outage:start": { pods: string[] };
    "outage:done": { skipped: boolean; restoreCheck?: string[] };
};

const PREFIX = "playground:";

export function emit<K extends keyof PlaygroundEvents>(type: K, detail: PlaygroundEvents[K]): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(PREFIX + type, { detail }));
}

export function on<K extends keyof PlaygroundEvents>(
    type: K,
    handler: (detail: PlaygroundEvents[K]) => void,
): () => void {
    const listener = (event: Event) => handler((event as CustomEvent<PlaygroundEvents[K]>).detail);
    window.addEventListener(PREFIX + type, listener);
    return () => window.removeEventListener(PREFIX + type, listener);
}
