import { describe, expect, test } from "bun:test";
import { COLLAPSE_MS, collapseState, createRandom, mojibake } from "./collapse";
import { bootLog, logCount, podEventLog, podRestartLog, wipeLog } from "./logs";

describe("collapseState", () => {
    test("約3秒を、ノイズ → 傾き → 文字化け の3段階に分ける", () => {
        expect(COLLAPSE_MS).toBe(3000);
        expect(collapseState(0).phase).toBe(1);
        expect(collapseState(1000).phase).toBe(1);
        expect(collapseState(1100).phase).toBe(2);
        expect(collapseState(2000).phase).toBe(2);
        expect(collapseState(2200).phase).toBe(3);
        expect(collapseState(9999).phase).toBe(3);
    });

    test("前の段階の崩れは残したまま、次の段階が強くなっていく", () => {
        const start = collapseState(0);
        expect([start.noise, start.tilt, start.corrupt]).toEqual([0, 0, 0]);

        const middle = collapseState(1575); // 傾きの段階のちょうど半分
        expect(middle.noise).toBe(1);
        expect(middle.tilt).toBeCloseTo(0.5, 5);
        expect(middle.corrupt).toBe(0);

        const end = collapseState(3000);
        expect([end.noise, end.tilt, end.corrupt, end.progress]).toEqual([1, 1, 1, 1]);
    });

    test("時間を超えても 1 を超えない。負の時間は 0", () => {
        expect(collapseState(10_000).progress).toBe(1);
        expect(collapseState(-50).progress).toBe(0);
    });
});

describe("mojibake", () => {
    test("空白と改行は残し、長さ（文字数）は変えない", () => {
        const text = "やーはり の\nポートフォリオ";
        const garbled = mojibake(text, 1, createRandom(1));
        expect([...garbled]).toHaveLength([...text].length);
        expect(garbled[4]).toBe(" ");
        expect(garbled.split("\n")).toHaveLength(2);
        expect(garbled).not.toContain("やーはり");
    });

    test("割合 0 なら何も変えない", () => {
        expect(mojibake("About", 0, createRandom(1))).toBe("About");
    });
});

describe("createRandom", () => {
    test("同じ種なら同じ列を返し、値は 0 以上 1 未満", () => {
        const a = createRandom(42);
        const b = createRandom(42);
        const values = Array.from({ length: 100 }, () => a());
        expect(values).toEqual(Array.from({ length: 100 }, () => b()));
        expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    });
});

describe("ログ", () => {
    test("rm のログは removed で始まり、最後は消せないものにぶつかる", () => {
        const log = wipeLog(50, createRandom(7));
        expect(log).toHaveLength(51);
        expect(log.slice(0, -1).every((line) => /^removed (directory )?'\/.+'$/.test(line))).toBe(true);
        expect(log.at(-1)).toContain("Operation not permitted");
    });

    test("同じ乱数なら同じログ", () => {
        expect(wipeLog(30, createRandom(3))).toEqual(wipeLog(30, createRandom(3)));
        expect(podEventLog(30, ["web"], createRandom(3))).toEqual(podEventLog(30, ["web"], createRandom(3)));
    });

    test("k8s のイベントは消した Pod の名前で出る", () => {
        const log = podEventLog(40, ["web"], createRandom(9));
        expect(log).toHaveLength(40);
        expect(log.filter((line) => !line.includes("ingress/")).every((line) => line.includes("pod/web"))).toBe(true);
        expect(log.some((line) => /Killing|Readiness probe failed|Back-off restarting failed container|connection refused/.test(line))).toBe(true);
    });

    test("reduced motion ではログの量を減らす", () => {
        expect(logCount(150, false)).toBe(150);
        expect(logCount(150, true)).toBe(25);
        expect(bootLog(true).length).toBeLessThan(bootLog(false).length);
    });

    test("ブートログは systemd 風で、ログインで終わる", () => {
        const log = bootLog(false);
        expect(log.filter((line) => line.startsWith("[  OK  ] ")).length).toBeGreaterThan(5);
        expect(log.at(-1)).toContain("login");
    });

    test("Pod の再起動ログは Restarting pod... で始まり Running で終わる", () => {
        const log = podRestartLog(["web"]);
        expect(log[0]).toBe("Restarting pod web...");
        expect(log.at(-1)).toContain("Running");
    });
});
