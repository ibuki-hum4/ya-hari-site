// Suspenseフォールバックの枠だけ残す。
// React 18 concurrent modeは速いページではこのフォールバックをスキップするため、
// ここでロード画面を制御するのは不安定。NavigationProgress.tsx に移管済み。
export default function Loading() {
    return null;
}
