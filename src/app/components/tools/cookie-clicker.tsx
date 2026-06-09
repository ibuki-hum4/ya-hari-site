"use client";

import { useState, useEffect, useRef } from "react";

type Building = { id: string; name: string; emoji: string; baseCost: number; baseCps: number; count: number };

const INITIAL_BUILDINGS: Building[] = [
    { id: "cursor",   name: "カーソル",  emoji: "🖱️",  baseCost: 15,       baseCps: 0.1,    count: 0 },
    { id: "grandma",  name: "おばあちゃん", emoji: "👵",  baseCost: 100,      baseCps: 0.5,    count: 0 },
    { id: "farm",     name: "農場",      emoji: "🌾",  baseCost: 1100,     baseCps: 4,      count: 0 },
    { id: "mine",     name: "採掘場",    emoji: "⛏️",  baseCost: 12000,    baseCps: 10,     count: 0 },
    { id: "factory",  name: "工場",      emoji: "🏭",  baseCost: 130000,   baseCps: 40,     count: 0 },
    { id: "bank",     name: "銀行",      emoji: "🏦",  baseCost: 1400000,  baseCps: 100,    count: 0 },
    { id: "temple",   name: "神殿",      emoji: "⛩️",  baseCost: 20000000, baseCps: 400,    count: 0 },
];

function formatNum(n: number): string {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + "兆";
    if (n >= 1e8)  return (n / 1e8).toFixed(1) + "億";
    if (n >= 1e4)  return (n / 1e4).toFixed(1) + "万";
    return Math.floor(n).toLocaleString();
}

function buildingCost(b: Building): number {
    return Math.ceil(b.baseCost * Math.pow(1.15, b.count));
}

const SAVE_KEY = "yahari-cookie-save";

export default function CookieClicker() {
    const [cookies, setCookies] = useState(0);
    const [total, setTotal] = useState(0);
    const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
    const [clickAnim, setClickAnim] = useState(false);
    const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cps = buildings.reduce((acc, b) => acc + b.baseCps * b.count * (1 + b.count * 0.01), 0);

    // Load save
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
            if (saved.cookies) setCookies(saved.cookies);
            if (saved.total) setTotal(saved.total);
            if (saved.buildings) setBuildings(saved.buildings);
        } catch { /**/ }
    }, []);

    // Auto-save
    useEffect(() => {
        const id = setInterval(() => {
            localStorage.setItem(SAVE_KEY, JSON.stringify({ cookies, total, buildings }));
        }, 5000);
        return () => clearInterval(id);
    }, [cookies, total, buildings]);

    // Tick
    useEffect(() => {
        tickRef.current = setInterval(() => {
            setCookies(c => c + cps / 20);
            setTotal(t => t + cps / 20);
        }, 50);
        return () => { if (tickRef.current) clearInterval(tickRef.current); };
    }, [cps]);

    const click = () => {
        const gain = 1 + buildings[0].count * 0.01;
        setCookies(c => c + gain);
        setTotal(t => t + gain);
        setClickAnim(true);
        setTimeout(() => setClickAnim(false), 100);
    };

    const buy = (id: string) => {
        const building = buildings.find(b => b.id === id);
        if (!building) return;
        const cost = buildingCost(building);
        if (cookies < cost) return;
        setCookies(c => c - cost);
        setBuildings(prev => prev.map(b => b.id === id ? { ...b, count: b.count + 1 } : b));
    };

    const reset = () => {
        setCookies(0);
        setTotal(0);
        setBuildings(INITIAL_BUILDINGS);
        localStorage.removeItem(SAVE_KEY);
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Cookie */}
            <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                    <p className="text-3xl font-bold text-ink font-mono">{formatNum(cookies)}</p>
                    <p className="text-sm text-muted">クッキー</p>
                    <p className="text-xs text-muted mt-1">CPS: {cps.toFixed(1)} | 合計: {formatNum(total)}</p>
                </div>

                <button onClick={click}
                    className={`text-7xl select-none transition-transform cursor-pointer ${clickAnim ? "scale-90" : "scale-100 hover:scale-110"}`}
                    style={{ transition: "transform 0.08s" }}>
                    🍪
                </button>

                <button onClick={reset} className="text-xs text-muted hover:text-red-500 transition-colors border border-line rounded-full px-3 py-1">
                    リセット
                </button>
            </div>

            {/* Right: Buildings */}
            <div className="space-y-2">
                <p className="text-xs text-muted mb-3">アップグレード</p>
                {buildings.map(b => {
                    const cost = buildingCost(b);
                    const canAfford = cookies >= cost;
                    return (
                        <button key={b.id} onClick={() => buy(b.id)} disabled={!canAfford}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${canAfford ? "border-ink hover:bg-surface-alt cursor-pointer" : "border-line opacity-50 cursor-not-allowed"}`}>
                            <span className="text-2xl">{b.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-ink">{b.name}</p>
                                <p className="text-xs text-muted">{b.count}個 · +{b.baseCps}/秒</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-mono text-ink">{formatNum(cost)}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
