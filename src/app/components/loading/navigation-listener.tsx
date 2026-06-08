"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLoadingOverlay } from "./context";
import { getLoadingScreenById, pickLoadingScreen } from "./variants";

function findInternalAnchor(target: EventTarget | null): HTMLAnchorElement | null {
    let el = target instanceof Element ? target : null;
    while (el && !(el instanceof HTMLAnchorElement)) el = el.parentElement;
    if (!el || !el.href) return null;
    if (el.target && el.target !== "_self") return null;
    if (el.hasAttribute("download")) return null;

    let url: URL;
    try {
        url = new URL(el.href, window.location.href);
    } catch {
        return null;
    }
    if (url.origin !== window.location.origin) return null;
    return el;
}

// Suspenseのフォールバック表示はデータ取得の速さ(≒プリフェッチ済みかどうか)に左右されるため、
// 「ページ遷移のたびにロード演出が流れる」体験は保証できない。
// そこでデータ取得とは切り離し、遷移そのもの(クリック/履歴操作)を合図にオーバーレイを開閉する。
export function NavigationLoadingListener() {
    const pathname = usePathname();
    const { showLoadingOverlay, scheduleHideLoadingOverlay } = useLoadingOverlay();
    const navigatingRef = useRef(false);

    useEffect(() => {
        function startNavigation(targetPathname: string, loadId: string | null) {
            if (targetPathname === pathname) return;
            navigatingRef.current = true;
            showLoadingOverlay(getLoadingScreenById(loadId) ?? pickLoadingScreen());
        }

        function handleClick(event: MouseEvent) {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = findInternalAnchor(event.target);
            if (!anchor) return;
            const url = new URL(anchor.href, window.location.href);
            startNavigation(url.pathname, url.searchParams.get("load"));
        }

        function handlePopState() {
            const url = new URL(window.location.href);
            startNavigation(url.pathname, url.searchParams.get("load"));
        }

        document.addEventListener("click", handleClick);
        window.addEventListener("popstate", handlePopState);
        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [pathname, showLoadingOverlay]);

    useEffect(() => {
        if (!navigatingRef.current) return;
        navigatingRef.current = false;
        scheduleHideLoadingOverlay();
    }, [pathname, scheduleHideLoadingOverlay]);

    // ?load=<id> を直接開いた場合のプレビュー用（例: /?load=netflix）
    useEffect(() => {
        const loadId = new URLSearchParams(window.location.search).get("load");
        const screen = getLoadingScreenById(loadId);
        if (!screen) return;
        showLoadingOverlay(screen);
        scheduleHideLoadingOverlay();
    }, [showLoadingOverlay, scheduleHideLoadingOverlay]);

    return null;
}
