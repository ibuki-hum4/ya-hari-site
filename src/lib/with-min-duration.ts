// Suspenseフォールバック（ローディング画面）が一瞬で消えてしまわないよう、
// データ取得の完了を最低表示時間まで引き延ばす
export async function withMinDuration<T>(promise: Promise<T>, ms = 750): Promise<T> {
    const [result] = await Promise.all([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
    return result;
}
