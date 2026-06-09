"use client";

import { AnimatePresence, motion, type Target, type Transition } from "motion/react";
import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactElement,
    type ReactNode,
} from "react";

// ロードが終わってからもこの時間だけ画面に留まり、唐突に消えないようにする
const HOLD_DURATION_MS = 1000;

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
        rest: { y: 0 },
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

interface LoadingOverlayContextValue {
    showLoadingOverlay: (screen: ReactElement) => void;
    scheduleHideLoadingOverlay: () => void;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

export function useLoadingOverlay() {
    const ctx = useContext(LoadingOverlayContext);
    if (!ctx) throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
    return ctx;
}

// `loading.tsx`(Suspenseフォールバック)が表示・消滅するタイミングを合図として受け取り、
// 実際のオーバーレイはSuspenseの外側(常駐コンポーネント)で表示することで、
// 消える瞬間に好きなだけ退場アニメーションを再生できるようにする
export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
    const [screen, setScreen] = useState<ReactElement | null>(null);
    const [exitTransition, setExitTransition] = useState<ExitTransition>(EXIT_TRANSITIONS[0]);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showLoadingOverlay = useCallback((next: ReactElement) => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setExitTransition(pickExitTransition());
        setScreen(next);
    }, []);

    const scheduleHideLoadingOverlay = useCallback(() => {
        hideTimer.current = setTimeout(() => {
            setScreen(null);
            hideTimer.current = null;
        }, HOLD_DURATION_MS);
    }, []);

    return (
        <LoadingOverlayContext.Provider value={{ showLoadingOverlay, scheduleHideLoadingOverlay }}>
            {children}
            <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none">
                <AnimatePresence>
                    {screen && (
                        <motion.div
                            key="loading-overlay"
                            className="absolute inset-0 bg-surface pointer-events-auto"
                            initial={false}
                            animate={exitTransition.rest}
                            exit={exitTransition.exit}
                            transition={exitTransition.transition}
                        >
                            {screen}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LoadingOverlayContext.Provider>
    );
}
