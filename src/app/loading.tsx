"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "./components/loading/overlay";
import { getLoadingScreenById, pickLoadingScreen } from "./components/loading/variants";

// ?load=<id> を指定すると、そのローディング画面をプレビュー表示できる（例: /?load=netflix）
//
// このコンポーネント自体は何も描画しない「トリガー」役。
// Suspenseはこのフォールバックをコンテンツ準備完了の瞬間に問答無用でアンマウントしてしまうため、
// 退場アニメーションを仕込む余地がない。そこで実際のオーバーレイはSuspenseの外側
// （常駐の LoadingOverlayProvider）に持たせ、マウント時に表示を依頼し、
// アンマウント時（=ロード完了の合図）にクリーンアップ経由で「少し待ってから消す」を依頼する。
export default function Loading() {
    const searchParams = useSearchParams();
    const { showLoadingOverlay, scheduleHideLoadingOverlay } = useLoadingOverlay();
    const [screen] = useState(() => getLoadingScreenById(searchParams.get("load")) ?? pickLoadingScreen());

    useEffect(() => {
        showLoadingOverlay(screen);
        return scheduleHideLoadingOverlay;
    }, [screen, showLoadingOverlay, scheduleHideLoadingOverlay]);

    return null;
}
