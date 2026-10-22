import { afterEach, describe, expect, test } from "bun:test";
import { enter, exit, getMode, subscribe, transition } from "./mode";

afterEach(() => {
    for (const mode of ["terminal", "collapse", "reboot", "outage", "destroy", "blackout"] as const) exit(mode);
});

describe("隠しコマンドの流れ", () => {
    const others = ["terminal", "collapse", "reboot", "outage", "destroy", "blackout"] as const;

    test("rm -rf /: ターミナル → 崩壊 → 再起動 → 終わり", () => {
        enter("terminal");
        expect(transition("terminal", "collapse")).toBe(true);
        expect(transition("collapse", "reboot")).toBe(true);
        exit("reboot");
        expect(getMode()).toBe("idle");
    });

    test("kubectl delete pod: ターミナル → 崩壊 → 500 → 終わり", () => {
        enter("terminal");
        transition("terminal", "collapse");
        expect(transition("collapse", "outage")).toBe(true);
        exit("outage");
        expect(getMode()).toBe("idle");
    });

    test("poweroff: ターミナルから間を空けずに停電へ", () => {
        enter("terminal");
        expect(transition("terminal", "blackout")).toBe(true);
        expect(getMode()).toBe("blackout");
    });

    test.each(["collapse", "reboot", "outage", "destroy", "blackout"] as const)(
        "%s の間は、ほかのどれも発動できない",
        (running) => {
            enter("terminal");
            if (running !== "destroy" && running !== "blackout") {
                transition("terminal", "collapse");
                if (running !== "collapse") transition("collapse", running);
            } else {
                exit("terminal");
                enter(running);
            }
            expect(getMode()).toBe(running);
            for (const other of others) {
                if (other !== running) expect(enter(other)).toBe(false);
            }
            // ターミナルが開いていないので、ターミナルからの遷移もできない
            expect(transition("terminal", "collapse")).toBe(false);
            expect(getMode()).toBe(running);
        },
    );
});

describe("mode", () => {
    test("何も動いていなければ入れる", () => {
        expect(getMode()).toBe("idle");
        expect(enter("terminal")).toBe(true);
        expect(getMode()).toBe("terminal");
    });

    test("同時に動くのは1つだけ", () => {
        enter("blackout");
        expect(enter("destroy")).toBe(false);
        expect(enter("terminal")).toBe(false);
        expect(getMode()).toBe("blackout");
    });

    test("他のモードの exit では抜けない", () => {
        enter("destroy");
        exit("blackout");
        expect(getMode()).toBe("destroy");
        exit("destroy");
        expect(getMode()).toBe("idle");
    });

    test("transition は元のモードが動いているときだけ切り替える", () => {
        expect(transition("terminal", "destroy")).toBe(false);
        enter("terminal");
        expect(transition("terminal", "destroy")).toBe(true);
        expect(getMode()).toBe("destroy");
    });

    test("変化を購読できる", () => {
        const seen: string[] = [];
        const unsubscribe = subscribe(() => seen.push(getMode()));
        enter("terminal");
        exit("terminal");
        unsubscribe();
        enter("blackout");
        expect(seen).toEqual(["terminal", "idle"]);
    });
});
