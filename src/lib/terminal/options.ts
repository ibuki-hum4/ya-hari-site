// GNU getopt 風のオプション解析。-in のような結合、-n5 / -n 5、-- での打ち切り、
// オペランドの後ろに置いたオプション（grep foo -i）に対応する
// --help はコマンドに渡る前に shell.ts が拾うので、ここには来ない

export type OptSpec = {
    flags?: string; // 値を取らないオプション
    withValue?: string; // 値を取るオプション
    numericShorthand?: string; // "-5" をこのオプションの値として扱う（head / tail の -n）
};

export type OptResult =
    | { ok: true; flags: Set<string>; values: Map<string, string>; operands: string[] }
    | { ok: false; error: string };

export function getopt(command: string, args: string[], spec: OptSpec): OptResult {
    const flags = new Set<string>();
    const values = new Map<string, string>();
    const operands: string[] = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "--") {
            operands.push(...args.slice(i + 1));
            break;
        }
        if (arg.startsWith("--")) {
            return { ok: false, error: `${command}: unrecognized option '${arg}'\nTry '${command} --help' for more information.` };
        }
        if (!arg.startsWith("-") || arg === "-") {
            operands.push(arg);
            continue;
        }
        if (spec.numericShorthand && /^-\d+$/.test(arg)) {
            values.set(spec.numericShorthand, arg.slice(1));
            continue;
        }

        for (let j = 1; j < arg.length; j++) {
            const ch = arg[j];
            if (spec.withValue?.includes(ch)) {
                const rest = arg.slice(j + 1);
                const value = rest !== "" ? rest : args[++i];
                if (value === undefined) {
                    return { ok: false, error: `${command}: option requires an argument -- '${ch}'\nTry '${command} --help' for more information.` };
                }
                values.set(ch, value);
                break;
            }
            if (!spec.flags?.includes(ch)) {
                return { ok: false, error: `${command}: invalid option -- '${ch}'\nTry '${command} --help' for more information.` };
            }
            flags.add(ch);
        }
    }

    return { ok: true, flags, values, operands };
}
