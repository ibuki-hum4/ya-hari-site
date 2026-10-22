"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { COLLAPSE_MS, collapseState, createRandom, mojibake } from "@/lib/collapse/collapse";
import type { PageSnapshot } from "@/lib/destroy/snapshot";
import type { CollapseKind } from "@/lib/playground/events";
import { collectPieces, findPageRoot } from "../shared/collect";
import { lowerCurtain } from "../shared/curtain";

type Props = {
    kind: CollapseKind;
    before: PageSnapshot | null; // ターミナルを開く前のページ（元の状態として比べる）
    returnFocusTo: Element | null; // 演出が終わったらフォーカスを戻す先
};

// ターミナルの背後で、ページが段階的に壊れていく（ノイズ・色ずれ → 傾き・ずれ → 文字化け・欠け）
// 壊れるのは複製だけ。本物は幕（shared/curtain.ts）で隠し、幕は次の演出（再起動 / 500）が上げる
export default function CollapseMode({ kind, before, returnFocusTo }: Props) {
    const layerRef = useRef<HTMLDivElement>(null);
    const noiseRef = useRef<HTMLCanvasElement>(null);
    const tintRef = useRef<HTMLDivElement>(null);
    const veilRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf = 0;
        const layer = layerRef.current;
        const noise = noiseRef.current;
        // 1回だけ始める（StrictMode の effect 二重実行で、隠したあとのページから集め直さないように遅らせる）
        const timer = setTimeout(() => {
            const root = findPageRoot();
            if (!layer || !noise || !root) return;

            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            const random = createRandom(Math.floor(Math.random() * 2 ** 31));
            const pieces = collectPieces(root, layer);
            lowerCurtain({ before, returnFocusTo });

            // 要素ごとの崩れ方（どちらへどれだけ傾くか、いつ欠けるか）
            const drift = pieces.map(() => ({
                dx: (random() - 0.5) * 60,
                dy: (random() - 0.5) * 40,
                angle: (random() - 0.5) * 0.35,
                vanishAt: random(),
            }));
            const texts: { node: Text; original: string }[] = [];
            for (const { clone } of pieces) {
                const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
                for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                    const text = node as Text;
                    if (text.data.trim()) texts.push({ node: text, original: text.data });
                }
            }

            // ノイズは低解像度で描いて引き伸ばす（毎フレーム全画素を作らない）
            const scale = 4;
            noise.width = Math.ceil(window.innerWidth / scale);
            noise.height = Math.ceil(window.innerHeight / scale);
            const ctx = noise.getContext("2d");
            const image = ctx?.createImageData(noise.width, noise.height);

            const startedAt = performance.now();
            let lastGarble = 0;
            const frame = (now: number) => {
                const state = collapseState(now - startedAt, COLLAPSE_MS);

                if (reducedMotion) {
                    // 揺れ・ノイズ・傾きは省き、暗くなっていくだけにする
                    layer.style.opacity = String(1 - state.progress * 0.6);
                } else {
                    if (ctx && image) {
                        const data = image.data;
                        for (let i = 0; i < data.length; i += 4) {
                            const v = random() * 255;
                            data[i] = data[i + 1] = data[i + 2] = v;
                            data[i + 3] = random() < 0.5 ? state.noise * 70 : 0;
                        }
                        ctx.putImageData(image, 0, 0);
                    }
                    // 色ずれ（rm は赤と水色、k8s は赤い警告色）。ときどき大きくずれる
                    const shift = state.noise * 3 + (random() < 0.15 ? random() * 6 * state.noise : 0);
                    layer.style.filter = kind === "wipe"
                        ? `drop-shadow(${shift}px 0 rgba(255, 0, 60, 0.55)) drop-shadow(${-shift}px 0 rgba(0, 220, 255, 0.55))`
                        : `drop-shadow(${shift}px 0 rgba(255, 0, 0, 0.6)) saturate(${1 + state.noise})`;
                    if (tintRef.current) tintRef.current.style.opacity = String(state.noise);

                    pieces.forEach(({ clone }, i) => {
                        if (state.tilt <= 0) return;
                        const d = drift[i];
                        const jitter = (random() - 0.5) * 4 * state.tilt;
                        clone.style.transform =
                            `translate(${d.dx * state.tilt + jitter}px, ${d.dy * state.tilt}px) rotate(${d.angle * state.tilt}rad)`;
                    });
                }

                // 文字化けと欠け（動きではないので reduced motion でも行う）
                if (state.corrupt > 0 && now - lastGarble > 90) {
                    lastGarble = now;
                    for (const t of texts) t.node.data = mojibake(t.original, state.corrupt * 0.8, random);
                }
                pieces.forEach(({ clone }, i) => {
                    const gone = drift[i].vanishAt < state.corrupt * 0.6;
                    clone.style.visibility = gone ? "hidden" : "visible";
                    clone.style.clipPath = !gone && !reducedMotion && state.corrupt > 0 && random() < 0.08
                        ? `inset(${random() * 40}% 0 ${random() * 40}% 0)`
                        : "";
                });

                // rm -rf / は最後に真っ暗になって、そのまま再起動の画面へつながる
                if (kind === "wipe" && veilRef.current) {
                    veilRef.current.style.opacity = String(Math.max(0, (state.progress - 0.8) / 0.2));
                }
                raf = requestAnimationFrame(frame);
            };
            raf = requestAnimationFrame(frame);
        }, 0);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
            layer?.replaceChildren();
        };
        // 崩壊は1回のマウントにつき1回だけ
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
            <div ref={layerRef} inert className="absolute inset-0" />
            <canvas
                ref={noiseRef}
                className="absolute inset-0 h-full w-full mix-blend-difference"
                style={{ imageRendering: "pixelated" }}
            />
            {/* k8s 版は走査線と赤い警告色、rm 版は何もしない */}
            <div
                ref={tintRef}
                className="absolute inset-0 opacity-0"
                style={
                    kind === "pod-delete"
                        ? {
                            background:
                                "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px), rgba(220, 38, 38, 0.12)",
                        }
                        : undefined
                }
            />
            <div ref={veilRef} className="absolute inset-0 bg-black opacity-0" />
        </div>,
        document.body,
    );
}
