"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import type { PageSnapshot } from "@/lib/destroy/snapshot";
import { enter, exit, getMode, subscribe, transition } from "@/lib/playground/mode";
import {
    emit,
    on,
    type BlackoutEndTrigger,
    type BlackoutSource,
    type CollapseKind,
    type DestroySource,
    type PlaygroundEvents,
} from "@/lib/playground/events";
import type { HiddenCommand } from "@/lib/terminal/hidden";
import { isCurtainDown, raiseCurtain } from "./shared/curtain";
import type { TerminalBaseline } from "./terminal/Terminal";

// 各モードの本体は、初めて使うときに読み込む（初回表示のバンドルに入れない）
const loadTerminal = () => import("./terminal/Terminal");
const loadDestroyMode = () => import("./destroy/DestroyMode");
const loadBlackoutMode = () => import("./blackout/BlackoutMode");
// 崩壊・再起動・500 は同じ chunk（collapse/index.ts）。崩壊が始まった時点で、続きの画面も読み込み済みになる
const loadCollapse = () => import("./collapse");
const Terminal = dynamic(loadTerminal, { ssr: false });
const DestroyMode = dynamic(loadDestroyMode, { ssr: false });
const BlackoutMode = dynamic(loadBlackoutMode, { ssr: false });
const CollapseMode = dynamic(() => loadCollapse().then((m) => m.CollapseMode), { ssr: false });
// 読み込みを待つ間も画面を覆っておく（隠したページの抜け殻が見えないように）
const RebootScreen = dynamic(() => loadCollapse().then((m) => m.RebootScreen), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[10007] bg-black" />,
});
const OutageScreen = dynamic(() => loadCollapse().then((m) => m.OutageScreen), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[10007] bg-surface" />,
});

// フッターのボタンに hover / focus した時点で先読みする
export function preloadTerminal() {
    void loadTerminal();
}

export function preloadDestroyMode() {
    void loadDestroyMode();
}

export function preloadBlackoutMode() {
    void loadBlackoutMode();
}

export function openTerminal() {
    if (enter("terminal")) emit("terminal:open", {});
}

function closeTerminal() {
    exit("terminal");
    emit("terminal:close", {});
}

// ---- 破壊モード（フッターの「壊す」） ----------------------------------------------

let destroySource: DestroySource = "footer";

// ほかのモードが動いているときは何もしない
export function startDestroyMode(source: DestroySource) {
    if (enter("destroy")) destroySource = source;
}

function finishDestroyMode() {
    exit("destroy");
}

// ---- 停電モード（フッターの「停電」/ ターミナルの poweroff） ------------------------

let blackout: {
    point: { x: number; y: number } | null;
    startedAt: number;
    source: BlackoutSource;
    returnFocusTo?: Element | null; // poweroff のときだけ（ターミナルを開く前のフォーカス）
} = { point: null, startedAt: 0, source: "footer" };

// フッターの「停電」は、停電中にもう一度押すと解除する（暗闇はクリックを通すので押せる）
export function toggleBlackout(point: { x: number; y: number } | null) {
    if (getMode() === "blackout") {
        finishBlackout("footer");
        return;
    }
    if (!enter("blackout")) return;
    blackout = { point, startedAt: performance.now(), source: "footer" };
    emit("blackout:start", { source: "footer" });
}

function finishBlackout(trigger: BlackoutEndTrigger) {
    if (getMode() !== "blackout") return;
    exit("blackout");
    emit("blackout:end", { trigger, durationMs: performance.now() - blackout.startedAt });
}

// ---- ターミナルの隠しコマンド -----------------------------------------------------

let collapse: { kind: CollapseKind; pods: string[]; before: PageSnapshot | null; returnFocusTo: Element | null } | null = null;

function handleHiddenCommand(command: HiddenCommand, baseline: TerminalBaseline) {
    if (command.kind === "poweroff") {
        // ターミナルを閉じてから停電へ（間に idle を挟まないので、ほかの発動に割り込まれない）
        if (!transition("terminal", "blackout")) return;
        emit("terminal:close", {});
        blackout = { point: null, startedAt: performance.now(), source: "terminal", returnFocusTo: baseline.focus };
        emit("blackout:start", { source: "terminal" });
        return;
    }
    // ターミナルは開いたまま、背後のページが崩れはじめる
    if (!transition("terminal", "collapse")) return;
    collapse = {
        kind: command.kind,
        pods: command.kind === "pod-delete" ? command.pods : [],
        before: baseline.snapshot,
        returnFocusTo: baseline.focus,
    };
    emit("collapse:start", { kind: command.kind });
}

// ターミナルが崩れて閉じたら、rm -rf / は再起動へ、kubectl delete pod は 500 へ
function finishCollapse() {
    if (!collapse) return;
    emit("terminal:close", {});
    if (collapse.kind === "wipe") {
        transition("collapse", "reboot");
    } else if (transition("collapse", "outage")) {
        emit("outage:start", { pods: collapse.pods });
    }
}

function finishReboot(result: { skipped: boolean; restoreCheck?: string[] }) {
    collapse = null;
    exit("reboot");
    emit("wipe:done", result);
}

function finishOutage(result: { skipped: boolean; restoreCheck?: string[] }) {
    collapse = null;
    exit("outage");
    emit("outage:done", result);
}

// 入力中の文字として ` を打っているときは、ショートカットとして扱わない
function isEditable(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    return target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") !== null;
}

type SelfTestKind = "destroy" | CollapseKind;
type SelfTestResult = PlaygroundEvents["heal:done"] | PlaygroundEvents["wipe:done"] | PlaygroundEvents["outage:done"];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 開発時だけ使う自己テスト。演出を最後まで流し、ページが元通りに戻ったかを返す（playground/README.md）
async function selfTest(kind: SelfTestKind = "destroy", { skip = false } = {}): Promise<SelfTestResult> {
    if (kind === "destroy") {
        const done = new Promise<SelfTestResult>((resolve) => {
            const off = on("heal:done", (detail) => {
                off();
                resolve(detail);
            });
        });
        const offStart = on("destroy:start", () => {
            offStart();
            setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })), 1500);
        });
        startDestroyMode("footer");
        return done;
    }

    const doneEvent = kind === "wipe" ? "wipe:done" : "outage:done";
    const done = new Promise<SelfTestResult>((resolve) => {
        const off = on(doneEvent, (detail) => {
            off();
            resolve(detail);
        });
    });
    if (skip) {
        // 再起動 / 500 の画面が出たら Esc で飛ばす
        const unsubscribe = subscribe(() => {
            if (getMode() !== "reboot" && getMode() !== "outage") return;
            unsubscribe();
            setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })), 500);
        });
    }
    openTerminal();
    let input: HTMLInputElement | null = null;
    for (let i = 0; i < 100 && !input; i++) {
        await sleep(50);
        input = document.querySelector<HTMLInputElement>("[role='dialog'] input");
    }
    if (!input) throw new Error("terminal did not open");
    // React の制御されたinputに値を入れて Enter を押す
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
        input,
        kind === "wipe" ? "rm -rf /" : "kubectl delete pod demo",
    );
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(50);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    return done;
}

// layout.tsx に1つだけ置く。` キーの受付と、各モードの描画を受け持つ
export default function Playground() {
    const mode = useSyncExternalStore(subscribe, getMode, () => "idle" as const);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "`" || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
            if (isEditable(e.target)) return;
            if (getMode() !== "idle") return;
            e.preventDefault();
            openTerminal();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // 念のため: 何も動いていないのにページが隠れたままなら戻す（演出が途中で消えたときなど）
    useEffect(() => {
        if (mode === "idle" && isCurtainDown()) raiseCurtain();
    }, [mode]);

    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        const w = window as typeof window & { __playgroundSelfTest?: typeof selfTest };
        w.__playgroundSelfTest = selfTest;
        return () => {
            delete w.__playgroundSelfTest;
        };
    }, []);

    return (
        <>
            {/* 崩壊中もターミナルは開いたまま（同じ位置に置いて、作り直さない） */}
            {(mode === "terminal" || mode === "collapse") && (
                <Terminal
                    onClose={closeTerminal}
                    collapse={mode === "collapse" ? collapse : null}
                    onHiddenCommand={handleHiddenCommand}
                    onCollapseEnd={finishCollapse}
                />
            )}
            {mode === "collapse" && collapse && (
                <CollapseMode kind={collapse.kind} before={collapse.before} returnFocusTo={collapse.returnFocusTo} />
            )}
            {mode === "reboot" && <RebootScreen onDone={finishReboot} />}
            {mode === "outage" && collapse && <OutageScreen pods={collapse.pods} onDone={finishOutage} />}
            {mode === "destroy" && <DestroyMode source={destroySource} onDone={finishDestroyMode} />}
            {mode === "blackout" && (
                <BlackoutMode initialPoint={blackout.point} returnFocusTo={blackout.returnFocusTo} onExit={finishBlackout} />
            )}
        </>
    );
}
