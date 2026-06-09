"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { FiPlay, FiDownload, FiRefreshCw } from "react-icons/fi";

type Mode = "mandelbrot" | "perlin" | "cellular" | "lsystem";

const MODE_LABELS: Record<Mode, string> = {
    mandelbrot: "マンデルブロ集合",
    perlin:     "Perlinノイズ地形",
    cellular:   "セルオートマトン",
    lsystem:    "Lシステム植物",
};

// Simple deterministic pseudo-random (LCG)
function lcg(seed: number) {
    let s = seed | 0;
    return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0xffffffff; };
}

// Smooth Perlin-like noise using cosine interpolation
function makeNoise2D(seed: number) {
    const rng = lcg(seed);
    const grid: number[][] = Array.from({ length: 256 }, () => Array.from({ length: 256 }, () => rng()));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * ((1 - Math.cos(t * Math.PI)) / 2);
    const noise = (x: number, y: number) => {
        const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x), yf = y - Math.floor(y);
        const v00 = grid[yi][xi], v10 = grid[yi][(xi + 1) & 255];
        const v01 = grid[(yi + 1) & 255][xi], v11 = grid[(yi + 1) & 255][(xi + 1) & 255];
        return lerp(lerp(v00, v10, xf), lerp(v01, v11, xf), yf);
    };
    const fbm = (x: number, y: number, octaves = 6) => {
        let val = 0, amp = 0.5, freq = 1, max = 0;
        for (let i = 0; i < octaves; i++) { val += noise(x * freq, y * freq) * amp; max += amp; freq *= 2; amp *= 0.5; }
        return val / max;
    };
    return fbm;
}

function drawMandelbrot(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number, cx: number, cy: number) {
    const MAX_ITER = 80;
    const img = ctx.createImageData(w, h);
    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const x0 = (px / w - 0.5) * 3.5 / zoom + cx;
            const y0 = (py / h - 0.5) * 2 / zoom + cy;
            let x = 0, y = 0, iter = 0;
            while (x * x + y * y <= 4 && iter < MAX_ITER) {
                const xt = x * x - y * y + x0;
                y = 2 * x * y + y0; x = xt; iter++;
            }
            const i4 = (py * w + px) * 4;
            if (iter === MAX_ITER) {
                img.data[i4] = img.data[i4 + 1] = img.data[i4 + 2] = 0;
            } else {
                const t = iter / MAX_ITER;
                img.data[i4]     = Math.floor(9 * (1 - t) * t * t * t * 255);
                img.data[i4 + 1] = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
                img.data[i4 + 2] = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
            }
            img.data[i4 + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
}

function drawPerlin(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
    const noise = makeNoise2D(seed);
    const img = ctx.createImageData(w, h);
    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const v = noise(px / 80, py / 80);
            const i4 = (py * w + px) * 4;
            if (v < 0.35) { img.data[i4] = 30; img.data[i4+1] = 80; img.data[i4+2] = 180; }
            else if (v < 0.4) { img.data[i4] = 220; img.data[i4+1] = 200; img.data[i4+2] = 140; }
            else if (v < 0.6) { img.data[i4] = 80; img.data[i4+1] = 160; img.data[i4+2] = 60; }
            else if (v < 0.75) { img.data[i4] = 110; img.data[i4+1] = 90; img.data[i4+2] = 60; }
            else { img.data[i4] = img.data[i4+1] = img.data[i4+2] = 240; }
            img.data[i4+3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
}

function drawCellular(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, gen: number) {
    const COLS = 120, ROWS = 80;
    const CW = w / COLS, CH = h / ROWS;
    const rng = lcg(seed);
    let grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => rng() > 0.5 ? 1 : 0));
    for (let g = 0; g < gen; g++) {
        const next = grid.map((row, y) => row.map((_, x) => {
            let n = 0;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                if (dy === 0 && dx === 0) continue;
                n += grid[(y + dy + ROWS) % ROWS][(x + dx + COLS) % COLS];
            }
            return (grid[y][x] === 1) ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        }));
        grid = next;
    }
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, w, h);
    grid.forEach((row, y) => row.forEach((cell, x) => {
        if (cell) {
            ctx.fillStyle = `hsl(${(x + y) * 2 % 360}, 70%, 65%)`;
            ctx.fillRect(x * CW, y * CH, CW - 0.5, CH - 0.5);
        }
    }));
}

function drawLSystem(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
    const rng = lcg(seed);
    const angle = 20 + rng() * 10;
    const rules: Record<string, string> = { F: "FF", X: `F+[[X]-X]-F[-FX]+X` };
    let str = "X";
    for (let i = 0; i < 5; i++) str = str.split("").map(c => rules[c] ?? c).join("");
    ctx.fillStyle = "#0a1a0a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 0.8;
    let x = w / 2, y = h, a = -90;
    const stack: { x: number; y: number; a: number }[] = [];
    const len = 3;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (const c of str) {
        if (c === "F") { const nx = x + Math.cos(a * Math.PI / 180) * len, ny = y + Math.sin(a * Math.PI / 180) * len; ctx.lineTo(nx, ny); x = nx; y = ny; }
        else if (c === "+") a += angle + rng() * 5 - 2.5;
        else if (c === "-") a -= angle + rng() * 5 - 2.5;
        else if (c === "[") { stack.push({ x, y, a }); }
        else if (c === "]") { const p = stack.pop()!; x = p.x; y = p.y; a = p.a; ctx.moveTo(x, y); }
    }
    ctx.stroke();
}

export default function NoneAI() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<Mode>("mandelbrot");
    const [seed, setSeed] = useState(42);
    const [gen, setGen] = useState(20);
    const [zoom, setZoom] = useState(1);
    const [cx, setCx] = useState(-0.5);
    const [cy, setCy] = useState(0);
    const [rendering, setRendering] = useState(false);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        setRendering(true);
        setTimeout(() => {
            const w = canvas.width, h = canvas.height;
            if (mode === "mandelbrot") drawMandelbrot(ctx, w, h, zoom, cx, cy);
            else if (mode === "perlin") drawPerlin(ctx, w, h, seed);
            else if (mode === "cellular") drawCellular(ctx, w, h, seed, gen);
            else if (mode === "lsystem") drawLSystem(ctx, w, h, seed);
            setRendering(false);
        }, 10);
    }, [mode, seed, gen, zoom, cx, cy]);

    useEffect(() => { render(); }, [render]);

    const randomize = () => setSeed(Math.floor(Math.random() * 99999));

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `noneai-${mode}.png`;
        a.click();
    };

    return (
        <div className="space-y-4">
            {/* Mode tabs */}
            <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MODE_LABELS) as Mode[]).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${mode === m ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* Controls per mode */}
            <div className="flex flex-wrap gap-3 items-center">
                {mode === "mandelbrot" && <>
                    <label className="text-xs text-muted flex items-center gap-2">
                        ズーム <input type="range" min="0.5" max="20" step="0.5" value={zoom} onChange={e => setZoom(+e.target.value)} className="w-24" /> {zoom}×
                    </label>
                    <label className="text-xs text-muted flex items-center gap-2">
                        中心X <input type="range" min="-2" max="0.5" step="0.05" value={cx} onChange={e => setCx(+e.target.value)} className="w-24" /> {cx.toFixed(2)}
                    </label>
                    <label className="text-xs text-muted flex items-center gap-2">
                        中心Y <input type="range" min="-1" max="1" step="0.05" value={cy} onChange={e => setCy(+e.target.value)} className="w-24" /> {cy.toFixed(2)}
                    </label>
                </>}
                {(mode === "perlin" || mode === "cellular" || mode === "lsystem") && (
                    <label className="text-xs text-muted flex items-center gap-2">
                        シード <input type="range" min="1" max="99999" value={seed} onChange={e => setSeed(+e.target.value)} className="w-24" /> {seed}
                    </label>
                )}
                {mode === "cellular" && (
                    <label className="text-xs text-muted flex items-center gap-2">
                        世代数 <input type="range" min="0" max="50" value={gen} onChange={e => setGen(+e.target.value)} className="w-24" /> {gen}
                    </label>
                )}
                <button onClick={randomize} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line text-xs text-muted hover:text-ink transition-colors">
                    <FiRefreshCw size={12} /> ランダム
                </button>
                <button onClick={render} disabled={rendering}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink text-surface text-xs hover:opacity-80 transition-opacity disabled:opacity-50">
                    <FiPlay size={12} /> 描画
                </button>
                <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line text-xs text-muted hover:text-ink transition-colors">
                    <FiDownload size={12} /> PNG保存
                </button>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} width={600} height={400}
                className="w-full rounded-2xl border border-line" />

            {rendering && <p className="text-xs text-muted text-center">描画中…</p>}
            <p className="text-xs text-muted">AIを一切使わず数式・アルゴリズムだけで生成されるアート</p>
        </div>
    );
}
