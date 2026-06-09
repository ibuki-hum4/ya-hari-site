"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiSearch, FiCopy, FiCheck } from "react-icons/fi";

type SC = { code: number; name: string; desc: string };

const STATUS_CODES: SC[] = [
    // 1xx
    { code: 100, name: "Continue",                        desc: "うん、続けて" },
    { code: 101, name: "Switching Protocols",             desc: "ちょっと言語変えていい？" },
    { code: 102, name: "Processing",                      desc: "今やってるから待って" },
    { code: 103, name: "Early Hints",                     desc: "まだ終わってないけど先に教えとく" },
    // 2xx
    { code: 200, name: "OK",                              desc: "はい、どうぞ" },
    { code: 201, name: "Created",                         desc: "ちゃんと作ったよ" },
    { code: 202, name: "Accepted",                        desc: "受け取った、あとでやる" },
    { code: 203, name: "Non-Authoritative Information",   desc: "これ俺が言ってるんじゃなくて又聞きね" },
    { code: 204, name: "No Content",                      desc: "成功したけど言うことない" },
    { code: 205, name: "Reset Content",                   desc: "成功したからそっちリセットして" },
    { code: 206, name: "Partial Content",                 desc: "頼まれた分だけね" },
    { code: 207, name: "Multi-Status",                    desc: "結果がいろいろあって" },
    { code: 208, name: "Already Reported",                desc: "それさっき言ったよ" },
    { code: 226, name: "IM Used",                         desc: "差分で返すね" },
    // 3xx
    { code: 300, name: "Multiple Choices",                desc: "どれにする？" },
    { code: 301, name: "Moved Permanently",               desc: "もうここにはいない、引っ越した" },
    { code: 302, name: "Found",                           desc: "今だけこっちにいる" },
    { code: 303, name: "See Other",                       desc: "そっちじゃなくてこっち見て" },
    { code: 304, name: "Not Modified",                    desc: "変わってないからキャッシュ使って" },
    { code: 307, name: "Temporary Redirect",              desc: "一時的にこっちね、やり方は変えないで" },
    { code: 308, name: "Permanent Redirect",              desc: "完全に引っ越した、やり方も変えないで" },
    // 4xx
    { code: 400, name: "Bad Request",                     desc: "えー、おま環" },
    { code: 401, name: "Unauthorized",                    desc: "身分証どこ" },
    { code: 402, name: "Payment Required",                desc: "お金が必要です" },
    { code: 403, name: "Forbidden",                       desc: "ごめんちょっと見せれん" },
    { code: 404, name: "Not Found",                       desc: "え、ないけど、迷子？" },
    { code: 405, name: "Method Not Allowed",              desc: "そのやり方はダメ" },
    { code: 406, name: "Not Acceptable",                  desc: "それ受け入れられないんだよね" },
    { code: 407, name: "Proxy Authentication Required",   desc: "プロキシにも身分証見せて" },
    { code: 408, name: "Request Timeout",                 desc: "遅すぎ、もう切るわ" },
    { code: 409, name: "Conflict",                        desc: "それ、もう誰かがやってる" },
    { code: 410, name: "Gone",                            desc: "完全に消えました、探さないでください" },
    { code: 411, name: "Length Required",                 desc: "サイズ教えてくれないとわからん" },
    { code: 412, name: "Precondition Failed",             desc: "前提条件が違う" },
    { code: 413, name: "Content Too Large",               desc: "でかすぎ" },
    { code: 414, name: "URI Too Long",                    desc: "URL 長すぎ、どんだけ" },
    { code: 415, name: "Unsupported Media Type",          desc: "そのファイル形式、無理" },
    { code: 416, name: "Range Not Satisfiable",           desc: "その範囲は存在しない" },
    { code: 417, name: "Expectation Failed",              desc: "期待に応えられなかった、ごめん" },
    { code: 418, name: "I'm a Teapot",                   desc: "私はポットです、コーヒーは無理です" },
    { code: 421, name: "Misdirected Request",             desc: "それ俺宛てじゃない" },
    { code: 422, name: "Unprocessable Content",           desc: "構文はあってるけど意味が通らん" },
    { code: 423, name: "Locked",                          desc: "ロック中、触らないで" },
    { code: 424, name: "Failed Dependency",               desc: "先にやることが失敗してる" },
    { code: 425, name: "Too Early",                       desc: "早すぎ、まだ無理" },
    { code: 426, name: "Upgrade Required",                desc: "アップグレードしてから来て" },
    { code: 428, name: "Precondition Required",           desc: "条件つけてから来て" },
    { code: 429, name: "Too Many Requests",               desc: "落ち着いて" },
    { code: 431, name: "Request Header Fields Too Large", desc: "ヘッダーがでかすぎ" },
    { code: 451, name: "Unavailable For Legal Reasons",   desc: "[検閲済み]" },
    // 5xx
    { code: 500, name: "Internal Server Error",           desc: "俺が悪い、全部俺が悪い" },
    { code: 501, name: "Not Implemented",                 desc: "それ実装する予定ありましたっけ" },
    { code: 502, name: "Bad Gateway",                     desc: "上流に怒鳴り込んできます" },
    { code: 503, name: "Service Unavailable",             desc: "今ちょっとしんどいので後にして" },
    { code: 504, name: "Gateway Timeout",                 desc: "上流が返事くれない、既読無視された" },
    { code: 505, name: "HTTP Version Not Supported",      desc: "それもう時代遅れです、アップデートしてください" },
    { code: 506, name: "Variant Also Negotiates",         desc: "俺も迷子です、一緒に迷いましょう" },
    { code: 507, name: "Insufficient Storage",            desc: "満杯です、断捨離します" },
    { code: 508, name: "Loop Detected",                   desc: "あれ、ここ来たことある、あれ、ここ来たことある、あれ、ここ来た" },
    { code: 510, name: "Not Extended",                    desc: "機能が足りてない、ちゃんと持ってきて" },
    { code: 511, name: "Network Authentication Required", desc: "Wi-Fi のパスワード聞いてきて" },
];

type Category = "all" | "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

const CATEGORIES: { key: Category; label: string }[] = [
    { key: "all", label: "ALL" },
    { key: "1xx", label: "1xx" },
    { key: "2xx", label: "2xx" },
    { key: "3xx", label: "3xx" },
    { key: "4xx", label: "4xx" },
    { key: "5xx", label: "5xx" },
];

function codeColor(code: number): string {
    if (code < 200) return "text-sky-500";
    if (code < 300) return "text-emerald-500";
    if (code < 400) return "text-amber-500";
    if (code < 500) return "text-orange-500";
    return "text-red-500";
}

function catOf(code: number): Category {
    return `${Math.floor(code / 100)}xx` as Category;
}

const COUNTS: Record<Category, number> = {
    all: STATUS_CODES.length,
    "1xx": STATUS_CODES.filter(s => catOf(s.code) === "1xx").length,
    "2xx": STATUS_CODES.filter(s => catOf(s.code) === "2xx").length,
    "3xx": STATUS_CODES.filter(s => catOf(s.code) === "3xx").length,
    "4xx": STATUS_CODES.filter(s => catOf(s.code) === "4xx").length,
    "5xx": STATUS_CODES.filter(s => catOf(s.code) === "5xx").length,
};

export default function HttpStatus() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<Category>("all");
    const [copied, setCopied] = useState<number | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return STATUS_CODES.filter(sc => {
            if (category !== "all" && catOf(sc.code) !== category) return false;
            if (!q) return true;
            return (
                sc.code.toString().includes(q) ||
                sc.name.toLowerCase().includes(q) ||
                sc.desc.includes(search.trim())
            );
        });
    }, [search, category]);

    const handleCopy = useCallback((code: number) => {
        navigator.clipboard.writeText(String(code));
        setCopied(code);
        setTimeout(() => setCopied(null), 1500);
    }, []);

    return (
        <div>
            {/* 検索 */}
            <div className="relative mb-6">
                <FiSearch
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                    type="search"
                    placeholder="コード番号・名前・説明で検索..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-line rounded-xl pl-10 pr-4 py-3 bg-surface text-ink placeholder:text-muted focus:outline-none focus:border-ink text-sm transition-colors"
                />
            </div>

            {/* カテゴリフィルター */}
            <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORIES.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setCategory(key)}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors ${
                            category === key
                                ? "bg-ink text-surface"
                                : "border border-line text-muted hover:text-ink"
                        }`}
                    >
                        {label}
                        <span className={`text-xs tabular-nums ${category === key ? "opacity-60" : "opacity-50"}`}>
                            {COUNTS[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* グリッド */}
            {filtered.length === 0 ? (
                <p className="text-center text-muted py-16 text-sm">該当するコードがありません</p>
            ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.map(({ code, name, desc }) => (
                            <motion.button
                                key={code}
                                layout
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.12, ease: "easeOut" }}
                                type="button"
                                onClick={() => handleCopy(code)}
                                className="group text-left w-full bg-surface border border-line rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                                title={`${code} をコピー`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className={`font-mono text-2xl font-bold leading-none ${codeColor(code)}`}>
                                        {code}
                                    </span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-muted mt-0.5 shrink-0">
                                        {copied === code
                                            ? <FiCheck size={14} className="text-emerald-500" />
                                            : <FiCopy size={14} />
                                        }
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-ink mb-1 leading-snug">{name}</p>
                                <p className="text-xs text-muted leading-relaxed">「{desc}」</p>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
