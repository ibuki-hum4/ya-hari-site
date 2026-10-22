import { describe, expect, test } from "bun:test";
import { complete } from "./complete";
import { dir, file } from "./vfs";

const now = new Date(2026, 9, 22);
const fs = dir("", [
    dir("home", [
        dir("yahari", [
            file("about.md", "", now),
            file(".secret", "", now),
            dir("projects", [file("alt-bot.md", "", now), file("api.md", "", now), file("bluearchive-api.md", "", now)], now),
            dir("blog", [], now),
        ], now),
    ], now),
], now);

const at = (line: string) => complete(line, line.length, fs);

describe("コマンド名の補完", () => {
    test("候補が1つなら確定して空白を足す", () => {
        expect(at("tr")).toEqual({ line: "tree ", cursor: 5, candidates: [] });
    });

    test("複数なら共通部分まで伸ばす", () => {
        expect(at("hi").line).toBe("history ");
        expect(at("w").line).toBe("w"); // wc / whoami は共通部分が無い
    });

    test("伸ばせないときは候補を返す", () => {
        expect(at("h").candidates).toEqual(["help", "head", "history"]);
        expect(at("h").line).toBe("h");
    });

    test("パイプの後ろもコマンド位置", () => {
        expect(at("ls | gr").line).toBe("ls | grep ");
        expect(at("ls |gr").line).toBe("ls |grep ");
    });

    test("rm は補完しない（隠しコマンド）", () => {
        expect(at("r")).toEqual({ line: "r", cursor: 1, candidates: [] });
    });
});

describe("パスの補完", () => {
    test("ファイルは確定して空白を、ディレクトリは / を足す", () => {
        expect(at("cat ab").line).toBe("cat about.md ");
        expect(at("ls pro").line).toBe("ls projects/");
    });

    test("サブディレクトリの中も補完する", () => {
        expect(at("cat projects/b").line).toBe("cat projects/bluearchive-api.md ");
        expect(at("cat ~/projects/al").line).toBe("cat ~/projects/alt-bot.md ");
    });

    test("共通部分まで伸ばし、それ以上は候補を返す", () => {
        expect(at("cat projects/a").line).toBe("cat projects/a");
        expect(at("cat projects/a").candidates).toEqual(["alt-bot.md", "api.md"]);
        expect(at("cat projects/").candidates).toEqual(["alt-bot.md", "api.md", "bluearchive-api.md"]);
    });

    test("候補のディレクトリには / を付けて見せる", () => {
        expect(at("ls ").candidates).toEqual(["about.md", "blog/", "projects/"]);
    });

    test("隠しファイルは . で始めたときだけ", () => {
        expect(at("cat .").line).toBe("cat .secret ");
    });

    test("オプション・存在しないディレクトリ・一致なしは変えない", () => {
        expect(at("ls -")).toEqual({ line: "ls -", cursor: 4, candidates: [] });
        expect(at("cat nope/x")).toEqual({ line: "cat nope/x", cursor: 10, candidates: [] });
        expect(at("cat zzz")).toEqual({ line: "cat zzz", cursor: 7, candidates: [] });
        expect(at("cat about.md/")).toEqual({ line: "cat about.md/", cursor: 13, candidates: [] });
    });

    test("カーソルが途中にあるときは、カーソルの前だけを補完して後ろを残す", () => {
        const line = "cat ab | wc -l";
        expect(complete(line, 6, fs)).toEqual({ line: "cat about.md  | wc -l", cursor: 13, candidates: [] });
    });
});
