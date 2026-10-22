// 読み取り専用の仮想ファイルシステム。ターミナルを開いた時点のサイトのデータから組み立てる
// cwd は常に HOME。cd は無いので、相対パスはすべて HOME からの相対になる

export type VFile = { kind: "file"; name: string; content: string; mtime: Date };
export type VDir = { kind: "dir"; name: string; children: VNode[]; mtime: Date };
export type VNode = VFile | VDir;

export const HOME = "/home/yahari";

export function file(name: string, content: string, mtime: Date): VFile {
    return { kind: "file", name, content, mtime };
}

// 子は名前順に並べておく（ls・tree・補完の出力順をここで決める）
export function dir(name: string, children: VNode[], mtime: Date): VDir {
    const sorted = [...children].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    return { kind: "dir", name, children: sorted, mtime };
}

export type FsError = "ENOENT" | "ENOTDIR";

export const errorMessages = {
    ENOENT: "No such file or directory",
    ENOTDIR: "Not a directory",
    EISDIR: "Is a directory",
} as const;

// "~" "./" "../" を解いて、ルートからのセグメント列にする
export function resolvePath(input: string): string[] {
    let path = input;
    if (path === "~" || path.startsWith("~/")) path = HOME + path.slice(1);
    else if (!path.startsWith("/")) path = `${HOME}/${path}`;

    const segments: string[] = [];
    for (const segment of path.split("/")) {
        if (segment === "" || segment === ".") continue;
        if (segment === "..") segments.pop();
        else segments.push(segment);
    }
    return segments;
}

export function stat(root: VDir, input: string): { node: VNode } | { error: FsError } {
    let node: VNode = root;
    for (const segment of resolvePath(input)) {
        if (node.kind !== "dir") return { error: "ENOTDIR" };
        const child: VNode | undefined = node.children.find((c) => c.name === segment);
        if (!child) return { error: "ENOENT" };
        node = child;
    }
    // "about.md/" のように末尾にスラッシュがあるのに中身がファイル
    if (node.kind === "file" && input.endsWith("/")) return { error: "ENOTDIR" };
    return { node };
}

export function byteLength(text: string): number {
    return new TextEncoder().encode(text).length;
}

// 末尾の改行で空の行ができないように分割する
export function splitLines(text: string): string[] {
    if (text === "") return [];
    const lines = text.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();
    return lines;
}

export function joinLines(lines: string[]): string {
    return lines.map((line) => `${line}\n`).join("");
}

// ディレクトリ配下のファイルを深さ優先で列挙する（grep -r 用）
export function walkFiles(node: VDir, label: string): { label: string; file: VFile }[] {
    const result: { label: string; file: VFile }[] = [];
    for (const child of node.children) {
        const childLabel = label === "" ? child.name : `${label.replace(/\/+$/, "")}/${child.name}`;
        if (child.kind === "file") result.push({ label: childLabel, file: child });
        else result.push(...walkFiles(child, childLabel));
    }
    return result;
}
