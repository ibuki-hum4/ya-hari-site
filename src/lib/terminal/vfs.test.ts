import { describe, expect, test } from "bun:test";
import { getopt } from "./options";
import { dir, file, joinLines, resolvePath, splitLines, stat, walkFiles } from "./vfs";

const now = new Date(2026, 9, 22, 12, 0, 0);
const fs = dir("", [
    dir("home", [
        dir("yahari", [
            file("about.md", "# about\n", now),
            dir("projects", [file("b.md", "b\n", now), file("a.md", "a\n", now)], now),
        ], now),
    ], now),
], now);

describe("resolvePath", () => {
    test("相対パスは ~ からの相対", () => {
        expect(resolvePath("about.md")).toEqual(["home", "yahari", "about.md"]);
        expect(resolvePath(".")).toEqual(["home", "yahari"]);
        expect(resolvePath("./projects/")).toEqual(["home", "yahari", "projects"]);
    });

    test("~ と ~/ を展開する", () => {
        expect(resolvePath("~")).toEqual(["home", "yahari"]);
        expect(resolvePath("~/projects")).toEqual(["home", "yahari", "projects"]);
    });

    test(".. で上に戻る。ルートより上には行かない", () => {
        expect(resolvePath("projects/../about.md")).toEqual(["home", "yahari", "about.md"]);
        expect(resolvePath("..")).toEqual(["home"]);
        expect(resolvePath("/../../..")).toEqual([]);
    });

    test("絶対パスはそのまま", () => {
        expect(resolvePath("/home/yahari/about.md")).toEqual(["home", "yahari", "about.md"]);
        expect(resolvePath("//home///yahari/")).toEqual(["home", "yahari"]);
    });
});

describe("stat", () => {
    test("ファイルとディレクトリを引ける", () => {
        const f = stat(fs, "about.md");
        expect("node" in f && f.node.kind).toBe("file");
        const d = stat(fs, "/home/yahari/projects");
        expect("node" in d && d.node.kind).toBe("dir");
    });

    test("無ければ ENOENT", () => {
        expect(stat(fs, "nope.md")).toEqual({ error: "ENOENT" });
        expect(stat(fs, "projects/nope.md")).toEqual({ error: "ENOENT" });
    });

    test("ファイルの下を辿ろうとしたら ENOTDIR", () => {
        expect(stat(fs, "about.md/x")).toEqual({ error: "ENOTDIR" });
        expect(stat(fs, "about.md/")).toEqual({ error: "ENOTDIR" });
    });

    test("dir() は子を名前順に並べる", () => {
        const projects = stat(fs, "projects");
        if (!("node" in projects) || projects.node.kind !== "dir") throw new Error("not a dir");
        expect(projects.node.children.map((c) => c.name)).toEqual(["a.md", "b.md"]);
    });
});

describe("splitLines / joinLines", () => {
    test("末尾の改行で空行を作らない", () => {
        expect(splitLines("a\nb\n")).toEqual(["a", "b"]);
        expect(splitLines("a\nb")).toEqual(["a", "b"]);
        expect(splitLines("")).toEqual([]);
        expect(splitLines("\n")).toEqual([""]);
    });

    test("joinLines は各行に改行を付ける", () => {
        expect(joinLines(["a", "b"])).toBe("a\nb\n");
        expect(joinLines([])).toBe("");
    });
});

describe("walkFiles", () => {
    test("配下のファイルをラベル付きで列挙する", () => {
        const home = stat(fs, "~");
        if (!("node" in home) || home.node.kind !== "dir") throw new Error("not a dir");
        expect(walkFiles(home.node, "").map((f) => f.label)).toEqual(["about.md", "projects/a.md", "projects/b.md"]);
        expect(walkFiles(home.node, "./").map((f) => f.label)).toEqual(["./about.md", "./projects/a.md", "./projects/b.md"]);
    });
});

describe("getopt", () => {
    test("結合したフラグを分ける", () => {
        const r = getopt("grep", ["-in", "foo"], { flags: "inr" });
        expect(r.ok && [...r.flags].sort()).toEqual(["i", "n"]);
        expect(r.ok && r.operands).toEqual(["foo"]);
    });

    test("オペランドの後ろのオプションも読む", () => {
        const r = getopt("grep", ["foo", "-i", "about.md"], { flags: "inr" });
        expect(r.ok && [...r.flags]).toEqual(["i"]);
        expect(r.ok && r.operands).toEqual(["foo", "about.md"]);
    });

    test("値は -n5 / -n 5 / -5 のどれでも取れる", () => {
        const spec = { withValue: "n", numericShorthand: "n" };
        for (const args of [["-n5"], ["-n", "5"], ["-5"]]) {
            const r = getopt("head", args, spec);
            expect(r.ok && r.values.get("n")).toBe("5");
        }
    });

    test("-- 以降はすべてオペランド", () => {
        const r = getopt("cat", ["--", "-l"], { flags: "l" });
        expect(r.ok && r.operands).toEqual(["-l"]);
        expect(r.ok && r.flags.size).toBe(0);
    });

    test("- 単体はオペランド（標準入力）", () => {
        const r = getopt("cat", ["-"], {});
        expect(r.ok && r.operands).toEqual(["-"]);
    });

    test("知らないオプション・値の欠落・長いオプションはエラー", () => {
        const invalid = getopt("ls", ["-z"], { flags: "la" });
        expect(!invalid.ok && invalid.error).toBe("ls: invalid option -- 'z'\nTry 'ls --help' for more information.");
        const missing = getopt("head", ["-n"], { withValue: "n" });
        expect(!missing.ok && missing.error).toStartWith("head: option requires an argument -- 'n'");
        const long = getopt("ls", ["--all"], { flags: "la" });
        expect(!long.ok && long.error).toStartWith("ls: unrecognized option '--all'");
    });
});
