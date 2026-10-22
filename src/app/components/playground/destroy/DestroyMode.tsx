"use client";

import type MatterNS from "matter-js";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuWrench } from "react-icons/lu";
import { toast } from "sonner";
import { formatSeconds } from "@/lib/destroy/heal";
import type { DestroySource } from "@/lib/playground/events";
import { startDestroy, type DestroyController, type HealStep } from "./controller";

// クリックした要素を砕くハンマーのカーソル（左上の打撃面がホットスポット）
const HAMMER_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>" +
        "<g transform='rotate(-45 16 16)'>" +
        "<rect x='14.5' y='11' width='3' height='19' rx='1.5' fill='#a16207' stroke='#1a1a1a'/>" +
        "<rect x='7' y='4' width='18' height='8' rx='1.5' fill='#d4d4d4' stroke='#1a1a1a'/>" +
        "</g></svg>",
)}") 6 6, crosshair`;

type Props = {
    source: DestroySource;
    onDone: () => void;
};

export default function DestroyMode({ source, onDone }: Props) {
    const t = useTranslations("destroy");
    const layerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hitRef = useRef<HTMLDivElement>(null);
    const healButtonRef = useRef<HTMLButtonElement>(null);
    const controller = useRef<DestroyController | null>(null);

    const [count, setCount] = useState<{ destroyed: number; total: number } | null>(null);
    const [healing, setHealing] = useState(false);
    const [log, setLog] = useState<HealStep[]>([]);

    useEffect(() => {
        let cancelled = false;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        (async () => {
            // 物理演算は破壊モードに入ったときだけ読み込む。reduced motion では使わない
            const matter = reducedMotion
                ? null
                : await import("matter-js").then((mod) => ((mod as { default?: typeof MatterNS }).default ?? mod) as typeof MatterNS);
            // 1フレーム待つ（StrictMode の effect 二重実行で二重に始めないため）
            await new Promise((resolve) => setTimeout(resolve, 16));
            if (cancelled || !layerRef.current || !canvasRef.current || !hitRef.current) return;

            controller.current = startDestroy({
                layer: layerRef.current,
                canvas: canvasRef.current,
                hit: hitRef.current,
                matter,
                reducedMotion,
                source,
                callbacks: {
                    onStart: (total) => {
                        setCount({ destroyed: 0, total });
                        healButtonRef.current?.focus({ preventScroll: true });
                    },
                    onShatter: (destroyed, total) => setCount({ destroyed, total }),
                    onHealStart: () => setHealing(true),
                    onHealLog: (step) => setLog((prev) => [...prev, step]),
                    onFinished: ({ destroyed, total, healMs }) => {
                        if (total === 0) toast(t("nothing"));
                        else toast(t("result", { destroyed, seconds: formatSeconds(healMs) }));
                        onDone();
                    },
                },
            });
        })();

        return () => {
            cancelled = true;
            controller.current?.dispose();
        };
        // 破壊モードは1回のマウントにつき1回だけ動かす
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <>
            {/* 複製・粉・ポインタの層。読み上げには出さない（本物のページは inert で隠れている） */}
            <div aria-hidden="true" className="fixed inset-0 z-[10003]">
                <div ref={layerRef} inert className="absolute inset-0 overflow-hidden" />
                <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
                <div
                    ref={hitRef}
                    className="absolute inset-0 select-none"
                    style={{ cursor: healing ? "progress" : HAMMER_CURSOR, touchAction: "none" }}
                />
            </div>

            {/* 操作パネル */}
            <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[10004] flex flex-col items-center gap-3 px-4">
                {log.length > 0 && (
                    <div
                        role="status"
                        className="pointer-events-auto rounded-2xl border border-line bg-surface/90 px-5 py-3 font-mono text-sm text-ink shadow-lg backdrop-blur-md"
                    >
                        {log.map((step) => (
                            <p key={step}>{t(`log.${step}`)}</p>
                        ))}
                    </div>
                )}
                {count && count.total > 0 && (
                    <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-surface/90 py-2 pl-5 pr-2 shadow-lg backdrop-blur-md">
                        <span className="hidden text-sm text-muted sm:inline pointer-coarse:hidden">{t("hint")}</span>
                        <span className="hidden text-sm text-muted pointer-coarse:inline">{t("hintTouch")}</span>
                        <span className="font-mono text-sm tabular-nums text-ink" aria-label={t("count", count)}>
                            {count.destroyed}/{count.total}
                        </span>
                        <button
                            ref={healButtonRef}
                            type="button"
                            onClick={() => controller.current?.heal("button")}
                            disabled={healing}
                            className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2 text-sm text-surface transition-all duration-200 select-none hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <LuWrench size={16} aria-hidden="true" />
                            {t("heal")}
                        </button>
                    </div>
                )}
            </div>

            <p role="status" className="sr-only">
                {count && count.total > 0 && !healing ? t("announce") : ""}
            </p>
        </>,
        document.body,
    );
}
