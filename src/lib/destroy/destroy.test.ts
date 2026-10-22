import { describe, expect, test } from "bun:test";
import { DESTROY_DURATION_MS, autoHealTrigger, formatSeconds } from "./heal";
import { makeShards, polygonArea, toClipPath } from "./shards";
import { compareSnapshots, hashString, normalizeStyle, structureOf, type PageSnapshot } from "./snapshot";
import { isUsableRect, selectTargets, targetLimit, type Candidate } from "./targets";

const viewport = { width: 1200, height: 800 };
const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe("isUsableRect", () => {
    test("普通の大きさで画面内にあれば対象", () => {
        expect(isUsableRect(rect(100, 100, 300, 200), viewport)).toBe(true);
    });

    test("小さすぎる・大きすぎるものは除く", () => {
        expect(isUsableRect(rect(0, 0, 10, 40), viewport)).toBe(false);
        expect(isUsableRect(rect(0, 0, 40, 8), viewport)).toBe(false);
        expect(isUsableRect(rect(0, 0, 1200, 700), viewport)).toBe(false);
    });

    test("半分以上が画面外なら除く", () => {
        expect(isUsableRect(rect(100, 700, 200, 200), viewport)).toBe(true); // ちょうど半分
        expect(isUsableRect(rect(100, 750, 200, 200), viewport)).toBe(false);
        expect(isUsableRect(rect(100, -500, 200, 200), viewport)).toBe(false);
    });
});

describe("selectTargets", () => {
    test("カードを選んだら、その中身は選ばない", () => {
        const candidates: Candidate[] = [
            { kind: "card", rect: rect(0, 0, 400, 300), ancestors: [] },
            { kind: "heading", rect: rect(20, 20, 200, 40), ancestors: [0] },
            { kind: "control", rect: rect(20, 200, 100, 40), ancestors: [0] },
            { kind: "heading", rect: rect(500, 20, 200, 40), ancestors: [] },
        ];
        expect(selectTargets(candidates, viewport)).toEqual([0, 3]);
    });

    test("カードが使えない（画面外）なら、中身を個別に選ぶ", () => {
        const candidates: Candidate[] = [
            { kind: "card", rect: rect(0, 400, 400, 900), ancestors: [] },
            { kind: "heading", rect: rect(20, 420, 200, 40), ancestors: [0] },
        ];
        expect(selectTargets(candidates, viewport)).toEqual([1]);
    });

    test("段落の中のリンクより段落を優先する", () => {
        const candidates: Candidate[] = [
            { kind: "text", rect: rect(0, 0, 600, 80), ancestors: [] },
            { kind: "control", rect: rect(10, 10, 60, 20), ancestors: [0] },
        ];
        expect(selectTargets(candidates, viewport)).toEqual([0]);
    });

    test("先に選ばれた子がいれば、親は選ばない", () => {
        // 見出し（子）が heading で先に選ばれ、親のリンク（control）は外れる
        const candidates: Candidate[] = [
            { kind: "control", rect: rect(0, 0, 300, 100), ancestors: [] },
            { kind: "heading", rect: rect(10, 10, 200, 40), ancestors: [0] },
        ];
        expect(selectTargets(candidates, viewport)).toEqual([1]);
    });

    test("上限を超えない。選んだものは文書順で返す", () => {
        const candidates: Candidate[] = Array.from({ length: 60 }, (_, i) => ({
            kind: i % 2 === 0 ? "text" : "heading",
            rect: rect((i % 10) * 100, Math.floor(i / 10) * 100, 80, 40),
            ancestors: [],
        }));
        const chosen = selectTargets(candidates, viewport, 10);
        expect(chosen).toHaveLength(10);
        expect(chosen).toEqual([...chosen].sort((a, b) => a - b));
        // 見出しが優先される
        expect(chosen.every((i) => candidates[i].kind === "heading")).toBe(true);
    });

    test("スマホ幅では上限を下げる", () => {
        expect(targetLimit({ width: 390, height: 800 })).toBe(20);
        expect(targetLimit(viewport)).toBe(40);
    });
});

describe("makeShards", () => {
    // 再現できる乱数
    const seeded = (seed: number) => () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };

    test("指定した数の破片を作り、合わせると元の面積になる", () => {
        for (const count of [3, 4, 6, 9]) {
            for (const origin of [{ x: 0.5, y: 0.5 }, { x: 0.2, y: 0.8 }, { x: 0.85, y: 0.15 }]) {
                const shards = makeShards(count, origin, seeded(count * 7 + 1));
                expect(shards).toHaveLength(count);
                const total = shards.reduce((sum, s) => sum + polygonArea(s.polygon), 0);
                expect(total).toBeCloseTo(1, 6);
            }
        }
    });

    test("頂点は要素の内側（0〜1）に収まり、飛ぶ向きは単位ベクトル", () => {
        for (const shard of makeShards(6, { x: 0.3, y: 0.6 }, seeded(42))) {
            for (const p of shard.polygon) {
                expect(p.x).toBeGreaterThanOrEqual(0);
                expect(p.x).toBeLessThanOrEqual(1);
                expect(p.y).toBeGreaterThanOrEqual(0);
                expect(p.y).toBeLessThanOrEqual(1);
            }
            expect(Math.hypot(shard.direction.x, shard.direction.y)).toBeCloseTo(1, 6);
        }
    });

    test("clip-path の形式", () => {
        expect(toClipPath([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 1 }])).toBe(
            "polygon(0.00% 0.00%, 100.00% 0.00%, 50.00% 100.00%)",
        );
    });
});

describe("autoHealTrigger", () => {
    test("全部壊したら all-destroyed", () => {
        expect(autoHealTrigger({ destroyed: 5, total: 5, elapsedMs: 1000 })).toBe("all-destroyed");
    });

    test("10秒経ったら timeout", () => {
        expect(autoHealTrigger({ destroyed: 1, total: 5, elapsedMs: DESTROY_DURATION_MS })).toBe("timeout");
        expect(DESTROY_DURATION_MS).toBe(10_000);
    });

    test("どちらでもなければ null。対象が0個なら all-destroyed にしない", () => {
        expect(autoHealTrigger({ destroyed: 1, total: 5, elapsedMs: 9999 })).toBeNull();
        expect(autoHealTrigger({ destroyed: 0, total: 0, elapsedMs: 0 })).toBeNull();
    });

    test("秒数は 0.1 秒単位", () => {
        expect(formatSeconds(1649)).toBe("1.6");
        expect(formatSeconds(1650)).toBe("1.7");
        expect(formatSeconds(0)).toBe("0.0");
    });
});

describe("compareSnapshots", () => {
    const focused = {};
    const base: PageSnapshot = {
        scrollX: 0,
        scrollY: 1200,
        activeElement: focused,
        rootStyle: null,
        rootInert: false,
        rootAriaHidden: null,
        htmlStyle: null,
        bodyStyle: null,
        formValues: ["Taro", "hello"],
        htmlHash: hashString("<main>page</main>"),
    };

    test("同じなら空", () => {
        expect(compareSnapshots(base, { ...base, formValues: [...base.formValues] })).toEqual([]);
    });

    test("DOM の比較では子孫の style 属性を無視する（アニメーションで変わり続けるため）", () => {
        const a = `<div><p style="transform: translateY(10%)">x</p></div>`;
        const b = `<div><p style="transform: translateY(80%)">x</p></div>`;
        expect(structureOf(a)).toBe(structureOf(b));
        expect(structureOf(a)).not.toBe(structureOf(`<div><p>y</p></div>`));
    });

    test("空の style 属性は、属性なしと同じに扱う", () => {
        expect(normalizeStyle("")).toBeNull();
        expect(normalizeStyle("  ")).toBeNull();
        expect(normalizeStyle(null)).toBeNull();
        expect(normalizeStyle("opacity: 0;")).toBe("opacity: 0;");
    });

    test("違う項目の名前を返す", () => {
        const after: PageSnapshot = {
            ...base,
            scrollY: 0,
            activeElement: {},
            rootStyle: "opacity: 0;",
            rootInert: true,
            formValues: ["Taro", ""],
            htmlHash: hashString("<main>changed</main>"),
        };
        expect(compareSnapshots(base, after)).toEqual([
            "scrollY", "activeElement", "rootStyle", "rootInert", "formValues", "htmlHash",
        ]);
    });
});
