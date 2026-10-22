// 本物のページを隠す「幕」。破壊モード・崩壊・再起動・500 で共有する
// ページに触るのは [data-page-root] の style（opacity: 0）と inert だけで、上げるときにそのまま戻す。
// 幕を下ろした演出と、上げる演出が別のコンポーネントでもよい（崩壊 → 再起動 / 500 のように引き継ぐ）

import { compareSnapshots, takeSnapshot, type PageSnapshot } from "@/lib/destroy/snapshot";
import { findPageRoot } from "./collect";

type Curtain = {
    root: HTMLElement;
    rootStyle: string | null;
    rootInert: boolean;
    returnFocusTo: Element | null;
    scrollX: number;
    scrollY: number;
    before: PageSnapshot | null;
    pinScroll: () => void;
};

let curtain: Curtain | null = null;

const isDev = process.env.NODE_ENV !== "production";

export type LowerOptions = {
    // 「元の状態」として比べるスナップショット。ターミナルから来たときは、ターミナルを開く前のもの
    // （開いている間は Radix がページに aria-hidden やスクロール止めを付けているため）
    before?: PageSnapshot | null;
    // 幕を上げたあとにフォーカスを戻す先
    returnFocusTo?: Element | null;
};

export function isCurtainDown(): boolean {
    return curtain !== null;
}

export function lowerCurtain(options: LowerOptions = {}): void {
    if (curtain) return;
    const root = findPageRoot();
    if (!root) return;

    const saved: Curtain = {
        root,
        rootStyle: root.getAttribute("style"),
        rootInert: root.inert,
        returnFocusTo: options.returnFocusTo !== undefined ? options.returnFocusTo : document.activeElement,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        before: options.before !== undefined ? options.before : isDev ? takeSnapshot(root) : null,
        // ページは隠れているので、動くと戻したときに位置がずれる。スクロールバーを掴まれても戻す
        pinScroll: () => {
            if (window.scrollX !== saved.scrollX || window.scrollY !== saved.scrollY) {
                window.scrollTo(saved.scrollX, saved.scrollY);
            }
        },
    };
    curtain = saved;

    root.style.opacity = "0";
    root.inert = true;
    window.addEventListener("scroll", saved.pinScroll);
}

// 幕を上げて、ページを下ろす前と同じ状態に戻す。開発時は違っていた項目の名前を返す（空なら完全に元通り）
export function raiseCurtain(): { restoreCheck?: string[] } {
    const saved = curtain;
    if (!saved) return {};
    curtain = null;
    const { root } = saved;

    window.removeEventListener("scroll", saved.pinScroll);
    if (saved.rootStyle === null) root.removeAttribute("style");
    else root.setAttribute("style", saved.rootStyle);
    root.inert = saved.rootInert;

    // 演出の UI（「直す」ボタンなど）に残ったフォーカスを、元の場所へ戻す
    const target = saved.returnFocusTo;
    if (target instanceof HTMLElement && target !== document.body && target.isConnected) {
        target.focus({ preventScroll: true });
    } else if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    saved.pinScroll();

    if (!saved.before) return {};
    const restoreCheck = compareSnapshots(saved.before, takeSnapshot(root));
    if (restoreCheck.length > 0) console.warn("[playground] 演出のあとのページが元と違います:", restoreCheck);
    else console.info("[playground] 演出のあとのページは元と一致しました");
    return { restoreCheck };
}
