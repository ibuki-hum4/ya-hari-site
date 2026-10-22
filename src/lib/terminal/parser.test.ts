import { describe, expect, test } from "bun:test";
import { parse } from "./parser";

const pipeline = (line: string) => {
    const result = parse(line);
    if (!result.ok) throw new Error(result.error);
    return result.pipeline;
};

const error = (line: string) => {
    const result = parse(line);
    if (result.ok) throw new Error(`expected an error for: ${line}`);
    return result.error;
};

describe("parse", () => {
    test("空白で区切る（連続した空白は1つとみなす）", () => {
        expect(pipeline("ls   -l  projects")).toEqual([["ls", "-l", "projects"]]);
    });

    test("空行は空のパイプライン", () => {
        expect(pipeline("")).toEqual([]);
        expect(pipeline("   ")).toEqual([]);
    });

    test("シングルクォート・ダブルクォートの中の空白は語を区切らない", () => {
        expect(pipeline(`grep 'web dev' "about me.md"`)).toEqual([["grep", "web dev", "about me.md"]]);
    });

    test("クォートの中の | はパイプにならない", () => {
        expect(pipeline(`echo 'a|b' "c|d"`)).toEqual([["echo", "a|b", "c|d"]]);
    });

    test("隣り合うクォートと文字は1語につながる", () => {
        expect(pipeline(`echo foo"bar"'baz'`)).toEqual([["echo", "foobarbaz"]]);
    });

    test("空のクォートも1つの引数になる", () => {
        expect(pipeline(`grep "" about.md`)).toEqual([["grep", "", "about.md"]]);
    });

    test("バックスラッシュでエスケープできる", () => {
        expect(pipeline(String.raw`echo a\ b \|`)).toEqual([["echo", "a b", "|"]]);
        expect(pipeline(String.raw`echo "say \"hi\""`)).toEqual([["echo", `say "hi"`]]);
        // シングルクォートの中ではエスケープしない
        expect(pipeline(String.raw`echo 'a\b'`)).toEqual([["echo", String.raw`a\b`]]);
    });

    test("パイプで段に分ける（前後の空白は無くてもよい）", () => {
        expect(pipeline("cat about.md | grep -i music|wc -l")).toEqual([
            ["cat", "about.md"],
            ["grep", "-i", "music"],
            ["wc", "-l"],
        ]);
    });

    test("パイプの前後が空なら構文エラー", () => {
        expect(error("| ls")).toBe("bash: syntax error near unexpected token `|'");
        expect(error("ls |")).toBe("bash: syntax error near unexpected token `|'");
        expect(error("ls | | wc")).toBe("bash: syntax error near unexpected token `|'");
    });

    test("|| はサポートしていない演算子として扱う", () => {
        expect(error("ls || wc")).toContain("`||'");
    });

    test("閉じていないクォートはエラー", () => {
        expect(error(`echo "abc`)).toBe("bash: unexpected EOF while looking for matching `\"'");
        expect(error("echo 'abc")).toBe("bash: unexpected EOF while looking for matching `''");
    });

    test("リダイレクトは読み取り専用のエラー", () => {
        expect(error("ls > out.txt")).toBe("bash: out.txt: Read-only file system");
        expect(error("ls >> out.txt")).toBe("bash: out.txt: Read-only file system");
        expect(error("ls >")).toBe("bash: syntax error near unexpected token `newline'");
    });

    test("; & < などパイプ以外の演算子はエラー", () => {
        expect(error("ls; pwd")).toContain("`;'");
        expect(error("ls && pwd")).toContain("`&&'");
        expect(error("cat < about.md")).toContain("`<'");
    });
});
