"use client";

import { useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "./loading/overlay";
import { pickLoadingScreen, getLoadingScreenById } from "./loading/variants";

// useLayoutEffect はペイント前に同期実行されるためオーバーレイが必ず初回描画に含まれる。
// ただし Next.js の SSR では useLayoutEffect は警告が出るため、サーバー側は useEffect で代替。
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function NavigationProgress() {
    const { showLoadingOverlay, scheduleHideLoadingOverlay } = useLoadingOverlay();
    const searchParams = useSearchParams();

    // ① ページの初回ペイント前にオーバーレイを表示（useLayoutEffect）
    useIsomorphicLayoutEffect(() => {
        const id = searchParams.get("load");
        const screen = (id ? getLoadingScreenById(id) : undefined) ?? pickLoadingScreen();
        showLoadingOverlay(screen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ② 初回ペイント後にタイマーを起動（useEffect）
    useEffect(() => {
        scheduleHideLoadingOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
