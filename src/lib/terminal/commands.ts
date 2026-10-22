// 各コマンドの実装。入出力は文字列だけで、DOM にも React にも依存しない
// エラーメッセージと終了コードは GNU coreutils / bash（LANG=C）に寄せている

import type { HiddenCommand } from "./hidden";
import { getopt } from "./options";
import {
    HOME,
    byteLength,
    errorMessages,
    joinLines,
    splitLines,
    stat,
    walkFiles,
    type VDir,
    type VFile,
    type VNode,
} from "./vfs";

export const commandNames = [
    "help", "ls", "cat", "grep", "head", "tail", "wc", "tree",
    "echo", "pwd", "whoami", "date", "history", "clear",
] as const;

export type CommandName = (typeof commandNames)[number];

export const usages: Record<CommandName, string> = {
    help: "help",
    ls: "ls [-la] [PATH]...",
    cat: "cat [FILE]...",
    grep: "grep [-inr] PATTERN [FILE]...",
    head: "head [-n N] [FILE]...",
    tail: "tail [-n [+]N] [FILE]...",
    wc: "wc [-l] [FILE]...",
    tree: "tree [-a] [PATH]...",
    echo: "echo [-n] [TEXT]...",
    pwd: "pwd",
    whoami: "whoami",
    date: "date [+FORMAT]",
    history: "history [N]",
    clear: "clear",
};

export type Chunk = { stream: "out" | "err"; text: string };
// 画面のクリアか、隠しコマンド（hidden.ts）の発動
export type Effect = "clear" | HiddenCommand;
export type CommandResult = { chunks: Chunk[]; code: number; effect?: Effect };

// 画面に出す文言のうち、言語で切り替わるもの（messages の terminal.help から渡す）
export type TerminalStrings = {
    help: { intro: string; footer: string; commands: Record<CommandName, string> };
};

export type ShellContext = {
    fs: VDir;
    history: readonly string[];
    strings: TerminalStrings;
    now: Date;
    user: string;
};

export type CommandInput = {
    args: string[];
    stdin: string | null;
    isTTY: boolean; // パイプの最後（画面に出る）かどうか。ls の出力形式が変わる
    ctx: ShellContext;
};

class Output {
    chunks: Chunk[] = [];
    code = 0;

    out(text: string) {
        if (text !== "") this.chunks.push({ stream: "out", text });
    }

    err(text: string, code: number) {
        this.chunks.push({ stream: "err", text: text.endsWith("\n") ? text : `${text}\n` });
        this.code = code;
    }

    done(effect?: Effect): CommandResult {
        return { chunks: this.chunks, code: this.code, effect };
    }

    fail(text: string, code: number): CommandResult {
        this.err(text, code);
        return this.done();
    }
}

type OpenResult = { content: string } | { error: keyof typeof errorMessages };

function open(fs: VDir, path: string): OpenResult {
    const result = stat(fs, path);
    if ("error" in result) return { error: result.error };
    if (result.node.kind === "dir") return { error: "EISDIR" };
    return { content: result.node.content };
}

const OWNER = "yahari";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad2 = (n: number) => String(n).padStart(2, "0");

// ls -l の日付。半年以内なら時刻、それより前なら年を出す
function lsDate(date: Date, now: Date): string {
    const recent = Math.abs(now.getTime() - date.getTime()) < 182 * 24 * 60 * 60 * 1000;
    const tail = recent ? `${pad2(date.getHours())}:${pad2(date.getMinutes())}` : ` ${date.getFullYear()}`;
    return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2)} ${tail}`;
}

function nodeSize(node: VNode): number {
    return node.kind === "dir" ? 4096 : byteLength(node.content);
}

function lsLong(entries: { name: string; node: VNode }[], now: Date): string[] {
    const rows = entries.map(({ name, node }) => ({
        mode: node.kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--",
        links: node.kind === "dir" ? 2 + node.children.filter((c) => c.kind === "dir").length : 1,
        size: nodeSize(node),
        date: lsDate(node.mtime, now),
        name,
    }));
    const linkWidth = Math.max(...rows.map((r) => String(r.links).length));
    const sizeWidth = Math.max(...rows.map((r) => String(r.size).length));
    return rows.map((r) =>
        `${r.mode} ${String(r.links).padStart(linkWidth)} ${OWNER} ${OWNER} ${String(r.size).padStart(sizeWidth)} ${r.date} ${r.name}`,
    );
}

function ls({ args, isTTY, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt("ls", args, { flags: "la" });
    if (!opts.ok) return o.fail(opts.error, 2);
    const long = opts.flags.has("l");
    const all = opts.flags.has("a");

    const targets = opts.operands.length > 0 ? opts.operands : ["."];
    const files: { name: string; node: VFile }[] = [];
    const dirs: { label: string; node: VDir }[] = [];
    for (const target of targets) {
        const result = stat(ctx.fs, target);
        if ("error" in result) {
            o.err(`ls: cannot access '${target}': ${errorMessages[result.error]}`, 2);
        } else if (result.node.kind === "file") {
            files.push({ name: target, node: result.node });
        } else {
            dirs.push({ label: target, node: result.node });
        }
    }

    const format = (entries: { name: string; node: VNode }[], withTotal: boolean) => {
        if (entries.length === 0) return withTotal && long ? "total 0\n" : "";
        if (long) {
            const lines = lsLong(entries, ctx.now);
            if (withTotal) {
                const blocks = entries.reduce((sum, { node }) => sum + Math.ceil(nodeSize(node) / 4096) * 4, 0);
                lines.unshift(`total ${blocks}`);
            }
            return joinLines(lines);
        }
        const names = entries.map((e) => e.name);
        return isTTY ? `${names.join("  ")}\n` : joinLines(names);
    };

    const blocks: string[] = [];
    if (files.length > 0) blocks.push(format(files, false));
    for (const { label, node } of dirs) {
        const children = node.children
            .filter((c) => all || !c.name.startsWith("."))
            .map((c) => ({ name: c.name, node: c as VNode }));
        const entries = all ? [{ name: ".", node: node as VNode }, { name: "..", node: node as VNode }, ...children] : children;
        const header = targets.length > 1 ? `${label}:\n` : "";
        blocks.push(header + format(entries, true));
    }
    o.out(blocks.filter((b) => b !== "").join("\n"));
    return o.done();
}

function cat({ args, stdin, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt("cat", args, {});
    if (!opts.ok) return o.fail(opts.error, 1);

    const targets = opts.operands.length > 0 ? opts.operands : ["-"];
    for (const target of targets) {
        if (target === "-") {
            o.out(stdin ?? "");
            continue;
        }
        const result = open(ctx.fs, target);
        if ("error" in result) o.err(`cat: ${target}: ${errorMessages[result.error]}`, 1);
        else o.out(result.content);
    }
    return o.done();
}

function grep({ args, stdin, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt("grep", args, { flags: "inr" });
    if (!opts.ok) return o.fail(opts.error, 2);
    const recursive = opts.flags.has("r");
    const numbered = opts.flags.has("n");

    const [pattern, ...paths] = opts.operands;
    if (pattern === undefined) {
        return o.fail("Usage: grep [OPTION]... PATTERNS [FILE]...\nTry 'grep --help' for more information.", 2);
    }

    // GNU grep の BRE ではなく JavaScript の正規表現（grep -E に近い）として解釈する
    let regex: RegExp;
    try {
        regex = new RegExp(pattern, opts.flags.has("i") ? "i" : "");
    } catch {
        return o.fail("grep: Invalid regular expression", 2);
    }

    const sources: { label: string; content: string }[] = [];
    let showNames = paths.length > 1;
    let hadError = false;

    if (paths.length === 0) {
        if (recursive) {
            const home = stat(ctx.fs, "~");
            if ("node" in home && home.node.kind === "dir") {
                sources.push(...walkFiles(home.node, "").map(({ label, file }) => ({ label, content: file.content })));
            }
            showNames = true;
        } else {
            sources.push({ label: "(standard input)", content: stdin ?? "" });
        }
    }

    for (const path of paths) {
        if (path === "-") {
            sources.push({ label: "(standard input)", content: stdin ?? "" });
            continue;
        }
        const result = stat(ctx.fs, path);
        if ("error" in result) {
            o.err(`grep: ${path}: ${errorMessages[result.error]}`, 2);
            hadError = true;
        } else if (result.node.kind === "file") {
            sources.push({ label: path, content: result.node.content });
        } else if (recursive) {
            sources.push(...walkFiles(result.node, path).map(({ label, file }) => ({ label, content: file.content })));
            showNames = true;
        } else {
            o.err(`grep: ${path}: ${errorMessages.EISDIR}`, 2);
            hadError = true;
        }
    }

    let matched = false;
    for (const { label, content } of sources) {
        splitLines(content).forEach((line, index) => {
            if (!regex.test(line)) return;
            matched = true;
            o.out(`${showNames ? `${label}:` : ""}${numbered ? `${index + 1}:` : ""}${line}\n`);
        });
    }

    o.code = hadError ? 2 : matched ? 0 : 1;
    return o.done();
}

function headOrTail(command: "head" | "tail", { args, stdin, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt(command, args, { withValue: "n", numericShorthand: "n" });
    if (!opts.ok) return o.fail(opts.error, 1);

    const raw = opts.values.get("n") ?? "10";
    // tail -n +N は「N 行目から最後まで」
    const fromStart = command === "tail" && raw.startsWith("+");
    const digits = fromStart ? raw.slice(1) : raw;
    if (!/^\d+$/.test(digits)) return o.fail(`${command}: invalid number of lines: '${raw}'`, 1);
    const count = Number(digits);

    const targets = opts.operands.length > 0 ? opts.operands : ["-"];
    targets.forEach((target, index) => {
        let content: string;
        if (target === "-") {
            content = stdin ?? "";
        } else {
            const result = open(ctx.fs, target);
            if ("error" in result) {
                o.err(
                    result.error === "EISDIR"
                        ? `${command}: error reading '${target}': ${errorMessages.EISDIR}`
                        : `${command}: cannot open '${target}' for reading: ${errorMessages[result.error]}`,
                    1,
                );
                return;
            }
            content = result.content;
        }

        if (targets.length > 1) {
            o.out(`${index > 0 ? "\n" : ""}==> ${target === "-" ? "standard input" : target} <==\n`);
        }
        const lines = splitLines(content);
        const picked =
            command === "head"
                ? lines.slice(0, count)
                : fromStart
                    ? lines.slice(Math.max(count - 1, 0))
                    : count === 0
                        ? []
                        : lines.slice(-count);
        o.out(joinLines(picked));
    });
    return o.done();
}

function wc({ args, stdin, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt("wc", args, { flags: "l" });
    if (!opts.ok) return o.fail(opts.error, 1);
    const linesOnly = opts.flags.has("l");

    const count = (text: string) => {
        const lines = (text.match(/\n/g) ?? []).length;
        if (linesOnly) return [lines];
        return [lines, text.split(/\s+/).filter(Boolean).length, byteLength(text)];
    };

    const fromStdin = opts.operands.length === 0;
    const rows: { counts: number[]; label: string }[] = [];
    if (fromStdin) {
        rows.push({ counts: count(stdin ?? ""), label: "" });
    }
    for (const target of opts.operands) {
        const result = open(ctx.fs, target);
        if ("error" in result) o.err(`wc: ${target}: ${errorMessages[result.error]}`, 1);
        else rows.push({ counts: count(result.content), label: target });
    }
    if (rows.length === 0) return o.done();
    if (rows.length > 1) {
        const totals = rows[0].counts.map((_, i) => rows.reduce((sum, row) => sum + row.counts[i], 0));
        rows.push({ counts: totals, label: "total" });
    }

    // GNU wc と同じく、数値が1つだけなら詰めて出し、標準入力のときは幅7で揃える
    const single = rows.length === 1 && rows[0].counts.length === 1;
    const width = single ? 0 : fromStdin ? 7 : Math.max(...rows.flatMap((r) => r.counts.map((c) => String(c).length)));
    o.out(joinLines(rows.map(({ counts, label }) =>
        `${counts.map((c) => String(c).padStart(width)).join(" ")}${label ? ` ${label}` : ""}`,
    )));
    return o.done();
}

function tree({ args, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const opts = getopt("tree", args, { flags: "a" });
    if (!opts.ok) return o.fail(opts.error, 2);
    const all = opts.flags.has("a");

    let dirCount = 0;
    let fileCount = 0;
    const walk = (node: VDir, prefix: string) => {
        const children = node.children.filter((c) => all || !c.name.startsWith("."));
        children.forEach((child, index) => {
            const last = index === children.length - 1;
            o.out(`${prefix}${last ? "└── " : "├── "}${child.name}\n`);
            if (child.kind === "dir") {
                dirCount++;
                walk(child, prefix + (last ? "    " : "│   "));
            } else {
                fileCount++;
            }
        });
    };

    const targets = opts.operands.length > 0 ? opts.operands : ["."];
    for (const target of targets) {
        const result = stat(ctx.fs, target);
        if ("error" in result || result.node.kind !== "dir") {
            o.out(`${target}  [error opening dir]\n`);
            continue;
        }
        o.out(`${target}\n`);
        walk(result.node, "");
    }
    o.out(`\n${dirCount} director${dirCount === 1 ? "y" : "ies"}, ${fileCount} file${fileCount === 1 ? "" : "s"}\n`);
    return o.done();
}

function echo({ args }: CommandInput): CommandResult {
    const o = new Output();
    let rest = args;
    let newline = true;
    // bash の echo と同じく、先頭の -n -e -E だけをオプションとして読む（-e / -E は無視）
    while (rest.length > 0 && /^-[neE]+$/.test(rest[0])) {
        if (rest[0].includes("n")) newline = false;
        rest = rest.slice(1);
    }
    o.out(rest.join(" ") + (newline ? "\n" : ""));
    return o.done();
}

function timeZoneName(date: Date): string {
    const pick = (locale: string) =>
        new Intl.DateTimeFormat(locale, { timeZoneName: "short" }).formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "";
    const en = pick("en-US");
    if (!en.startsWith("GMT")) return en;
    // en-US では "GMT+9" になる地域でも、ja-JP なら "JST" のように略称が取れることがある
    const ja = pick("ja-JP");
    return /^[A-Z]{2,5}$/.test(ja) ? ja : en;
}

const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// date +FORMAT のうち、よく使うものだけ
export function strftime(format: string, date: Date): string {
    return format.replace(/%([a-zA-Z%])/g, (match, spec: string) => {
        switch (spec) {
            case "Y": return String(date.getFullYear());
            case "m": return pad2(date.getMonth() + 1);
            case "d": return pad2(date.getDate());
            case "e": return String(date.getDate()).padStart(2);
            case "H": return pad2(date.getHours());
            case "M": return pad2(date.getMinutes());
            case "S": return pad2(date.getSeconds());
            case "a": return DAYS[date.getDay()];
            case "A": return FULL_DAYS[date.getDay()];
            case "b": return MONTHS[date.getMonth()];
            case "B": return FULL_MONTHS[date.getMonth()];
            case "F": return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
            case "T": return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
            case "Z": return timeZoneName(date);
            case "s": return String(Math.floor(date.getTime() / 1000));
            case "%": return "%";
            default: return match;
        }
    });
}

function date({ args, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const [format, ...extra] = args;
    if (format === undefined) {
        o.out(`${strftime("%a %b %e %H:%M:%S %Z %Y", ctx.now)}\n`);
        return o.done();
    }
    if (!format.startsWith("+")) return o.fail(`date: invalid date '${format}'`, 1);
    if (extra.length > 0) return o.fail(`date: extra operand '${extra[0]}'\nTry 'date --help' for more information.`, 1);
    o.out(`${strftime(format.slice(1), ctx.now)}\n`);
    return o.done();
}

function history({ args, ctx }: CommandInput): CommandResult {
    const o = new Output();
    const [arg] = args;
    let entries = ctx.history.map((command, index) => ({ command, index }));
    if (arg !== undefined) {
        if (arg.startsWith("-")) return o.fail(`bash: history: ${arg}: invalid option\nhistory: usage: history [n]`, 2);
        if (!/^\d+$/.test(arg)) return o.fail(`bash: history: ${arg}: numeric argument required`, 1);
        entries = Number(arg) === 0 ? [] : entries.slice(-Number(arg));
    }
    o.out(joinLines(entries.map(({ command, index }) => `${String(index + 1).padStart(5)}  ${command}`)));
    return o.done();
}

function help({ ctx }: CommandInput): CommandResult {
    const o = new Output();
    const { intro, footer, commands } = ctx.strings.help;
    const width = Math.max(...commandNames.map((name) => usages[name].length));
    const lines = commandNames.map((name) => `  ${usages[name].padEnd(width)}  ${commands[name]}`);
    o.out(joinLines([intro, ...lines, "", ...footer.split("\n")]));
    return o.done();
}

function whoami({ args, ctx }: CommandInput): CommandResult {
    const o = new Output();
    if (args.length > 0) return o.fail(`whoami: extra operand '${args[0]}'\nTry 'whoami --help' for more information.`, 1);
    o.out(`${ctx.user}\n`);
    return o.done();
}

export const commands: Record<CommandName, (input: CommandInput) => CommandResult> = {
    help,
    ls,
    cat,
    grep,
    head: (input) => headOrTail("head", input),
    tail: (input) => headOrTail("tail", input),
    wc,
    tree,
    echo,
    pwd: () => ({ chunks: [{ stream: "out", text: `${HOME}\n` }], code: 0 }),
    whoami,
    date,
    history,
    clear: () => ({ chunks: [], code: 0, effect: "clear" }),
};

export function isCommandName(name: string): name is CommandName {
    return (commandNames as readonly string[]).includes(name);
}
