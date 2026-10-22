// help にも補完にも出さない隠しコマンド。決まった形だけを受け付け、それ以外は command not found のまま
//   rm -rf /            → 削除ログ・崩壊 → 再起動（ブートログ）
//   poweroff            → ターミナルを閉じて停電モード
//   kubectl delete pod  → イベントログ・崩壊 → 500 → 復活

export type HiddenCommand =
    | { kind: "wipe" }
    | { kind: "poweroff" }
    | { kind: "pod-delete"; pods: string[] };

// kubectl delete pods --all で消えたことにする Pod
export const ALL_PODS = ["portfolio-7f9c8d6b5-x2k4q", "portfolio-7f9c8d6b5-m8zp1", "portfolio-7f9c8d6b5-qw3rt"];

function matchRm(args: string[]): boolean {
    const options = args.filter((a) => a.startsWith("-"));
    const operands = args.filter((a) => !a.startsWith("-"));
    if (operands.length !== 1 || (operands[0] !== "/" && operands[0] !== "/*")) return false;

    let recursive = false;
    let force = false;
    for (const option of options) {
        if (option === "--no-preserve-root") continue;
        if (option === "--recursive") recursive = true;
        else if (option === "--force") force = true;
        else if (/^-[rRf]+$/.test(option)) {
            if (/[rR]/.test(option)) recursive = true;
            if (option.includes("f")) force = true;
        } else {
            return false;
        }
    }
    return recursive && force;
}

function matchKubectl(args: string[]): string[] | null {
    const [verb, resource, ...rest] = args;
    if (verb !== "delete" || !["pod", "pods", "po"].includes(resource)) return null;
    if (rest.length === 1 && rest[0] === "--all") return ALL_PODS;
    if (rest.length === 0 || rest.some((name) => name.startsWith("-"))) return null;
    return rest;
}

export function matchHiddenCommand(argv: string[]): HiddenCommand | null {
    // sudo は前に付いていても付いていなくても同じ扱い
    const [name, ...args] = argv[0] === "sudo" ? argv.slice(1) : argv;
    if (name === "rm" && matchRm(args)) return { kind: "wipe" };
    if (name === "poweroff" && args.length === 0) return { kind: "poweroff" };
    if (name === "kubectl") {
        const pods = matchKubectl(args);
        if (pods) return { kind: "pod-delete", pods };
    }
    return null;
}
