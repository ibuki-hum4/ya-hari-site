"use client";

import { useState, useCallback } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, Math.round(l * 100)];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
        : max === g ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

type Swatch = { label: string; colors: string[] };

function generatePalettes(hex: string): Swatch[] {
    const [h, s, l] = hexToHsl(hex);
    return [
        { label: "Analogous", colors: [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)] },
        { label: "Complementary", colors: [hex, hslToHex((h + 180) % 360, s, l)] },
        { label: "Triadic", colors: [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)] },
        { label: "Split-Complementary", colors: [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)] },
        { label: "Monochromatic", colors: [hslToHex(h, s, Math.max(l - 30, 10)), hslToHex(h, s, Math.max(l - 15, 10)), hex, hslToHex(h, s, Math.min(l + 15, 90)), hslToHex(h, s, Math.min(l + 30, 90))] },
    ];
}

function ColorSwatch({ color }: { color: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(color);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    };
    return (
        <button onClick={copy} title={color}
            className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-105">
            <div className="w-full aspect-square rounded-xl border border-white/20 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: color }}>
                <span className={`transition-opacity ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    {copied ? <FiCheck size={16} color="#fff" /> : <FiCopy size={16} color="#fff" />}
                </span>
            </div>
            <span className="text-[10px] font-mono text-muted group-hover:text-ink">{color}</span>
        </button>
    );
}

export default function ColorPalette() {
    const [base, setBase] = useState("#3b82f6");
    const palettes = generatePalettes(base);
    const [hsl] = [hexToHsl(base)];

    const randomColor = useCallback(() => {
        const h = Math.floor(Math.random() * 360);
        const s = 50 + Math.floor(Math.random() * 40);
        const l = 40 + Math.floor(Math.random() * 20);
        setBase(hslToHex(h, s, l));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <label className="text-sm text-muted">Base color</label>
                    <input type="color" value={base} onChange={e => setBase(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-line cursor-pointer bg-transparent" />
                    <span className="font-mono text-sm text-ink">{base}</span>
                    <span className="text-xs text-muted">HSL({hexToHsl(base).join(", ")})</span>
                </div>
                <button onClick={randomColor} className="text-sm text-muted hover:text-ink transition-colors border border-line px-3 py-1.5 rounded-xl">
                    Random
                </button>
            </div>

            <div className="space-y-5">
                {palettes.map(({ label, colors }) => (
                    <div key={label}>
                        <p className="text-xs text-muted mb-2">{label}</p>
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))` }}>
                            {colors.map(c => <ColorSwatch key={c} color={c} />)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
