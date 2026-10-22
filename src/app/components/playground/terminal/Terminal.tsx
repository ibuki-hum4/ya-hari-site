"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { ogpQueryKey, type OGPData } from "@/data/links";
import { COLLAPSE_MS, createRandom } from "@/lib/collapse/collapse";
import { logCount, podEventLog, wipeLog } from "@/lib/collapse/logs";
import { takeSnapshot, type PageSnapshot } from "@/lib/destroy/snapshot";
import { emit, type CollapseKind } from "@/lib/playground/events";
import { buildFs } from "@/lib/terminal/build-fs";
import { complete } from "@/lib/terminal/complete";
import type { HiddenCommand } from "@/lib/terminal/hidden";
import { parseRss } from "@/lib/terminal/rss";
import { execute } from "@/lib/terminal/shell";
import { collectSiteContent, terminalStrings, type Messages } from "@/lib/terminal/site-content";
import { findPageRoot } from "../shared/collect";

// ターミナルを開く前のページ。隠しコマンドの演出のあと、ここへ戻ったかを比べ、フォーカスを戻す
export type TerminalBaseline = { snapshot: PageSnapshot | null; focus: Element | null };

type Props = {
    onClose: () => void;
    // 隠しコマンドで崩壊中なら、その種類（rm -rf / か kubectl delete pod か）
    collapse: { kind: CollapseKind; pods: string[] } | null;
    onHiddenCommand: (command: HiddenCommand, baseline: TerminalBaseline) => void;
    // ログを流し終え、ターミナル自体が崩れて閉じたとき
    onCollapseEnd: () => void;
};

const LOG_TICK_MS = 40;

type Line = { id: number; kind: "command" | "out" | "err" | "info"; text: string };

const USER = "guest";
const HOST = "ya-hari";
const MAX_LINES = 1000;

// 閉じても次に開いたとき続きから使えるよう、出力と履歴はモジュールに持つ（リロードで消える）
const session = { lines: [] as Line[], history: [] as string[], nextId: 0, startedAt: new Date() };

const makeLine = (kind: Line["kind"], text: string): Line => ({
    id: session.nextId++,
    kind,
    text: text.endsWith("\n") ? text.slice(0, -1) : text,
});

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

// 出力中の URL を本物のリンクにする。サイト外は新しいタブで開く
function Linkified({ text }: { text: string }) {
    const parts = text.split(URL_PATTERN);
    return (
        <>
            {parts.map((part, i) => {
                if (i % 2 === 0) return part;
                const external = new URL(part).origin !== window.location.origin;
                return (
                    <a
                        key={i}
                        href={part}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="underline underline-offset-2 hover:opacity-70"
                    >
                        {part}
                    </a>
                );
            })}
        </>
    );
}

function Prompt() {
    return (
        <span aria-hidden="true" className="shrink-0 select-none">
            <span className="font-bold text-ink">{USER}@{HOST}</span>
            <span className="text-muted">:~$&nbsp;</span>
        </span>
    );
}

// スマホのソフトキーボードで隠れないよう、見えている範囲（visualViewport）に合わせる
function useMobileViewportBox() {
    const [box, setBox] = useState<{ top: number; height: number } | null>(null);
    useEffect(() => {
        const viewport = window.visualViewport;
        const small = window.matchMedia("(max-width: 639px)");
        if (!viewport) return;
        const update = () =>
            setBox(small.matches ? { top: viewport.offsetTop + 8, height: viewport.height - 16 } : null);
        update();
        viewport.addEventListener("resize", update);
        viewport.addEventListener("scroll", update);
        small.addEventListener("change", update);
        return () => {
            viewport.removeEventListener("resize", update);
            viewport.removeEventListener("scroll", update);
            small.removeEventListener("change", update);
        };
    }, []);
    return box;
}

export default function Terminal({ onClose, collapse, onHiddenCommand, onCollapseEnd }: Props) {
    const t = useTranslations("terminal");
    const messages = useMessages() as unknown as Messages;
    const locale = useLocale();
    const queryClient = useQueryClient();

    // ブログは既存の RSS から読む（サーバー側の処理は増やさない）
    const feed = useQuery({
        queryKey: ["terminal", "feed"],
        queryFn: async () => {
            const res = await fetch("/feed.xml");
            if (!res.ok) throw new Error("Failed to fetch feed");
            return parseRss(await res.text());
        },
        staleTime: Infinity,
        retry: 1,
    });

    const fs = useMemo(
        () =>
            buildFs(
                collectSiteContent({
                    messages,
                    locale,
                    siteUrl: window.location.origin,
                    blog: feed.data ?? (feed.isError ? "error" : "loading"),
                    ogp: (url) => queryClient.getQueryData<OGPData>(ogpQueryKey(url)),
                }),
                session.startedAt,
            ),
        [messages, locale, feed.data, feed.isError, queryClient],
    );

    const [lines, setLinesState] = useState<Line[]>(() =>
        session.lines.length > 0 ? session.lines : [makeLine("info", t("welcome"))],
    );
    const setLines = (update: (prev: Line[]) => Line[]) =>
        setLinesState((prev) => {
            const next = update(prev).slice(-MAX_LINES);
            session.lines = next;
            return next;
        });

    const [input, setInput] = useState("");
    const historyIndex = useRef<number | null>(null);
    const draft = useRef("");
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const viewportBox = useMobileViewportBox();
    // Radix は Dialog.Trigger にフォーカスを戻すが、ここは ` キーやフッターから開くので Trigger が無い
    // 開く直前にフォーカスがあった要素を覚えておき、閉じたらそこへ戻す
    // （Radix がページに aria-hidden などを付ける前に、ページの状態も控えておく）
    const [baseline] = useState<TerminalBaseline>(() => {
        const root = findPageRoot();
        return {
            focus: document.activeElement,
            snapshot: process.env.NODE_ENV !== "production" && root ? takeSnapshot(root) : null,
        };
    });
    const returnFocusTo = baseline.focus;
    // 隠しコマンドで次の演出（停電・崩壊）へ引き継いだら、フォーカスを戻すのは引き継いだ側に任せる
    const handedOver = useRef(false);
    const onCollapseEndRef = useRef(onCollapseEnd);
    useEffect(() => {
        onCollapseEndRef.current = onCollapseEnd;
    });

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }, [lines]);

    // 崩壊中: ログを高速で流し、最後はターミナル自体が崩れて閉じる
    useEffect(() => {
        if (!collapse) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const random = createRandom(Math.floor(Math.random() * 2 ** 31));
        const log = collapse.kind === "wipe"
            ? wipeLog(logCount(150, reducedMotion), random)
            : podEventLog(logCount(120, reducedMotion), collapse.pods, random);
        // 崩れはじめる少し前に流し終える
        const perTick = Math.max(1, Math.ceil(log.length / ((COLLAPSE_MS - 300) / LOG_TICK_MS)));
        let index = 0;
        const stream = setInterval(() => {
            const batch = log.slice(index, index + perTick);
            index += perTick;
            setLines((prev) => [
                ...prev,
                ...batch.map((line) => makeLine(/^rm: |^\S+\s+Warning/.test(line) ? "err" : "out", line)),
            ]);
            if (index >= log.length) clearInterval(stream);
        }, LOG_TICK_MS);

        let crumble: Animation | null = null;
        const timer = setTimeout(() => {
            const el = contentRef.current;
            const end = () => {
                // 再起動 / Pod の作り直しのあとなので、次に開いたときは画面をまっさらにする
                session.lines = [];
                onCollapseEndRef.current();
            };
            if (!el) return end();
            crumble = reducedMotion
                ? el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
                : el.animate(
                    [
                        { transform: "none", opacity: 1, filter: "none" },
                        { transform: "translate(-6px, 2px) skewX(6deg)", filter: "hue-rotate(90deg)", offset: 0.1 },
                        { transform: "translate(5px, -3px) skewX(-8deg)", filter: "invert(1)", offset: 0.2 },
                        { transform: "translate(-2px, 0) skewX(3deg)", filter: "none", offset: 0.3 },
                        { transform: "translateY(70vh) rotate(9deg)", opacity: 0, filter: "blur(2px)" },
                    ],
                    { duration: 800, easing: "cubic-bezier(.5, 0, .9, .4)", fill: "forwards" },
                );
            crumble.finished.then(end, end);
        }, COLLAPSE_MS);

        return () => {
            clearInterval(stream);
            clearTimeout(timer);
            crumble?.cancel();
        };
    }, [collapse]);

    const setInputWithCursor = (value: string, cursor = value.length) => {
        setInput(value);
        requestAnimationFrame(() => inputRef.current?.setSelectionRange(cursor, cursor));
    };

    const run = () => {
        const command = input;
        setInput("");
        historyIndex.current = null;

        if (command.trim() === "") {
            setLines((prev) => [...prev, makeLine("command", command)]);
            return;
        }
        // bash と同じく、history の出力には実行中のコマンド自身も含める
        session.history.push(command);
        const result = execute(command, {
            fs,
            history: session.history,
            strings: terminalStrings(messages),
            now: new Date(),
            user: USER,
        });
        emit("terminal:command", { command, exitCode: result.code });

        if (result.effect === "clear") {
            setLines(() => []);
            return;
        }
        setLines((prev) => [
            ...prev,
            makeLine("command", command),
            ...result.chunks.map((chunk) => makeLine(chunk.stream, chunk.text)),
        ]);
        // 隠しコマンド: poweroff は閉じて停電、rm -rf / と kubectl delete pod はこのまま崩壊へ
        if (result.effect) {
            handedOver.current = true;
            onHiddenCommand(result.effect, baseline);
        }
    };

    const runCompletion = () => {
        const cursor = inputRef.current?.selectionStart ?? input.length;
        const result = complete(input, cursor, fs);
        if (result.candidates.length > 0) {
            setLines((prev) => [...prev, makeLine("command", input), makeLine("out", result.candidates.join("  "))]);
        } else if (result.line !== input) {
            setInputWithCursor(result.line, result.cursor);
        }
    };

    const showPrevious = () => {
        const { history } = session;
        if (history.length === 0) return;
        if (historyIndex.current === null) {
            draft.current = input;
            historyIndex.current = history.length - 1;
        } else if (historyIndex.current > 0) {
            historyIndex.current--;
        }
        setInputWithCursor(history[historyIndex.current]);
    };

    const showNext = () => {
        const { history } = session;
        if (historyIndex.current === null) return;
        if (historyIndex.current < history.length - 1) {
            historyIndex.current++;
            setInputWithCursor(history[historyIndex.current]);
        } else {
            historyIndex.current = null;
            setInputWithCursor(draft.current);
        }
    };

    const interrupt = () => {
        setLines((prev) => [...prev, makeLine("command", `${input}^C`)]);
        setInput("");
        historyIndex.current = null;
    };

    const clearScreen = () => setLines(() => []);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // window で全キーを拾うページ（tools/yardle など）に、ターミナルへの入力を渡さない
        e.stopPropagation();
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        // 崩壊中は何も受け付けない
        if (collapse) {
            e.preventDefault();
            return;
        }

        const plain = !e.ctrlKey && !e.metaKey && !e.altKey;
        if (e.key === "`" && plain) {
            e.preventDefault();
            onClose();
        } else if (e.key === "Enter" && plain) {
            e.preventDefault();
            run();
        } else if (e.key === "Tab" && plain && !e.shiftKey) {
            e.preventDefault();
            runCompletion();
        } else if (e.key === "ArrowUp" && plain) {
            e.preventDefault();
            showPrevious();
        } else if (e.key === "ArrowDown" && plain) {
            e.preventDefault();
            showNext();
        } else if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            clearScreen();
        } else if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "c") {
            // 文字を選択しているときは普通のコピーにする
            const el = e.currentTarget;
            if (el.selectionStart !== el.selectionEnd || window.getSelection()?.toString()) return;
            e.preventDefault();
            interrupt();
        }
    };

    // 出力欄をタップしたら入力欄へ。ただし文字を選択したときは邪魔しない
    const focusInput = () => {
        if (window.getSelection()?.toString()) return;
        inputRef.current?.focus({ preventScroll: true });
    };

    const keys: { label: string; title: string; action: () => void }[] = [
        { label: "Tab", title: t("keys.tab"), action: runCompletion },
        { label: "↑", title: t("keys.prev"), action: showPrevious },
        { label: "↓", title: t("keys.next"), action: showNext },
        { label: "^C", title: t("keys.interrupt"), action: interrupt },
        { label: "^L", title: t("keys.clear"), action: clearScreen },
    ];

    const body: ReactNode = lines.map((line) => (
        <div
            key={line.id}
            className={`whitespace-pre-wrap break-words ${
                line.kind === "err" ? "text-red-500" : line.kind === "info" ? "text-muted" : "text-ink"
            }`}
        >
            {line.kind === "command" ? (
                <>
                    <Prompt />
                    {line.text}
                </>
            ) : (
                <Linkified text={line.text} />
            )}
        </div>
    ));

    return (
        // 崩壊中は Esc や外側のクリックでも閉じない（最後にターミナル自体が崩れて閉じる）
        <DialogPrimitive.Root open onOpenChange={(open) => !open && !collapse && onClose()}>
            <DialogPrimitive.Portal>
                {/* 崩壊中は背後のページが壊れていく様子を見せるため、暗くもぼかしもしない */}
                <DialogPrimitive.Overlay
                    className={`fixed inset-0 z-[10001] transition-[background-color,backdrop-filter] duration-300 ${
                        collapse ? "bg-transparent" : "bg-ink/40 backdrop-blur-sm"
                    }`}
                />
                <DialogPrimitive.Content
                    ref={contentRef}
                    aria-describedby={undefined}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        inputRef.current?.focus();
                    }}
                    onCloseAutoFocus={(e) => {
                        e.preventDefault();
                        if (handedOver.current) return;
                        if (returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) {
                            returnFocusTo.focus({ preventScroll: true });
                        }
                    }}
                    style={viewportBox ?? undefined}
                    className="fixed z-[10002] inset-x-2 top-2 bottom-2 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-ink shadow-2xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(36rem,calc(100dvh-4rem))] sm:w-[min(48rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2"
                >
                    {/* タイトルバー */}
                    <div className="flex items-center gap-3 border-b border-line bg-surface-alt px-4 py-2.5">
                        <span aria-hidden="true" className="flex gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-line" />
                            <span className="h-3 w-3 rounded-full bg-line" />
                            <span className="h-3 w-3 rounded-full bg-line" />
                        </span>
                        <DialogPrimitive.Title className="flex-1 truncate text-center font-mono text-xs text-muted">
                            <span className="sr-only">{t("title")} — </span>
                            {USER}@{HOST}: ~
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close
                            className="text-muted transition-opacity hover:opacity-70"
                            aria-label={t("close")}
                        >
                            <FiX size={18} />
                        </DialogPrimitive.Close>
                    </div>

                    {/* 出力と入力行 */}
                    <div
                        ref={scrollRef}
                        onClick={focusInput}
                        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed sm:text-sm"
                    >
                        <div role="log" aria-label={t("outputLabel")}>
                            {body}
                        </div>
                        {/* 本物のシェルと同じく、コマンドの実行中（崩壊中）はプロンプトを出さない */}
                        <div className={collapse ? "hidden" : "flex items-baseline"}>
                            <Prompt />
                            <input
                                ref={inputRef}
                                value={input}
                                readOnly={!!collapse}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    historyIndex.current = null;
                                }}
                                onKeyDown={handleKeyDown}
                                aria-label={t("inputLabel")}
                                autoComplete="off"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="send"
                                className="min-w-0 flex-1 bg-transparent text-ink caret-ink outline-none"
                            />
                        </div>
                    </div>

                    {/* スマホ用の補助キー（Tab や矢印キーが無いため） */}
                    <div className="hidden gap-2 overflow-x-auto border-t border-line bg-surface-alt px-3 py-2 pointer-coarse:flex">
                        {keys.map(({ label, title, action }) => (
                            <button
                                key={label}
                                type="button"
                                title={title}
                                aria-label={title}
                                // 押してもフォーカスを入力欄から奪わない（キーボードを閉じさせない）
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    action();
                                    inputRef.current?.focus({ preventScroll: true });
                                }}
                                className="shrink-0 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted active:bg-ink/5"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
