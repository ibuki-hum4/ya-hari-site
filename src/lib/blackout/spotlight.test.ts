import { describe, expect, test } from "bun:test";
import { DARKNESS, flickerKeyframes, lightRadius, spotlightBackground } from "./spotlight";

describe("lightRadius", () => {
    test("画面の短い辺の 22% を、110〜200px に収める", () => {
        expect(lightRadius({ width: 1200, height: 800 })).toBe(176);
        expect(lightRadius({ width: 390, height: 844 })).toBe(110);
        expect(lightRadius({ width: 3840, height: 2160 })).toBe(200);
    });
});

describe("spotlightBackground", () => {
    test("照らす位置と半径を持つ円形のグラデーション", () => {
        const background = spotlightBackground(100.4, 250.6, 150);
        expect(background).toStartWith("radial-gradient(circle 150px at 100px 251px, ");
        // 内側は透明（文字が読める）、外側は暗闇
        expect(background).toContain("transparent 0%, transparent 60%");
        expect(background).toEndWith(`${DARKNESS} 100%)`);
    });
});

describe("flickerKeyframes", () => {
    test("消えた状態から始まり、真っ暗で終わる", () => {
        expect(flickerKeyframes[0]).toEqual({ opacity: 0, offset: 0 });
        expect(flickerKeyframes.at(-1)).toEqual({ opacity: 1, offset: 1 });
        const offsets = flickerKeyframes.map((k) => k.offset as number);
        expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    });
});
