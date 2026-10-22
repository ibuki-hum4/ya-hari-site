"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bootLog } from "@/lib/collapse/logs";
import { raiseCurtain } from "../shared/curtain";

const LINE_MS = 120; // ブートログを1行ずつ出す間隔
const HOLD_MS = 600; // 最後の行を見せてから戻るまで
const FADE_MS = 400;

type Props = {
    onDone: (result: { skipped: boolean; restoreCheck?: string[] }) => void;
};

// rm -rf / のあと。真っ黒な画面に systemd 風のブートログが流れ、終わったら元のページに戻る
export default function RebootScreen({ onDone }: Props) {
    const t = useTranslations("reboot");
    const [lines, setLines] = useState<string[]>([]);
    const [fading, setFading] = useState(false);
    const finished = useRef(false);
    const onDoneRef = useRef(onDone);
    useEffect(() => {
        onDoneRef.current = onDone;
    });

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const log = bootLog(reducedMotion);
        const timers: ReturnType<typeof setTimeout>[] = [];

        // 幕を上げてからフェードアウトするので、下から元のページが見えてくる
        const finish = (skipped: boolean) => {
            if (finished.current) return;
            finished.current = true;
            timers.forEach(clearTimeout);
            const { restoreCheck } = raiseCurtain();
            setFading(true);
            timers.push(setTimeout(() => onDoneRef.current({ skipped, restoreCheck }), skipped ? 150 : FADE_MS));
        };

        log.forEach((_, i) => {
            timers.push(setTimeout(() => setLines(log.slice(0, i + 1)), (i + 1) * LINE_MS));
        });
        timers.push(setTimeout(() => finish(false), (log.length + 1) * LINE_MS + HOLD_MS));

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            finish(true);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            timers.forEach(clearTimeout);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return createPortal(
        <div
            className="fixed inset-0 z-[10007] overflow-hidden bg-black p-4 font-mono text-xs leading-relaxed text-neutral-300 transition-opacity sm:p-8 sm:text-sm"
            style={{ opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
        >
            <div aria-hidden="true">
                {lines.map((line, i) => (
                    <p key={i} className="min-h-[1lh] whitespace-pre-wrap break-all">
                        {line.startsWith("[  OK  ]") ? (
                            <>
                                [<span className="text-green-500">  OK  </span>]{line.slice(8)}
                            </>
                        ) : line.startsWith("Welcome") ? (
                            <span className="text-white">{line}</span>
                        ) : (
                            line
                        )}
                    </p>
                ))}
                <span className="inline-block h-4 w-2 animate-pulse bg-neutral-300 align-middle motion-reduce:animate-none" />
            </div>
            <p className="absolute bottom-4 right-4 text-[10px] text-neutral-500 sm:text-xs">{t("skip")}</p>
            <p role="status" className="sr-only">{t("announce")}</p>
        </div>,
        document.body,
    );
}
