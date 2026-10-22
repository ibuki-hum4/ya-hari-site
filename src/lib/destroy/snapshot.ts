// 修復後のページが破壊前と同じかを確かめるためのスナップショット
// 開発中は heal:done のたびに比べて、違いがあればコンソールに出す（確認手順は playground/README.md）

export type PageSnapshot = {
    scrollX: number;
    scrollY: number;
    activeElement: unknown;
    rootStyle: string | null;
    rootInert: boolean;
    rootAriaHidden: string | null;
    htmlStyle: string | null;
    bodyStyle: string | null;
    formValues: string[];
    htmlHash: string;
};

// 文字列の簡易ハッシュ（DOM の中身が変わっていないかを見るだけなので衝突耐性はいらない）
export function hashString(text: string): string {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
    return `${text.length}:${(hash >>> 0).toString(16)}`;
}

// 子孫の style 属性は比べない。motion の無限アニメーション（トップの Scroll 表示など）が
// 毎フレーム書き換えるため。破壊モードが触るのはページを包む要素の style だけで、それは rootStyle で比べる
export function structureOf(html: string): string {
    return html.replace(/ style="[^"]*"/g, "");
}

// 空の style 属性（style=""）は、属性が無いのと同じに扱う（Radix がダイアログを閉じたあとに残すため）
export function normalizeStyle(style: string | null): string | null {
    return style && style.trim() ? style : null;
}

export function takeSnapshot(root: HTMLElement): PageSnapshot {
    const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
    return {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        activeElement: document.activeElement,
        rootStyle: normalizeStyle(root.getAttribute("style")),
        rootInert: root.inert,
        rootAriaHidden: root.getAttribute("aria-hidden"),
        htmlStyle: normalizeStyle(document.documentElement.getAttribute("style")),
        bodyStyle: normalizeStyle(document.body.getAttribute("style")),
        formValues: [...fields].map((f) => (f instanceof HTMLInputElement && (f.type === "checkbox" || f.type === "radio") ? String(f.checked) : f.value)),
        htmlHash: hashString(structureOf(root.innerHTML)),
    };
}

// 違っている項目の名前を返す。空なら完全に同じ
export function compareSnapshots(before: PageSnapshot, after: PageSnapshot): string[] {
    const diffs: string[] = [];
    for (const key of Object.keys(before) as (keyof PageSnapshot)[]) {
        const a = before[key];
        const b = after[key];
        const same = Array.isArray(a) && Array.isArray(b)
            ? a.length === b.length && a.every((v, i) => v === b[i])
            : a === b;
        if (!same) diffs.push(key);
    }
    return diffs;
}
