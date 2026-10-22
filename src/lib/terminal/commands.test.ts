import { describe, expect, test } from "bun:test";
import { commandNames, strftime, type CommandResult, type TerminalStrings } from "./commands";
import { execute } from "./shell";
import { dir, file } from "./vfs";

const now = new Date(2026, 9, 22, 12, 0, 0);
const old = new Date(2025, 0, 5, 9, 30, 0);

const numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

const fs = dir("", [
    dir("home", [
        dir("yahari", [
            file("about.md", "# Yahari\n\nI love Music.\nKubernetes fan\n", now),
            file("numbers.txt", numbers.map((n) => `${n}\n`).join(""), old),
            file(".secret", "hidden\n", now),
            dir("projects", [
                file("alt-bot.md", "# ALT\nDiscord bot\n", now),
                file("api.md", "# API\nREST music API\n", now),
            ], now),
            dir("empty", [], now),
        ], now),
    ], now),
], now);

const strings: TerminalStrings = {
    help: {
        intro: "Commands:",
        footer: "footer line",
        commands: Object.fromEntries(commandNames.map((name) => [name, `about ${name}`])) as TerminalStrings["help"]["commands"],
    },
};

const run = (line: string, history: string[] = [line]): CommandResult =>
    execute(line, { fs, history, strings, now, user: "guest" });
const stdout = (r: CommandResult) => r.chunks.filter((c) => c.stream === "out").map((c) => c.text).join("");
const stderr = (r: CommandResult) => r.chunks.filter((c) => c.stream === "err").map((c) => c.text).join("");

describe("ls", () => {
    test("画面に出すときは1行に並べ、隠しファイルは出さない", () => {
        expect(stdout(run("ls"))).toBe("about.md  empty  numbers.txt  projects\n");
    });

    test("パイプに流すときは1行に1つ", () => {
        expect(stdout(run("ls projects | cat"))).toBe("alt-bot.md\napi.md\n");
        expect(stdout(run("ls projects | wc -l"))).toBe("2\n");
    });

    test("-a で . と .. と隠しファイルも出す", () => {
        expect(stdout(run("ls -a"))).toBe(".  ..  .secret  about.md  empty  numbers.txt  projects\n");
    });

    test("-l は詳細表示。半年より前の日付は年を出す", () => {
        const lines = stdout(run("ls -l")).split("\n");
        expect(lines[0]).toBe("total 16");
        expect(lines[1]).toBe("-rw-r--r-- 1 yahari yahari   39 Oct 22 12:00 about.md");
        expect(lines[2]).toBe("drwxr-xr-x 2 yahari yahari 4096 Oct 22 12:00 empty");
        expect(lines[3]).toBe("-rw-r--r-- 1 yahari yahari   63 Jan  5  2025 numbers.txt");
        expect(lines[4]).toBe("drwxr-xr-x 2 yahari yahari 4096 Oct 22 12:00 projects");
    });

    test("-la のように結合しても、オプションを後ろに置いてもよい", () => {
        expect(stdout(run("ls -la projects"))).toBe(stdout(run("ls projects -l -a")));
    });

    test("ファイルを指定したらその名前を出す", () => {
        expect(stdout(run("ls about.md"))).toBe("about.md\n");
    });

    test("複数のディレクトリは見出しを付ける", () => {
        expect(stdout(run("ls projects empty"))).toBe("projects:\nalt-bot.md  api.md\n\nempty:\n");
    });

    test("無いパスはエラー（終了コード 2）", () => {
        const r = run("ls nope");
        expect(stderr(r)).toBe("ls: cannot access 'nope': No such file or directory\n");
        expect(r.code).toBe(2);
    });

    test("知らないオプションはエラー", () => {
        expect(stderr(run("ls -z"))).toBe("ls: invalid option -- 'z'\nTry 'ls --help' for more information.\n");
    });
});

describe("cat", () => {
    test("ファイルを連結して出す", () => {
        expect(stdout(run("cat projects/alt-bot.md projects/api.md"))).toBe("# ALT\nDiscord bot\n# API\nREST music API\n");
    });

    test("~ や絶対パスでも読める", () => {
        expect(stdout(run("cat ~/projects/api.md"))).toBe(stdout(run("cat /home/yahari/projects/api.md")));
    });

    test("引数が無ければ標準入力をそのまま出す", () => {
        expect(stdout(run("echo hi | cat"))).toBe("hi\n");
    });

    test("無いファイル・ディレクトリはエラーで、残りは出す", () => {
        const r = run("cat nope projects projects/api.md");
        expect(stderr(r)).toBe("cat: nope: No such file or directory\ncat: projects: Is a directory\n");
        expect(stdout(r)).toBe("# API\nREST music API\n");
        expect(r.code).toBe(1);
    });

    test("エラーと出力の順番を保つ", () => {
        const r = run("cat projects/api.md nope");
        expect(r.chunks.map((c) => c.stream)).toEqual(["out", "err"]);
    });
});

describe("grep", () => {
    test("一致した行を出す。一致しなければ終了コード 1", () => {
        expect(stdout(run("grep Music about.md"))).toBe("I love Music.\n");
        expect(run("grep music about.md").code).toBe(1);
    });

    test("-i で大文字小文字を無視する", () => {
        expect(stdout(run("grep -i music about.md"))).toBe("I love Music.\n");
    });

    test("-n で行番号を付ける", () => {
        expect(stdout(run("grep -n Kube about.md"))).toBe("4:Kubernetes fan\n");
    });

    test("ファイルが複数ならファイル名を付ける", () => {
        expect(stdout(run("grep -i '^#' projects/alt-bot.md projects/api.md"))).toBe(
            "projects/alt-bot.md:# ALT\nprojects/api.md:# API\n",
        );
    });

    test("-r はディレクトリを再帰的に探す（パス無しなら ~ 全体）", () => {
        expect(stdout(run("grep -ri music"))).toBe("about.md:I love Music.\nprojects/api.md:REST music API\n");
        expect(stdout(run("grep -rn API projects"))).toBe("projects/api.md:1:# API\nprojects/api.md:2:REST music API\n");
        expect(stdout(run("grep -r ALT ."))).toBe("./projects/alt-bot.md:# ALT\n");
    });

    test("-r 無しでディレクトリを渡したらエラー（終了コード 2）", () => {
        const r = run("grep ALT projects");
        expect(stderr(r)).toBe("grep: projects: Is a directory\n");
        expect(r.code).toBe(2);
    });

    test("パイプの入力を読む", () => {
        expect(stdout(run("cat about.md | grep -i love"))).toBe("I love Music.\n");
    });

    test("パターンが無い・正規表現が壊れている・ファイルが無いときはエラー", () => {
        expect(stderr(run("grep"))).toStartWith("Usage: grep [OPTION]... PATTERNS [FILE]...");
        expect(run("grep '(' about.md").code).toBe(2);
        expect(stderr(run("grep x nope"))).toBe("grep: nope: No such file or directory\n");
    });
});

describe("head / tail", () => {
    test("既定は 10 行", () => {
        expect(stdout(run("head numbers.txt")).split("\n")).toHaveLength(11);
        expect(stdout(run("tail numbers.txt"))).toStartWith("three\n");
    });

    test("-n N / -nN / -N のどれでも指定できる", () => {
        expect(stdout(run("head -n 2 numbers.txt"))).toBe("one\ntwo\n");
        expect(stdout(run("head -n2 numbers.txt"))).toBe("one\ntwo\n");
        expect(stdout(run("tail -2 numbers.txt"))).toBe("eleven\ntwelve\n");
    });

    test("tail -n +N は N 行目から", () => {
        expect(stdout(run("tail -n +11 numbers.txt"))).toBe("eleven\ntwelve\n");
    });

    test("-n 0 は何も出さない", () => {
        expect(stdout(run("head -n 0 numbers.txt"))).toBe("");
        expect(stdout(run("tail -n 0 numbers.txt"))).toBe("");
    });

    test("複数ファイルは見出しを付ける", () => {
        expect(stdout(run("head -n 1 about.md projects/api.md"))).toBe(
            "==> about.md <==\n# Yahari\n\n==> projects/api.md <==\n# API\n",
        );
    });

    test("パイプの入力を読む", () => {
        expect(stdout(run("cat numbers.txt | tail -n 1"))).toBe("twelve\n");
    });

    test("エラーは GNU と同じ文言", () => {
        expect(stderr(run("head nope"))).toBe("head: cannot open 'nope' for reading: No such file or directory\n");
        expect(stderr(run("tail projects"))).toBe("tail: error reading 'projects': Is a directory\n");
        expect(stderr(run("head -n abc about.md"))).toBe("head: invalid number of lines: 'abc'\n");
    });
});

describe("wc", () => {
    test("行・単語・バイトを数える", () => {
        expect(stdout(run("wc about.md"))).toBe(" 4  7 39 about.md\n");
    });

    test("-l は行数だけ。標準入力で値が1つなら詰めて出す", () => {
        expect(stdout(run("wc -l about.md"))).toBe("4 about.md\n");
        expect(stdout(run("cat numbers.txt | wc -l"))).toBe("12\n");
    });

    test("標準入力で複数の値なら幅 7 で揃える", () => {
        expect(stdout(run("echo hi | wc"))).toBe("      1       1       3\n");
    });

    test("バイト数は UTF-8 で数える", () => {
        expect(stdout(run("echo 音楽 | wc"))).toBe("      1       1       7\n");
    });

    test("複数ファイルは合計を付ける", () => {
        expect(stdout(run("wc -l about.md numbers.txt"))).toBe(" 4 about.md\n12 numbers.txt\n16 total\n");
    });

    test("無いファイルはエラー", () => {
        const r = run("wc nope");
        expect(stderr(r)).toBe("wc: nope: No such file or directory\n");
        expect(r.code).toBe(1);
    });
});

describe("tree", () => {
    test("ツリーと集計を出す", () => {
        expect(stdout(run("tree"))).toBe(
            [
                ".",
                "├── about.md",
                "├── empty",
                "├── numbers.txt",
                "└── projects",
                "    ├── alt-bot.md",
                "    └── api.md",
                "",
                "2 directories, 4 files",
                "",
            ].join("\n"),
        );
    });

    test("-a で隠しファイルも出す", () => {
        expect(stdout(run("tree -a"))).toContain("├── .secret\n");
    });

    test("ディレクトリでなければ開けない", () => {
        expect(stdout(run("tree about.md"))).toBe("about.md  [error opening dir]\n\n0 directories, 0 files\n");
    });
});

describe("その他のコマンド", () => {
    test("echo は引数を空白でつなぐ。-n で改行しない", () => {
        expect(stdout(run("echo hello   world"))).toBe("hello world\n");
        expect(stdout(run("echo -n hi"))).toBe("hi");
        expect(stdout(run("echo --help"))).toBe("--help\n");
    });

    test("pwd・whoami", () => {
        expect(stdout(run("pwd"))).toBe("/home/yahari\n");
        expect(stdout(run("whoami"))).toBe("guest\n");
        expect(stderr(run("whoami root"))).toStartWith("whoami: extra operand 'root'");
    });

    test("date は +FORMAT に対応する", () => {
        expect(stdout(run("date +%F"))).toBe("2026-10-22\n");
        expect(stdout(run("date '+%Y/%m/%d %H:%M'"))).toBe("2026/10/22 12:00\n");
        expect(stdout(run("date"))).toMatch(/^Thu Oct 22 12:00:00 \S+ 2026\n$/);
        expect(stderr(run("date tomorrow"))).toBe("date: invalid date 'tomorrow'\n");
    });

    test("strftime の %e は空白で詰める", () => {
        expect(strftime("%b %e", new Date(2026, 0, 5))).toBe("Jan  5");
    });

    test("history は番号付きで出す。N で末尾 N 件", () => {
        const history = ["ls", "pwd", "history"];
        expect(stdout(run("history", history))).toBe("    1  ls\n    2  pwd\n    3  history\n");
        expect(stdout(run("history 1", history))).toBe("    3  history\n");
        expect(stderr(run("history -c", history))).toStartWith("bash: history: -c: invalid option");
    });

    test("help は全コマンドの使い方と説明を出す", () => {
        const text = stdout(run("help"));
        expect(text).toStartWith("Commands:\n");
        for (const name of commandNames) expect(text).toContain(`about ${name}`);
        expect(text).toEndWith("footer line\n");
    });

    test("--help は使い方を出す", () => {
        expect(stdout(run("ls --help"))).toBe("Usage: ls [-la] [PATH]...\nabout ls\n");
    });

    test("clear は画面をクリアする効果を返す", () => {
        expect(run("clear").effect).toBe("clear");
    });
});

describe("存在しないコマンドと rm", () => {
    test("リスト外のコマンドは command not found（終了コード 127）", () => {
        for (const name of ["sudo", "apt", "nmap", "cd", "kubectl", "vim"]) {
            const r = run(`${name} something`);
            expect(stderr(r)).toBe(`bash: ${name}: command not found\n`);
            expect(r.code).toBe(127);
        }
    });

    test("rm -rf / は崩壊 → 再起動の演出を発動する（何も出力しない）", () => {
        for (const line of ["rm -rf /", "rm -fr /", "  rm   -rf   /  ", "sudo rm -rf /*"]) {
            const r = run(line);
            expect(r.effect).toEqual({ kind: "wipe" });
            expect(r.chunks).toEqual([]);
        }
    });

    test("kubectl delete pod は pod \"…\" deleted を出してから演出を発動する", () => {
        const r = run("kubectl delete pod demo web");
        expect(stdout(r)).toBe('pod "demo" deleted\npod "web" deleted\n');
        expect(r.effect).toEqual({ kind: "pod-delete", pods: ["demo", "web"] });
    });

    test("poweroff は停電を発動する", () => {
        expect(run("poweroff").effect).toEqual({ kind: "poweroff" });
    });

    test("形が違う kubectl / poweroff / sudo は command not found", () => {
        expect(stderr(run("kubectl get pods"))).toBe("bash: kubectl: command not found\n");
        expect(stderr(run("poweroff now"))).toBe("bash: poweroff: command not found\n");
        expect(stderr(run("sudo ls"))).toBe("bash: sudo: command not found\n");
    });

    test("隠しコマンドは help にも補完の候補にも出ない", () => {
        const help = stdout(run("help"));
        for (const name of ["rm", "poweroff", "kubectl", "sudo"]) {
            expect(help).not.toContain(`  ${name}`);
            expect(commandNames as readonly string[]).not.toContain(name);
        }
    });

    test("それ以外の rm は command not found", () => {
        for (const line of ["rm about.md", "rm -rf ~", "rm -rf / x", "rm -r /", "rm"]) {
            const r = run(line);
            expect(r.effect).toBeUndefined();
            expect(stderr(r)).toBe("bash: rm: command not found\n");
        }
    });
});

describe("パイプ", () => {
    test("3段以上つなげられる", () => {
        expect(stdout(run("cat numbers.txt | grep e | head -n 3 | wc -l"))).toBe("3\n");
    });

    test("途中の段の出力は画面に出ず、エラーは出る", () => {
        const r = run("cat nope about.md | grep -c x");
        expect(stderr(r)).toContain("cat: nope: No such file or directory");
        expect(stderr(r)).toContain("grep: invalid option -- 'c'");
    });

    test("終了コードは最後の段のもの", () => {
        expect(run("cat nope | wc -l").code).toBe(0);
        expect(run("cat about.md | grep zzz").code).toBe(1);
    });

    test("構文エラーは終了コード 2", () => {
        const r = run("ls |");
        expect(r.code).toBe(2);
        expect(stderr(r)).toBe("bash: syntax error near unexpected token `|'\n");
    });
});
