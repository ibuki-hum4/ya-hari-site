// 1行を解析してパイプラインを実行する。前段の標準出力を次段の標準入力に流す

import { parse } from "./parser";
import { commands, isCommandName, usages, type Chunk, type CommandResult, type Effect, type ShellContext } from "./commands";
import { matchHiddenCommand } from "./hidden";

function notFound(name: string): CommandResult {
    return { chunks: [{ stream: "err", text: `bash: ${name}: command not found\n` }], code: 127 };
}

function runOne(name: string, args: string[], stdin: string | null, isTTY: boolean, ctx: ShellContext): CommandResult {
    // 隠しコマンドは決まった形のときだけ。rm・sudo・kubectl・poweroff のそれ以外の形は command not found
    const hidden = matchHiddenCommand([name, ...args]);
    if (hidden) {
        const text = hidden.kind === "pod-delete" ? hidden.pods.map((pod) => `pod "${pod}" deleted\n`).join("") : "";
        return { chunks: text ? [{ stream: "out", text }] : [], code: 0, effect: hidden };
    }
    if (!isCommandName(name)) return notFound(name);
    if (name !== "echo" && args.includes("--help")) {
        const text = `Usage: ${usages[name]}\n${ctx.strings.help.commands[name]}\n`;
        return { chunks: [{ stream: "out", text }], code: 0 };
    }
    return commands[name]({ args, stdin, isTTY, ctx });
}

export function execute(line: string, ctx: ShellContext): CommandResult {
    const parsed = parse(line);
    if (!parsed.ok) return { chunks: [{ stream: "err", text: `${parsed.error}\n` }], code: 2 };

    const chunks: Chunk[] = [];
    let stdin: string | null = null;
    let code = 0;
    let effect: Effect | undefined;

    parsed.pipeline.forEach(([name, ...args], index) => {
        const isLast = index === parsed.pipeline.length - 1;
        const result = runOne(name, args, stdin, isLast, ctx);
        stdin = result.chunks.filter((c) => c.stream === "out").map((c) => c.text).join("");
        // 途中段の標準出力は次段に渡るので画面には出さない。エラーだけ先に出す
        chunks.push(...(isLast ? result.chunks : result.chunks.filter((c) => c.stream === "err")));
        code = result.code;
        effect ??= result.effect;
    });

    return { chunks, code, effect };
}
