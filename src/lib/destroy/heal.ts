// 破壊モードから自己修復に入る条件

export type HealTrigger = "all-destroyed" | "timeout" | "button" | "escape";

// 破壊モード開始からこの時間が経ったら、自動で修復に入る
export const DESTROY_DURATION_MS = 10_000;

// 時間や数で自動的に決まる修復の条件。ボタンと Esc は呼び出し側で直接 heal する
export function autoHealTrigger({ destroyed, total, elapsedMs }: {
    destroyed: number;
    total: number;
    elapsedMs: number;
}): HealTrigger | null {
    if (total > 0 && destroyed >= total) return "all-destroyed";
    if (elapsedMs >= DESTROY_DURATION_MS) return "timeout";
    return null;
}

// 修復にかかった時間の表示（0.1 秒単位）
export function formatSeconds(ms: number): string {
    return (Math.round(ms / 100) / 10).toFixed(1);
}
