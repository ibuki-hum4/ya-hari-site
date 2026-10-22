// rm -rf / と kubectl delete pod で共有する「だんだん壊れる」演出の時間割りと、文字化け
// DOM には触らない。どの段階で何をどれだけ崩すかだけを決める

// 崩壊にかける時間。この間ターミナルにログが流れ、最後にターミナル自体が崩れて閉じる
export const COLLAPSE_MS = 3000;

// 1: ノイズ・色ずれ / 2: 傾き・ずれ / 3: 文字化け・欠け
export type CollapsePhase = 1 | 2 | 3;

export type CollapseState = {
    phase: CollapsePhase;
    // 全体の進み具合（0〜1）
    progress: number;
    // それぞれの崩れ方の強さ（0〜1）。前の段階の崩れは残したまま強くなっていく
    noise: number;
    tilt: number;
    corrupt: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function collapseState(elapsedMs: number, durationMs = COLLAPSE_MS): CollapseState {
    const progress = clamp01(elapsedMs / durationMs);
    return {
        phase: progress < 0.35 ? 1 : progress < 0.7 ? 2 : 3,
        progress,
        noise: clamp01(progress / 0.35),
        tilt: clamp01((progress - 0.35) / 0.35),
        corrupt: clamp01((progress - 0.7) / 0.3),
    };
}

// 文字化けに使う字（Shift_JIS を UTF-8 で読んだときのような字と、ブロック要素）
const GARBAGE = "縺繧譁蟄螟陦諠閾逕驕郢晢ｽｯ�▒░▓█";

// 空白と改行はそのままにして、ratio の割合の文字を化けさせる
export function mojibake(text: string, ratio: number, random: () => number): string {
    return [...text]
        .map((ch) => (/\s/.test(ch) || random() >= ratio ? ch : GARBAGE[Math.floor(random() * GARBAGE.length)]))
        .join("");
}

// 再現できる乱数（mulberry32）。テストと、同じ実行の中で崩れ方を揃えるのに使う
export function createRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
