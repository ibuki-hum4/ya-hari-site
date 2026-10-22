import { describe, expect, test } from "bun:test";
import { complete } from "./complete";
import { ALL_PODS, matchHiddenCommand } from "./hidden";
import { parse } from "./parser";
import { dir } from "./vfs";

// コマンド行を、シェルと同じようにパースしてから判定する
const match = (line: string) => {
    const result = parse(line);
    if (!result.ok || result.pipeline.length !== 1) throw new Error(`bad line: ${line}`);
    return matchHiddenCommand(result.pipeline[0]);
};

describe("rm -rf /", () => {
    test.each([
        "rm -rf /",
        "rm -rf /*",
        "rm -rf / --no-preserve-root",
        "sudo rm -rf /",
        // 仕様にない自然な形も受け付ける
        "rm -fr /",
        "rm -r -f /",
        "rm -Rf /",
        "rm -rf --no-preserve-root /",
        "rm --recursive --force /",
        "sudo rm -fr /* --no-preserve-root",
    ])("受け付ける: %s", (line) => {
        expect(match(line)).toEqual({ kind: "wipe" });
    });

    test.each([
        "rm /",
        "rm -r /",
        "rm -f /",
        "rm -rf ~",
        "rm -rf .",
        "rm -rf /home",
        "rm -rf / /tmp",
        "rm -rfv /",
        "rm -rf",
        "rm",
        "sudo rm about.md",
        "sudo sudo rm -rf /",
        "rmdir -rf /",
    ])("受け付けない: %s", (line) => {
        expect(match(line)).toBeNull();
    });
});

describe("poweroff", () => {
    test.each(["poweroff", "sudo poweroff"])("受け付ける: %s", (line) => {
        expect(match(line)).toEqual({ kind: "poweroff" });
    });

    test.each(["poweroff now", "poweroff -f", "shutdown", "sudo"])("受け付けない: %s", (line) => {
        expect(match(line)).toBeNull();
    });
});

describe("kubectl delete pod", () => {
    test.each([
        ["kubectl delete pod web", ["web"]],
        ["kubectl delete po web", ["web"]],
        ["kubectl delete pods web", ["web"]],
        ["kubectl delete pod web api", ["web", "api"]],
        ["sudo kubectl delete pod web", ["web"]],
        ["kubectl delete pods --all", ALL_PODS],
        ["kubectl delete pod --all", ALL_PODS],
    ] as [string, string[]][])("受け付ける: %s", (line, pods) => {
        expect(match(line)).toEqual({ kind: "pod-delete", pods });
    });

    test.each([
        "kubectl",
        "kubectl get pods",
        "kubectl delete",
        "kubectl delete pod",
        "kubectl delete pods --all web",
        "kubectl delete pod web -n default",
        "kubectl delete deployment web",
        "kubectl delete svc web",
        "kubectl apply -f pod.yaml",
    ])("受け付けない: %s", (line) => {
        expect(match(line)).toBeNull();
    });
});

describe("補完", () => {
    test("隠しコマンドは補完の候補に出ない", () => {
        const fs = dir("", [], new Date());
        for (const prefix of ["r", "p", "k", "s"]) {
            const result = complete(prefix, prefix.length, fs);
            const offered = [...result.candidates, result.line.trim()];
            for (const name of ["rm", "poweroff", "kubectl", "sudo"]) expect(offered).not.toContain(name);
        }
    });
});
