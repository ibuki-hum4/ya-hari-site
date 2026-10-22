"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { FiTerminal } from "react-icons/fi";
import { LuHammer, LuLightbulbOff } from "react-icons/lu";
import { getMode, subscribe } from "@/lib/playground/mode";
import { compactButtonClass } from "../ui/button";
import {
    openTerminal,
    preloadBlackoutMode,
    preloadDestroyMode,
    preloadTerminal,
    startDestroyMode,
    toggleBlackout,
} from "./Playground";

const playButtonClass = `${compactButtonClass} rounded-full`;

// フッターの「遊ぶ」行。スマホには ` キーが無いので、ターミナルはここから開く
export default function PlaygroundButtons() {
    const t = useTranslations("playground");
    const mode = useSyncExternalStore(subscribe, getMode, () => "idle" as const);

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pb-8 mb-8 border-b border-line">
            <span className="text-xs text-muted tracking-widest select-none">{t("label").toUpperCase()}</span>
            <button
                type="button"
                onClick={openTerminal}
                onPointerEnter={preloadTerminal}
                onFocus={preloadTerminal}
                className={playButtonClass}
            >
                <FiTerminal size={14} />
                {t("terminal")}
                <kbd
                    className="pointer-coarse:hidden rounded border border-line px-1.5 font-mono text-[10px] leading-4"
                    title={t("terminalShortcut")}
                >
                    `
                </kbd>
            </button>
            <button
                type="button"
                onClick={() => startDestroyMode("footer")}
                onPointerEnter={preloadDestroyMode}
                onFocus={preloadDestroyMode}
                className={playButtonClass}
            >
                <LuHammer size={14} />
                {t("destroy")}
            </button>
            <button
                type="button"
                // マウスで押したときはその位置から照らす。キーボード（detail === 0）のときは位置を渡さない
                onClick={(e) => toggleBlackout(e.detail > 0 ? { x: e.clientX, y: e.clientY } : null)}
                onPointerEnter={preloadBlackoutMode}
                onFocus={preloadBlackoutMode}
                aria-pressed={mode === "blackout"}
                className={playButtonClass}
            >
                <LuLightbulbOff size={14} />
                {t("blackout")}
            </button>
        </div>
    );
}
