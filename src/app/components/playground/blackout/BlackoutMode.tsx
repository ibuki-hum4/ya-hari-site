"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuLightbulb } from "react-icons/lu";
import { FLICKER_MS, flickerKeyframes, lightRadius, spotlightBackground } from "@/lib/blackout/spotlight";
import type { BlackoutEndTrigger } from "@/lib/playground/events";

type Point = { x: number; y: number };

type Props = {
    initialPoint: Point | null; // フッターのボタンをクリックした位置（キーボードで押したときは null）
    // 解除したらフォーカスを戻す先。poweroff のときはターミナルを開く前の場所（省略時は今のフォーカス）
    returnFocusTo?: Element | null;
    onExit: (trigger: BlackoutEndTrigger) => void;
};

// 暗闇のレイヤーは pointer-events: none なので、停電中もリンクやボタンは普通に押せる
// ページには何も書き換えない（フォーカスだけ「電気をつける」へ移し、終わったら戻す）
export default function BlackoutMode({ initialPoint, returnFocusTo: handedFocus, onExit }: Props) {
    const t = useTranslations("blackout");
    const layerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const layer = layerRef.current;
        const button = buttonRef.current;
        if (!layer) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const returnFocusTo = handedFocus !== undefined ? handedFocus : document.activeElement;

        let radius = lightRadius({ width: window.innerWidth, height: window.innerHeight });
        let position: Point = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        let raf = 0;
        const paint = () => {
            raf = 0;
            layer.style.background = spotlightBackground(position.x, position.y, radius);
        };
        const moveTo = (x: number, y: number) => {
            position = { x, y };
            if (!raf) raf = requestAnimationFrame(paint);
        };

        // キーボードで移動したときは、フォーカスした要素を照らす（スクロールしても追いかける）
        let focused: Element | null = null;
        const lightFocused = () => {
            if (!focused || focused === document.body || !focused.isConnected) return;
            const rect = focused.getBoundingClientRect();
            moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2);
        };
        const onFocusIn = (e: FocusEvent) => {
            focused = e.target instanceof Element ? e.target : null;
            lightFocused();
        };
        // マウス・ペンはカーソルの位置。タッチはスクロール中も追えるよう touch イベントで取る
        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            focused = null;
            moveTo(e.clientX, e.clientY);
        };
        const onTouch = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;
            focused = null;
            moveTo(touch.clientX, touch.clientY);
        };
        const onResize = () => {
            radius = lightRadius({ width: window.innerWidth, height: window.innerHeight });
            paint();
        };
        // ダイアログなどが Esc を先に使ったとき（defaultPrevented）は、停電を解除しない
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape" || e.defaultPrevented) return;
            e.preventDefault();
            onExit("escape");
        };

        window.addEventListener("focusin", onFocusIn);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("touchstart", onTouch, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });
        window.addEventListener("scroll", lightFocused, { passive: true });
        window.addEventListener("resize", onResize);
        window.addEventListener("keydown", onKeyDown);

        // キーボードだけでもすぐ抜けられるよう、フォーカスを「電気をつける」へ移す
        button?.focus({ preventScroll: true });
        if (initialPoint) {
            focused = null;
            moveTo(initialPoint.x, initialPoint.y);
        }
        paint();
        if (!reducedMotion) layer.animate(flickerKeyframes, { duration: FLICKER_MS, easing: "linear" });

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("focusin", onFocusIn);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("touchmove", onTouch);
            window.removeEventListener("scroll", lightFocused);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("keydown", onKeyDown);
            // 停電中にほかの場所へ移っていたら、そちらを尊重して戻さない
            const active = document.activeElement;
            const stillOnOurButton = !active || active === document.body || active === button;
            if (stillOnOurButton && returnFocusTo instanceof HTMLElement && returnFocusTo.isConnected) {
                returnFocusTo.focus({ preventScroll: true });
            }
        };
        // 停電は1回のマウントにつき1回だけ
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <>
            <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[10005]" />
            <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[10006] flex justify-center px-4">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => onExit("button")}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm text-ink shadow-[0_0_32px_6px_rgba(255,255,255,0.25)] transition-opacity duration-200 select-none hover:opacity-80"
                >
                    <LuLightbulb size={16} aria-hidden="true" />
                    {t("lightsOn")}
                </button>
            </div>
            <p role="status" className="sr-only">{t("announce")}</p>
        </>,
        document.body,
    );
}
