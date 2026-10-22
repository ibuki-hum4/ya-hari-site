// 破壊モードで物理演算のボディにする要素を選ぶ。DOM には触らず、矩形と包含関係だけで決める
// 例: カードを選んだら、その中の見出しやボタンは選ばない（カードごと1つの塊として落とす）

export type TargetKind = "card" | "heading" | "media" | "text" | "control";

export type Rect = { x: number; y: number; width: number; height: number };

export type Candidate = {
    kind: TargetKind;
    rect: Rect;
    ancestors: number[]; // 自分を含んでいる候補のインデックス
};

export type Viewport = { width: number; height: number };

// 段落の中のリンクより段落ごと落とす方が自然なので、text を control より先に選ぶ
const priority: Record<TargetKind, number> = { card: 0, heading: 1, media: 2, text: 3, control: 4 };

const area = (rect: Rect) => rect.width * rect.height;

// 小さすぎるもの・画面を覆うほど大きいもの・半分以上画面外にあるものは対象にしない
export function isUsableRect(rect: Rect, viewport: Viewport): boolean {
    if (rect.width < 16 || rect.height < 12) return false;
    if (area(rect) > viewport.width * viewport.height * 0.6) return false;
    const visibleWidth = Math.min(rect.x + rect.width, viewport.width) - Math.max(rect.x, 0);
    const visibleHeight = Math.min(rect.y + rect.height, viewport.height) - Math.max(rect.y, 0);
    if (visibleWidth <= 0 || visibleHeight <= 0) return false;
    return (visibleWidth * visibleHeight) / area(rect) >= 0.5;
}

// 重くならないよう、同時に扱う数に上限を設ける
export function targetLimit(viewport: Viewport): number {
    return viewport.width < 640 ? 20 : 40;
}

// 選んだ候補のインデックスを文書順で返す
export function selectTargets(candidates: Candidate[], viewport: Viewport, limit = targetLimit(viewport)): number[] {
    const order = candidates
        .map((_, index) => index)
        .filter((index) => isUsableRect(candidates[index].rect, viewport))
        .sort((a, b) =>
            priority[candidates[a].kind] - priority[candidates[b].kind] ||
            area(candidates[b].rect) - area(candidates[a].rect) ||
            a - b,
        );

    const chosen = new Set<number>();
    for (const index of order) {
        if (chosen.size >= limit) break;
        const candidate = candidates[index];
        // 親か子がもう選ばれていたら、二重に落とさない
        if (candidate.ancestors.some((a) => chosen.has(a))) continue;
        if ([...chosen].some((c) => candidates[c].ancestors.includes(index))) continue;
        chosen.add(index);
    }
    return [...chosen].sort((a, b) => a - b);
}
