// ページから壊す対象を選び、オーバーレイ用の複製を作る
// 本物の要素は動かさない。複製だけを同じ位置に置いて、それを落としたり砕いたりする

import { selectTargets, targetLimit, type Candidate, type TargetKind } from "@/lib/destroy/targets";

export type Piece = {
    clone: HTMLElement;
    rect: DOMRect; // 破壊前の位置（修復でここへ戻す）
    round: boolean; // 真円（プロフィール画像など）なら円のボディにして転がす
    destroyed: boolean;
    // 破壊前の位置からのずれ（物理演算が毎フレーム更新する）
    dx: number;
    dy: number;
    angle: number;
};

// layout.tsx のページ全体を包む要素
export function findPageRoot(): HTMLElement | null {
    return document.querySelector<HTMLElement>("[data-page-root]");
}

const selectors: [string, TargetKind][] = [
    // ui/card.tsx の cardClass（bg-surface border rounded-2xl）
    ["[class*='rounded-2xl'][class*='border']", "card"],
    ["h1, h2, h3, h4", "heading"],
    ["img, video, svg", "media"],
    ["p, li, blockquote, pre, label, span[class*='rounded-full']", "text"],
    ["a, button, input, textarea, select", "control"],
];

function isVisible(el: HTMLElement): boolean {
    // Reveal でまだ透明なもの（opacity: 0 の祖先がいるもの）は除く
    if (typeof el.checkVisibility === "function") {
        return el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    }
    return getComputedStyle(el).visibility !== "hidden";
}

// 角丸で切り抜いている枠の中の画像は、枠ごと落とす（中の img だけだと四角くなる）
function mediaFrame(el: HTMLElement): HTMLElement {
    const parent = el.parentElement;
    if (!parent) return el;
    const a = el.getBoundingClientRect();
    const b = parent.getBoundingClientRect();
    // 枠の border の分（左右で数 px）は同じ大きさとみなす
    const sameBox = Math.abs(a.width - b.width) <= 6 && Math.abs(a.height - b.height) <= 6;
    return sameBox && getComputedStyle(parent).overflow === "hidden" ? parent : el;
}

function makeClone(el: HTMLElement, rect: DOMRect): HTMLElement {
    const clone = el.cloneNode(true) as HTMLElement;

    // 入力中の値・canvas の中身は cloneNode で引き継がれない
    const sourceFields = el.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((field, i) => {
        field.value = sourceFields[i]?.value ?? "";
    });
    const sourceCanvases = el.querySelectorAll("canvas");
    clone.querySelectorAll("canvas").forEach((canvas, i) => {
        try {
            canvas.getContext("2d")?.drawImage(sourceCanvases[i], 0, 0);
        } catch {
            // WebGL など描けないものは空のまま
        }
    });
    // id が重複しないように外し、画像はすぐに描かせる
    [clone, ...clone.querySelectorAll<HTMLElement>("[id]")].forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll("img").forEach((img) => {
        img.loading = "eager";
        img.decoding = "sync";
    });

    // 祖先から受け継いでいた文字の見た目を、複製に直接持たせる
    const style = getComputedStyle(el);
    Object.assign(clone.style, {
        position: "absolute",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        boxSizing: "border-box",
        transform: "none",
        transition: "none",
        animation: "none",
        color: style.color,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        textAlign: style.textAlign,
        whiteSpace: style.whiteSpace,
        willChange: "transform",
        pointerEvents: "none",
    });
    return clone;
}

export function collectPieces(root: HTMLElement, layer: HTMLElement): Piece[] {
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    const kinds = new Map<HTMLElement, TargetKind>();
    for (const [selector, kind] of selectors) {
        root.querySelectorAll<HTMLElement>(selector).forEach((found) => {
            // リンクやボタンの中のアイコンは、アイコンだけ落とさずリンクごと扱う
            if (found instanceof SVGElement && (found.closest("a, button, label") || found.getBoundingClientRect().width < 24)) return;
            const el = kind === "media" ? mediaFrame(found) : found;
            if (!kinds.has(el) && isVisible(el)) kinds.set(el, kind);
        });
    }

    const elements = [...kinds.keys()];
    const indexOf = new Map(elements.map((el, i) => [el, i]));
    const candidates: Candidate[] = elements.map((el) => {
        const ancestors: number[] = [];
        for (let parent = el.parentElement; parent && parent !== root; parent = parent.parentElement) {
            const index = indexOf.get(parent);
            if (index !== undefined) ancestors.push(index);
        }
        const r = el.getBoundingClientRect();
        return { kind: kinds.get(el)!, rect: { x: r.left, y: r.top, width: r.width, height: r.height }, ancestors };
    });

    return selectTargets(candidates, viewport, targetLimit(viewport)).map((index) => {
        const el = elements[index];
        const rect = el.getBoundingClientRect();
        const clone = makeClone(el, rect);
        layer.appendChild(clone);
        const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
        const round = Math.abs(rect.width - rect.height) < 4 && radius >= Math.min(rect.width, rect.height) / 2 - 1;
        return { clone, rect, round, destroyed: false, dx: 0, dy: 0, angle: 0 };
    });
}
