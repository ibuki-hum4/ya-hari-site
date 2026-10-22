// 停電モードの懐中電灯。暗闇のレイヤーに、照らす位置を中心とした円の穴をあける
// 穴の内側は完全に透明（文字が普通に読める）で、縁だけをぼかす

export type Viewport = { width: number; height: number };

export const DARKNESS = "rgba(0, 0, 0, 0.96)";

// 照らす円の半径。画面の短い辺に合わせつつ、小さすぎ・大きすぎにしない
export function lightRadius({ width, height }: Viewport): number {
    return Math.round(Math.min(200, Math.max(110, Math.min(width, height) * 0.22)));
}

export function spotlightBackground(x: number, y: number, radius: number): string {
    // 半径の 6 割までは完全に明るく、そこから縁にかけて暗くする
    return `radial-gradient(circle ${radius}px at ${Math.round(x)}px ${Math.round(y)}px, ` +
        `transparent 0%, transparent 60%, rgba(0, 0, 0, 0.6) 85%, ${DARKNESS} 100%)`;
}

// 電気がチカチカしてから消える演出（Web Animations の keyframes）
export const flickerKeyframes: Keyframe[] = [
    { opacity: 0, offset: 0 },
    { opacity: 0.9, offset: 0.1 },
    { opacity: 0.1, offset: 0.16 },
    { opacity: 1, offset: 0.3 },
    { opacity: 0.3, offset: 0.36 },
    { opacity: 0.2, offset: 0.5 },
    { opacity: 1, offset: 0.56 },
    { opacity: 0.6, offset: 0.62 },
    { opacity: 1, offset: 1 },
];

export const FLICKER_MS = 900;
