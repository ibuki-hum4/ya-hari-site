"use client";

import { AnimatePresence, motion, type Target, type Transition } from "motion/react";
import { useCallback, useRef, useState, type ReactElement, type ReactNode } from "react";
import { LoadingOverlayContext } from "./context";
import { NavigationLoadingListener } from "./navigation-listener";

// ロードが終わってからもこの時間だけ画面に留まり、唐突に消えないようにする
const HOLD_DURATION_MS = 500;

type ExitTransition = {
    rest: Target;
    exit: Target;
    transition: Transition;
};

// フェードアウト・スライドアウト・アイリスアウトをランダムに選ぶ
const EXIT_TRANSITIONS: ExitTransition[] = [
    {
        rest: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5, ease: "easeInOut" },
    },
    {
        rest: { x: 0 },
        exit: { x: "-100%" },
        transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
    {
        rest: { x: 0 },
        exit: { x: "100%" },
        transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
    {
        rest: { y: "-100%" },
        exit: { y: "-100%" },
        transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
    },
    {
        rest: { clipPath: "circle(150% at 50% 50%)" },
        exit: { clipPath: "circle(0% at 50% 50%)" },
        transition: { duration: 0.7, ease: "easeInOut" },
    },
];

function pickExitTransition(): ExitTransition {
    return EXIT_TRANSITIONS[Math.floor(Math.random() * EXIT_TRANSITIONS.length)];
}

// 実際のオーバーレイは常駐コンポーネントとして持たせ、ページ遷移の開始・終了の合図を
// 受け取るたびに表示/退場アニメーションを切り替える（詳細は navigation-listener.tsx を参照）
export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
    const [screen, setScreen] = useState<ReactElement | null>(null);
    const [exitTransition, setExitTransition] = useState<ExitTransition>(EXIT_TRANSITIONS[0]);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const visible = useRef(false);

    const showLoadingOverlay = useCallback((next: ReactElement) => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        // 表示中に連続で遷移が始まっても、表示中の画面・退場演出を最後まで維持する（途中差し替えによるチラつき防止）
        if (visible.current) return;
        visible.current = true;
        setExitTransition(pickExitTransition());
        setScreen(next);
    }, []);

    const scheduleHideLoadingOverlay = useCallback(() => {
        hideTimer.current = setTimeout(() => {
            visible.current = false;
            setScreen(null);
            hideTimer.current = null;
        }, HOLD_DURATION_MS);
    }, []);

    return (
        <LoadingOverlayContext.Provider value={{ showLoadingOverlay, scheduleHideLoadingOverlay }}>
            <NavigationLoadingListener />
            {children}
            <AnimatePresence>
                {screen && (
                    <motion.div
                        key="loading-overlay"
                        className="fixed inset-0 z-[10000] bg-surface"
                        initial={false}
                        animate={exitTransition.rest}
                        exit={exitTransition.exit}
                        transition={exitTransition.transition}
                    >
                        {screen}
                    </motion.div>
                )}
            </AnimatePresence>
        </LoadingOverlayContext.Provider>
    );
}
