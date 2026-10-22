// 演出でターミナルや画面に流すログ。乱数を渡せば毎回同じ内容を作れる

const pick = <T,>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];

// reduced motion ではログの量を 1/6 に減らす
export function logCount(base: number, reducedMotion: boolean): number {
    return reducedMotion ? Math.ceil(base / 6) : base;
}

// ---- rm -rf / ----------------------------------------------------------------

const DIRECTORIES = [
    "/usr/bin", "/usr/sbin", "/usr/lib/x86_64-linux-gnu", "/usr/share/locale/ja/LC_MESSAGES",
    "/etc/nginx", "/etc/nginx/sites-enabled", "/etc/systemd/system", "/etc/ssh",
    "/var/lib/apt/lists", "/var/log/journal", "/var/cache/fontconfig",
    "/opt/portfolio/.next/static/chunks", "/opt/portfolio/node_modules/react",
    "/home/yahari/projects", "/home/yahari/.config", "/boot/grub", "/lib/modules/6.8.0-yahari/kernel",
];

const FILES = [
    "ls", "bash", "cat", "grep", "node", "bun", "sshd", "systemctl",
    "nginx.conf", "resolv.conf", "passwd", "hosts", "vmlinuz", "grub.cfg",
    "index.html", "page.tsx", "layout.tsx", "about.md", "libc.so.6", "libssl.so.3",
];

export function wipeLog(count: number, random: () => number): string[] {
    const lines = Array.from({ length: count }, () => {
        const dir = pick(DIRECTORIES, random);
        return random() < 0.2 ? `removed directory '${dir}'` : `removed '${dir}/${pick(FILES, random)}'`;
    });
    // 最後は消せないものにぶつかって終わる
    lines.push("rm: cannot remove '/proc/1/mem': Operation not permitted");
    return lines;
}

// 崩壊のあとに流す systemd 風のブートログ
export function bootLog(reducedMotion: boolean): string[] {
    const lines = [
        "[    0.000000] Linux version 6.8.0-yahari (yahari@ya-hari) (gcc 13.2.0) #1 SMP PREEMPT_DYNAMIC",
        "[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.8.0-yahari root=/dev/nvme0n1p2 ro quiet",
        "[    0.184312] Mounting root filesystem...",
        "",
        "Welcome to Yahari OS 26.10!",
        "",
        "[  OK  ] Created slice system-getty.slice.",
        "[  OK  ] Started Journal Service.",
        "[  OK  ] Mounted /home/yahari.",
        "[  OK  ] Started Network Time Synchronization.",
        "[  OK  ] Reached target Network.",
        "[  OK  ] Started containerd container runtime.",
        "[  OK  ] Started Kubernetes Kubelet.",
        "[  OK  ] Started Next.js Portfolio Server (ya-hari.skyia.jp).",
        "[  OK  ] Reached target Multi-User System.",
        "[  OK  ] Reached target Graphical Interface.",
        "",
        "ya-hari login: guest (automatic login)",
    ];
    // reduced motion では見出しの行と最後だけにする
    return reducedMotion ? lines.filter((line) => line.startsWith("Welcome") || line.startsWith("ya-hari") || line.includes("Portfolio")) : lines;
}

// ---- kubectl delete pod --------------------------------------------------------

const IMAGE = "ghcr.io/ibuki-hum4/ya-hari:latest";

const hex = (random: () => number, length: number) =>
    Array.from({ length }, () => Math.floor(random() * 16).toString(16)).join("");

const podIp = (random: () => number) => `10.1.${Math.floor(random() * 255)}.${Math.floor(random() * 255)}`;

const EVENTS: ((pod: string, random: () => number) => string)[] = [
    (pod) => `Normal    Killing     pod/${pod}  Stopping container portfolio`,
    (pod, r) => `Normal    Killing     pod/${pod}  Killing container with id containerd://${hex(r, 12)}`,
    (pod, r) => `Warning   Unhealthy   pod/${pod}  Readiness probe failed: Get "http://${podIp(r)}:3000/api/health": dial tcp ${podIp(r)}:3000: connect: connection refused`,
    (pod) => `Warning   Unhealthy   pod/${pod}  Liveness probe failed: HTTP probe failed with statuscode: 500`,
    (pod) => `Warning   BackOff     pod/${pod}  Back-off restarting failed container portfolio in pod ${pod}`,
    (pod) => `Warning   Failed      pod/${pod}  Error: failed to start container "portfolio": context deadline exceeded`,
    (pod) => `Normal    Pulled      pod/${pod}  Container image "${IMAGE}" already present on machine`,
    () => `Warning   Upstream    ingress/ya-hari  upstream connect error or disconnect/reset before headers. reset reason: connection refused`,
];

export function podEventLog(count: number, pods: string[], random: () => number): string[] {
    return Array.from({ length: count }, (_, i) => {
        const age = `${Math.max(1, Math.floor((i / count) * 30))}s`.padEnd(6);
        return `${age}${pick(EVENTS, random)(pick(pods, random), random)}`;
    });
}

// 500 画面から戻るときに流す、Pod が立ち直るまでのログ
export function podRestartLog(pods: string[]): string[] {
    const [pod] = pods;
    return [
        `Restarting pod ${pod}...`,
        `Pulling image "${IMAGE}"`,
        "Successfully pulled image",
        "Created container portfolio",
        "Started container portfolio",
        "Readiness probe succeeded",
        `✅ pod/${pod} is Running (1/1 Ready)`,
    ];
}
