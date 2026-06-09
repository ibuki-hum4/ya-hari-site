"use client";

import { useRef, useState, useCallback } from "react";
import { FiUpload, FiCopy, FiCheck } from "react-icons/fi";

type Swatch = { hex: string; percent: number };

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function colorDistance(a: number[], b: number[]): number {
    return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function kMeans(pixels: number[][], k: number, iterations = 10): number[][] {
    if (pixels.length === 0) return [];
    const centroids = pixels.slice(0, k).map(p => [...p]);
    for (let iter = 0; iter < iterations; iter++) {
        const clusters: number[][][] = Array.from({ length: k }, () => []);
        for (const p of pixels) {
            let minDist = Infinity, minIdx = 0;
            for (let ci = 0; ci < k; ci++) {
                const d = colorDistance(p, centroids[ci]);
                if (d < minDist) { minDist = d; minIdx = ci; }
            }
            clusters[minIdx].push(p);
        }
        for (let ci = 0; ci < k; ci++) {
            if (clusters[ci].length === 0) continue;
            centroids[ci] = [0, 1, 2].map(ch => Math.round(clusters[ci].reduce((s, p) => s + p[ch], 0) / clusters[ci].length));
        }
    }
    return centroids;
}

function extractColors(imageData: ImageData, numColors = 8): Swatch[] {
    const pixels: number[][] = [];
    const data = imageData.data;
    const step = Math.max(1, Math.floor(data.length / (4 * 2000)));
    for (let i = 0; i < data.length; i += 4 * step) {
        if (data[i + 3] < 128) continue;
        pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
    if (pixels.length === 0) return [];
    const centroids = kMeans(pixels, Math.min(numColors, pixels.length));
    const counts = new Array(centroids.length).fill(0);
    for (const p of pixels) {
        let minDist = Infinity, minIdx = 0;
        for (let ci = 0; ci < centroids.length; ci++) {
            const d = colorDistance(p, centroids[ci]);
            if (d < minDist) { minDist = d; minIdx = ci; }
        }
        counts[minIdx]++;
    }
    return centroids
        .map((c, i) => ({ hex: rgbToHex(c[0], c[1], c[2]), percent: Math.round(counts[i] / pixels.length * 100) }))
        .sort((a, b) => b.percent - a.percent);
}

function CopySwatch({ swatch }: { swatch: Swatch }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(swatch.hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <button onClick={copy} className="group flex items-center gap-3 p-3 border border-line rounded-xl hover:bg-surface-alt transition-colors w-full">
            <div className="w-10 h-10 rounded-lg border border-white/20 flex-shrink-0" style={{ backgroundColor: swatch.hex }} />
            <div className="text-left flex-1 min-w-0">
                <p className="font-mono text-sm text-ink">{swatch.hex}</p>
                <p className="text-xs text-muted">{swatch.percent}%</p>
            </div>
            <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            </span>
        </button>
    );
}

export default function ImageColor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [swatches, setSwatches] = useState<Swatch[]>([]);
    const [preview, setPreview] = useState<string>("");
    const [analyzing, setAnalyzing] = useState(false);

    const analyze = useCallback((file: File) => {
        setAnalyzing(true);
        const url = URL.createObjectURL(file);
        setPreview(url);
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = extractColors(data, 8);
            setSwatches(result);
            setAnalyzing(false);
        };
        img.src = url;
    }, []);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) analyze(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file?.type.startsWith("image/")) analyze(file);
    };

    return (
        <div className="space-y-5">
            <canvas ref={canvasRef} className="hidden" />

            {/* Drop zone */}
            <label
                onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                className="block border-2 border-dashed border-line rounded-2xl p-8 text-center cursor-pointer hover:border-ink transition-colors">
                {preview ? (
                    <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain" />
                ) : (
                    <div className="space-y-2">
                        <FiUpload size={28} className="mx-auto text-muted" />
                        <p className="text-sm text-muted">画像をドロップ、またはクリックして選択</p>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>

            {analyzing && <p className="text-sm text-muted text-center">解析中…</p>}

            {swatches.length > 0 && (
                <div>
                    <p className="text-xs text-muted mb-3">主要カラー（クリックでコピー）</p>
                    {/* Palette bar */}
                    <div className="flex h-8 rounded-xl overflow-hidden border border-line mb-4">
                        {swatches.map(s => (
                            <div key={s.hex} style={{ backgroundColor: s.hex, width: `${s.percent}%` }} title={`${s.hex} (${s.percent}%)`} />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {swatches.map(s => <CopySwatch key={s.hex} swatch={s} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
