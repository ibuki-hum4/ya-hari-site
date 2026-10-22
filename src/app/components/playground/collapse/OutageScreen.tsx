"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiServer } from "react-icons/fi";
import { podRestartLog } from "@/lib/collapse/logs";
import { raiseCurtain } from "../shared/curtain";

const OUTAGE_MS = 5000; // 500 を見せておく時間
const RESTART_LINE_MS = 180; // 復活のログを1行ずつ出す間隔
const FADE_MS = 400;

type Props = {
    pods: string[];
    onDone: (result: { skipped: boolean; restoreCheck?: string[] }) => void;
};

// kubectl delete pod のあと。ページ全体をサイトの 500 ページと同じ見た目で覆い、5 秒後に Pod が立ち直って戻る
// 見た目だけの演出で、HTTP ステータス・URL・タイトルは変えない
export default function OutageScreen({ pods, onDone }: Props) {
    const t = useTranslations("outage");
    const te = useTranslations("error");
    const [remaining, setRemaining] = useState(OUTAGE_MS);
    const [restartLines, setRestartLines] = useState<string[]>([]);
    const [fading, setFading] = useState(false);
    const finished = useRef(false);
    const onDoneRef = useRef(onDone);
    useEffect(() => {
        onDoneRef.current = onDone;
    });

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        const startedAt = performance.now();
        const restart = podRestartLog(pods);

        const finish = (skipped: boolean) => {
            if (finished.current) return;
            finished.current = true;
            timers.forEach(clearTimeout);
            clearInterval(countdown);
            const { restoreCheck } = raiseCurtain();
            setFading(true);
            timers.push(setTimeout(() => onDoneRef.current({ skipped, restoreCheck }), skipped ? 150 : FADE_MS));
        };

        const countdown = setInterval(() => {
            const left = Math.max(0, OUTAGE_MS - (performance.now() - startedAt));
            setRemaining(left);
            if (left > 0) return;
            clearInterval(countdown);
            // Pod が立ち直るまでのログを流してから戻る
            restart.forEach((_, i) => {
                timers.push(setTimeout(() => setRestartLines(restart.slice(0, i + 1)), (i + 1) * RESTART_LINE_MS));
            });
            timers.push(setTimeout(() => finish(false), (restart.length + 2) * RESTART_LINE_MS));
        }, 100);

        // Esc で飛ばせる（キーボードの人を 5 秒閉じ込めない）
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            finish(true);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            timers.forEach(clearTimeout);
            clearInterval(countdown);
            window.removeEventListener("keydown", onKeyDown);
        };
        // 1回のマウントにつき1回だけ
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const recovering = remaining <= 0;
    const running = restartLines.length === podRestartLog(pods).length;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="outage-title"
            className="fixed inset-0 z-[10007] flex items-center justify-center overflow-y-auto bg-surface px-6 py-10 text-ink transition-opacity"
            style={{ opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
        >
            <div className="w-full max-w-xl text-center">
                {/* app/500 と同じ見た目（薄い大きな数字にアイコンを重ねる） */}
                <div className="relative mb-6" aria-hidden="true">
                    <p className="select-none text-[120px] font-bold leading-none text-ink/5 md:text-[180px]">500</p>
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        <FiServer className={recovering ? "text-muted" : "text-red-500"} />
                    </div>
                </div>
                <h2 id="outage-title" className="mb-3 text-2xl font-bold md:text-3xl">
                    500 {t("title")}
                </h2>
                <p className="mx-auto mb-8 max-w-md text-muted">{te("serverError.description")}</p>

                <div className="mb-6 overflow-x-auto rounded-2xl border border-line bg-surface-alt p-4 text-left font-mono text-xs leading-relaxed sm:text-sm">
                    <p className="text-muted">$ kubectl get pods</p>
                    <p className="whitespace-pre text-muted">{"NAME".padEnd(28)}READY   STATUS{" ".repeat(12)}RESTARTS</p>
                    {pods.map((pod) => (
                        <p key={pod} className="whitespace-pre">
                            {pod.padEnd(28)}
                            {running ? "1/1     " : "0/1     "}
                            <span className={running ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                                {(running ? "Running" : "CrashLoopBackOff").padEnd(18)}
                            </span>
                            {running ? "4" : "3"}
                        </p>
                    ))}
                    {restartLines.map((line, i) => (
                        <p key={i} className="whitespace-pre-wrap break-all">{line}</p>
                    ))}
                </div>

                {/* 残り時間 */}
                <div className="mx-auto max-w-xs" aria-hidden="true">
                    <div className="mb-2 h-1 overflow-hidden rounded-full bg-line">
                        <div
                            className="h-full bg-ink transition-[width] duration-100 ease-linear"
                            style={{ width: `${(1 - remaining / OUTAGE_MS) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted">
                        {recovering ? t("recovering") : t("countdown", { seconds: Math.ceil(remaining / 1000) })}
                        {" · "}
                        {t("skip")}
                    </p>
                </div>
            </div>
            <p role="status" className="sr-only">{t("announce")}</p>
        </div>,
        document.body,
    );
}
