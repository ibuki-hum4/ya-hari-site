// Tab 補完。カーソル位置の語がコマンド位置ならコマンド名、それ以外ならパスを補う
// 候補が1つなら確定し、複数なら共通部分まで伸ばす。それ以上伸ばせないときは候補を返す

import { commandNames } from "./commands";
import { stat, type VDir } from "./vfs";

export type Completion = { line: string; cursor: number; candidates: string[] };

function commonPrefix(words: string[]): string {
    let prefix = words[0] ?? "";
    for (const word of words.slice(1)) {
        while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    return prefix;
}

export function complete(line: string, cursor: number, fs: VDir): Completion {
    const before = line.slice(0, cursor);
    const after = line.slice(cursor);
    const start = Math.max(before.lastIndexOf(" "), before.lastIndexOf("|")) + 1;
    const word = before.slice(start);
    const unchanged: Completion = { line, cursor, candidates: [] };

    const replace = (text: string): Completion => ({
        line: before.slice(0, start) + text + after,
        cursor: start + text.length,
        candidates: [],
    });

    const lead = before.slice(0, start).trim();
    const isCommandPosition = lead === "" || lead.endsWith("|");

    if (isCommandPosition) {
        const matches = commandNames.filter((name) => name.startsWith(word));
        if (matches.length === 0) return unchanged;
        if (matches.length === 1) return replace(`${matches[0]} `);
        const prefix = commonPrefix(matches);
        if (prefix.length > word.length) return replace(prefix);
        return { ...unchanged, candidates: [...matches] };
    }

    if (word.startsWith("-")) return unchanged;

    const slash = word.lastIndexOf("/");
    const dirPart = word.slice(0, slash + 1);
    const base = word.slice(slash + 1);
    const result = stat(fs, dirPart === "" ? "." : dirPart);
    if (!("node" in result) || result.node.kind !== "dir") return unchanged;

    const matches = result.node.children.filter(
        (child) => child.name.startsWith(base) && (base.startsWith(".") || !child.name.startsWith(".")),
    );
    if (matches.length === 0) return unchanged;
    if (matches.length === 1) {
        const [only] = matches;
        return replace(dirPart + only.name + (only.kind === "dir" ? "/" : " "));
    }
    const prefix = commonPrefix(matches.map((m) => m.name));
    if (prefix.length > base.length) return replace(dirPart + prefix);
    return { ...unchanged, candidates: matches.map((m) => m.name + (m.kind === "dir" ? "/" : "")) };
}
