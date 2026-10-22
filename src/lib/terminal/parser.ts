// 1行のコマンドをパイプラインに分解する。対応するのは '…' "…" \ と | だけ
// リダイレクトなどは実行せず、本物の bash に寄せたエラーを返す

export type ParseResult =
    | { ok: true; pipeline: string[][] }
    | { ok: false; error: string };

type Token = { type: "word"; value: string } | { type: "op"; value: string };

const operatorChars = new Set(["|", ">", "<", ";", "&"]);

function tokenize(line: string): { tokens: Token[] } | { error: string } {
    const tokens: Token[] = [];
    let word = "";
    let inWord = false; // "" のような空の引数も1語として数えるためのフラグ
    let quote: "'" | '"' | null = null;

    const flush = () => {
        if (inWord) tokens.push({ type: "word", value: word });
        word = "";
        inWord = false;
    };

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (quote === "'") {
            if (ch === "'") quote = null;
            else word += ch;
            continue;
        }
        if (quote === '"') {
            if (ch === '"') quote = null;
            else if (ch === "\\" && i + 1 < line.length && `"\\$\``.includes(line[i + 1])) word += line[++i];
            else word += ch;
            continue;
        }

        if (ch === "'" || ch === '"') {
            quote = ch;
            inWord = true;
        } else if (ch === "\\") {
            if (i + 1 < line.length) word += line[++i];
            inWord = true;
        } else if (ch === " " || ch === "\t") {
            flush();
        } else if (operatorChars.has(ch)) {
            flush();
            // >> && || のような2文字の演算子
            const pair = ch + (line[i + 1] ?? "");
            if (pair === ">>" || pair === "&&" || pair === "||") {
                tokens.push({ type: "op", value: pair });
                i++;
            } else {
                tokens.push({ type: "op", value: ch });
            }
        } else {
            word += ch;
            inWord = true;
        }
    }

    if (quote) return { error: `bash: unexpected EOF while looking for matching \`${quote}'` };
    flush();
    return { tokens };
}

export function parse(line: string): ParseResult {
    const result = tokenize(line);
    if ("error" in result) return { ok: false, error: result.error };
    const { tokens } = result;

    const pipeline: string[][] = [[]];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "word") {
            pipeline[pipeline.length - 1].push(token.value);
            continue;
        }

        if (token.value === "|") {
            if (pipeline[pipeline.length - 1].length === 0) {
                return { ok: false, error: "bash: syntax error near unexpected token `|'" };
            }
            pipeline.push([]);
            continue;
        }

        if (token.value === ">" || token.value === ">>") {
            const target = tokens[i + 1];
            if (!target || target.type !== "word") {
                return { ok: false, error: `bash: syntax error near unexpected token \`${target?.value ?? "newline"}'` };
            }
            return { ok: false, error: `bash: ${target.value}: Read-only file system` };
        }

        return { ok: false, error: `bash: \`${token.value}': only pipes (|) are supported in this shell` };
    }

    const last = pipeline[pipeline.length - 1];
    if (last.length === 0) {
        if (pipeline.length === 1) return { ok: true, pipeline: [] };
        return { ok: false, error: "bash: syntax error near unexpected token `|'" };
    }
    return { ok: true, pipeline };
}
