// 要素を砕くときの破片の形。叩いた点から外周へ放射状に切り分ける
// 座標は要素の左上を (0, 0)、右下を (1, 1) とした割合で、CSS の clip-path: polygon() にそのまま使える

export type Point = { x: number; y: number };
export type Shard = { polygon: Point[]; direction: Point };

// 外周を 0〜4 の1本の数直線として扱う（上辺 → 右辺 → 下辺 → 左辺）
function perimeterPoint(t: number): Point {
    const u = ((t % 4) + 4) % 4;
    if (u < 1) return { x: u, y: 0 };
    if (u < 2) return { x: 1, y: u - 1 };
    if (u < 3) return { x: 3 - u, y: 1 };
    return { x: 0, y: 4 - u };
}

export function makeShards(count: number, origin: Point, random: () => number = Math.random): Shard[] {
    const n = Math.max(1, Math.floor(count));
    const step = 4 / n;
    const offset = random() * 4;
    // 等間隔から少しずらして、割れ目を不揃いにする（隣と入れ替わらない範囲で）
    const cuts = Array.from({ length: n }, (_, i) => offset + i * step + (random() - 0.5) * step * 0.6);

    return cuts.map((start, i) => {
        const end = i === n - 1 ? cuts[0] + 4 : cuts[i + 1];
        const polygon: Point[] = [origin, perimeterPoint(start)];
        // 間にある角を拾って、外周を隙間なく覆う
        for (let corner = Math.ceil(start); corner < end; corner++) {
            if (corner > start) polygon.push(perimeterPoint(corner));
        }
        polygon.push(perimeterPoint(end));

        const centroid = polygon.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
        const dx = centroid.x / polygon.length - origin.x;
        const dy = centroid.y / polygon.length - origin.y;
        const length = Math.hypot(dx, dy) || 1;
        return { polygon, direction: { x: dx / length, y: dy / length } };
    });
}

export function toClipPath(polygon: Point[]): string {
    return `polygon(${polygon.map((p) => `${(p.x * 100).toFixed(2)}% ${(p.y * 100).toFixed(2)}%`).join(", ")})`;
}

// 多角形の面積（テスト用。破片を合わせると元の 1 になる）
export function polygonArea(polygon: Point[]): number {
    let sum = 0;
    for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i];
        const b = polygon[(i + 1) % polygon.length];
        sum += a.x * b.y - b.x * a.y;
    }
    return Math.abs(sum) / 2;
}
