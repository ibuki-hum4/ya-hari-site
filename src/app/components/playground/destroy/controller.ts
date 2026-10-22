// 破壊モードの本体。複製を落とす・つかんで投げる・砕く・修復して元に戻す、までを受け持つ
// 本物のページは shared/curtain.ts の幕で隠すだけで、修復が終わったら幕を上げて元に戻す

import type MatterNS from "matter-js";
import { autoHealTrigger, type HealTrigger } from "@/lib/destroy/heal";
import { makeShards, toClipPath, type Point } from "@/lib/destroy/shards";
import { emit, type DestroySource } from "@/lib/playground/events";
import { collectPieces, findPageRoot, type Piece } from "../shared/collect";
import { lowerCurtain, raiseCurtain } from "../shared/curtain";

type Matter = typeof MatterNS;

export type HealStep = "detected" | "healing" | "done";

export type DestroyCallbacks = {
    onStart: (total: number) => void;
    onShatter: (destroyed: number, total: number) => void;
    onHealStart: () => void;
    onHealLog: (step: HealStep) => void;
    onFinished: (result: { destroyed: number; total: number; healMs: number }) => void;
};

export type DestroyController = {
    heal: (trigger: HealTrigger) => void;
    dispose: () => void;
};

type Options = {
    layer: HTMLElement; // 複製を置く層
    canvas: HTMLCanvasElement; // 粉の層
    hit: HTMLElement; // ポインタを受ける層
    matter: Matter | null; // prefers-reduced-motion のときは null（物理演算なし）
    reducedMotion: boolean;
    source: DestroySource;
    callbacks: DestroyCallbacks;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };

const SHAKE_MS = 500;
const TAP_DISTANCE = 8;
const TAP_MS = 350;
const ALL_DESTROYED_DELAY_MS = 700; // 最後の破片が飛び散るのを見せてから修復に入る

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const transformOf = (p: { dx: number; dy: number; angle: number }) =>
    `translate(${p.dx}px, ${p.dy}px) rotate(${p.angle}rad)`;
const IDENTITY = "translate(0px, 0px) rotate(0rad)";

// アニメーションの完了を待つ（途中で cancel されても止まらない）
const settle = (animation: Animation) => animation.finished.then(() => undefined, () => undefined);

export function startDestroy(options: Options): DestroyController {
    const { layer, canvas, hit, matter, reducedMotion, source, callbacks } = options;
    const root = findPageRoot();
    const pieces = root ? collectPieces(root, layer) : [];
    const total = pieces.length;
    let destroyed = 0;
    let state: "playing" | "healing" | "done" = "playing";
    const startedAt = performance.now();
    let lastShatterAt = 0;

    emit("destroy:start", { source, total, reducedMotion });

    if (total === 0) {
        state = "done";
        callbacks.onStart(0);
        emit("heal:done", { trigger: "all-destroyed", destroyed: 0, total: 0, healMs: 0 });
        callbacks.onFinished({ destroyed: 0, total: 0, healMs: 0 });
        return { heal: () => {}, dispose: () => {} };
    }

    // 複製を置き終えたのと同じフレームで本物を隠すので、見た目は一瞬も変わらない
    lowerCurtain();
    callbacks.onStart(total);

    const preventDefault = (e: Event) => e.preventDefault();
    hit.addEventListener("wheel", preventDefault, { passive: false });

    // ---- 物理演算 ---------------------------------------------------------------
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const engine = matter?.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0012 } }) ?? null;
    const bodies = new Map<MatterNS.Body, Piece>();
    let drag: { pointerId: number; x: number; y: number; at: number; constraint: MatterNS.Constraint | null } | null = null;

    if (matter && engine) {
        const { Bodies, Composite } = matter;
        const { width, height } = viewport;
        const wall = { isStatic: true, restitution: 0.2, friction: 0.6 };
        Composite.add(engine.world, [
            Bodies.rectangle(width / 2, height + 100, width * 3, 200, wall), // 床
            Bodies.rectangle(-100, height / 2, 200, height * 6, wall), // 左
            Bodies.rectangle(width + 100, height / 2, 200, height * 6, wall), // 右
            Bodies.rectangle(width / 2, -height * 2 - 100, width * 3, 200, wall), // 投げすぎ防止の天井
        ]);
    }

    // 揺れが収まったら、全部の複製をボディにして落とす
    const drop = () => {
        if (!matter || !engine || state !== "playing") return;
        const { Bodies, Body, Composite } = matter;
        for (const piece of pieces) {
            if (piece.destroyed) continue;
            const { rect } = piece;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const material = { restitution: 0.3, friction: 0.4, frictionAir: 0.012 };
            const body = piece.round
                ? Bodies.circle(cx, cy, rect.width / 2 - 1, material)
                : Bodies.rectangle(cx, cy, Math.max(rect.width - 2, 4), Math.max(rect.height - 2, 4), {
                    ...material,
                    chamfer: { radius: Math.min(8, rect.width / 4, rect.height / 4) },
                });
            Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: -Math.random() * 2 });
            Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
            bodies.set(body, piece);
        }
        Composite.add(engine.world, [...bodies.keys()]);
    };

    if (!reducedMotion) {
        const jolt = () => `translate(${(Math.random() - 0.5) * 16}px, ${(Math.random() - 0.5) * 12}px)`;
        layer.animate(
            [{ transform: "none" }, ...Array.from({ length: 8 }, () => ({ transform: jolt() })), { transform: "none" }],
            { duration: SHAKE_MS },
        );
        setTimeout(drop, SHAKE_MS);
    }

    // ---- 粉 -----------------------------------------------------------------------
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx?.scale(dpr, dpr);
    const particles: Particle[] = [];

    const spawnDust = (point: Point, colors: string[]) => {
        const count = viewport.width < 640 ? 12 : 20;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.35;
            const life = 500 + Math.random() * 500;
            particles.push({
                x: point.x,
                y: point.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.2,
                life,
                maxLife: life,
                color: colors[i % colors.length],
                size: 2 + Math.random() * 3,
            });
        }
    };

    const drawDust = (dt: number) => {
        if (!ctx) return;
        ctx.clearRect(0, 0, viewport.width, viewport.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.vy += 0.0012 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    };

    // ---- 毎フレーム -----------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
        const dt = Math.min(now - last, 33);
        last = now;

        if (matter && engine && state === "playing" && bodies.size > 0) {
            matter.Engine.update(engine, dt);
            for (const [body, piece] of bodies) {
                piece.dx = body.position.x - (piece.rect.left + piece.rect.width / 2);
                piece.dy = body.position.y - (piece.rect.top + piece.rect.height / 2);
                piece.angle = body.angle;
                piece.clone.style.transform = transformOf(piece);
            }
        }
        drawDust(dt);

        if (state === "playing") {
            const trigger = autoHealTrigger({ destroyed, total, elapsedMs: now - startedAt });
            if (trigger === "timeout" || (trigger === "all-destroyed" && now - lastShatterAt >= ALL_DESTROYED_DELAY_MS)) {
                heal(trigger);
            }
        }
        if (state !== "done") raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // ---- 当たり判定・砕く --------------------------------------------------------
    const findPiece = (point: Point): { piece: Piece; body: MatterNS.Body | null } | null => {
        if (matter && bodies.size > 0) {
            const [body] = matter.Query.point([...bodies.keys()], point);
            return body ? { piece: bodies.get(body)!, body } : null;
        }
        // 物理演算の前（揺れている間）や reduced motion のときは、元の矩形で判定する
        for (let i = pieces.length - 1; i >= 0; i--) {
            const { rect, destroyed: gone, dx, dy } = pieces[i];
            if (gone) continue;
            const x = point.x - dx;
            const y = point.y - dy;
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return { piece: pieces[i], body: null };
        }
        return null;
    };

    // 叩いた点を、回転を戻した要素内の割合座標にする（破片の割れ目の中心）
    const toLocal = (piece: Piece, point: Point): Point => {
        const { rect } = piece;
        const cx = rect.left + rect.width / 2 + piece.dx;
        const cy = rect.top + rect.height / 2 + piece.dy;
        const cos = Math.cos(-piece.angle);
        const sin = Math.sin(-piece.angle);
        const vx = point.x - cx;
        const vy = point.y - cy;
        const clamp = (v: number) => Math.min(0.85, Math.max(0.15, v));
        return {
            x: clamp((vx * cos - vy * sin) / rect.width + 0.5),
            y: clamp((vx * sin + vy * cos) / rect.height + 0.5),
        };
    };

    const shatter = (piece: Piece, body: MatterNS.Body | null, point: Point) => {
        if (piece.destroyed || state !== "playing") return;
        piece.destroyed = true;
        destroyed++;
        lastShatterAt = performance.now();
        if (body && matter && engine) {
            matter.Composite.remove(engine.world, body);
            bodies.delete(body);
        }
        emit("element:shatter", { destroyed, total });
        callbacks.onShatter(destroyed, total);

        const { clone } = piece;
        if (reducedMotion) {
            void settle(clone.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 })).then(() => {
                if (piece.destroyed) clone.style.visibility = "hidden";
            });
            return;
        }

        const complex = clone.getElementsByTagName("*").length > 60;
        const shards = makeShards(viewport.width < 640 || complex ? 4 : 6, toLocal(piece, point));
        const cos = Math.cos(piece.angle);
        const sin = Math.sin(piece.angle);
        for (const shard of shards) {
            const node = clone.cloneNode(true) as HTMLElement;
            node.style.clipPath = toClipPath(shard.polygon);
            layer.appendChild(node);
            const distance = 80 + Math.random() * 120;
            const dirX = shard.direction.x * cos - shard.direction.y * sin;
            const dirY = shard.direction.x * sin + shard.direction.y * cos;
            const end = {
                dx: piece.dx + dirX * distance,
                dy: piece.dy + dirY * distance + 120,
                angle: piece.angle + (Math.random() - 0.5) * 1.6,
            };
            void settle(
                node.animate(
                    [{ transform: transformOf(piece), opacity: 1 }, { transform: transformOf(end), opacity: 0 }],
                    { duration: 700, easing: "cubic-bezier(.2, .6, .4, 1)" },
                ),
            ).then(() => node.remove());
        }
        clone.style.visibility = "hidden";

        const style = getComputedStyle(clone);
        const colors = [style.color, style.backgroundColor].filter((c) => c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent");
        spawnDust(point, colors.length > 0 ? colors : [style.color]);
    };

    // ---- つかんで投げる（ドラッグ）・叩く（タップ） ------------------------------
    const onPointerDown = (e: PointerEvent) => {
        if (state !== "playing" || drag) return;
        e.preventDefault();
        try {
            // 画面の外までドラッグしても離した位置を受け取れるように
            hit.setPointerCapture(e.pointerId);
        } catch {
            // ポインタがもう離れているなど。捕まえられなくても続ける
        }
        const point = { x: e.clientX, y: e.clientY };
        let constraint: MatterNS.Constraint | null = null;
        const found = findPiece(point);
        if (found?.body && matter && engine) {
            constraint = matter.Constraint.create({
                pointA: point,
                bodyB: found.body,
                pointB: { x: point.x - found.body.position.x, y: point.y - found.body.position.y },
                stiffness: 0.2,
                damping: 0.1,
                length: 0,
            });
            matter.Composite.add(engine.world, constraint);
        }
        drag = { pointerId: e.pointerId, x: point.x, y: point.y, at: performance.now(), constraint };
    };

    const onPointerMove = (e: PointerEvent) => {
        if (drag?.pointerId !== e.pointerId || !drag.constraint) return;
        drag.constraint.pointA = { x: e.clientX, y: e.clientY };
    };

    const releaseDrag = () => {
        if (drag?.constraint && matter && engine) matter.Composite.remove(engine.world, drag.constraint);
        drag = null;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (drag?.pointerId !== e.pointerId) return;
        const point = { x: e.clientX, y: e.clientY };
        const isTap = Math.hypot(point.x - drag.x, point.y - drag.y) < TAP_DISTANCE && performance.now() - drag.at < TAP_MS;
        releaseDrag();
        if (!isTap) return;
        const found = findPiece(point);
        if (found) shatter(found.piece, found.body, point);
    };

    hit.addEventListener("pointerdown", onPointerDown);
    hit.addEventListener("pointermove", onPointerMove);
    hit.addEventListener("pointerup", onPointerUp);
    hit.addEventListener("pointercancel", releaseDrag);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        heal("escape");
    };
    window.addEventListener("keydown", onKeyDown, true);

    // ---- 元に戻す ---------------------------------------------------------------
    const restore = () => {
        state = "done";
        cancelAnimationFrame(raf);
        releaseDrag();
        window.removeEventListener("keydown", onKeyDown, true);
        hit.removeEventListener("wheel", preventDefault);
        hit.removeEventListener("pointerdown", onPointerDown);
        hit.removeEventListener("pointermove", onPointerMove);
        hit.removeEventListener("pointerup", onPointerUp);
        hit.removeEventListener("pointercancel", releaseDrag);
        if (matter && engine) {
            matter.Composite.clear(engine.world, false);
            matter.Engine.clear(engine);
        }
        layer.replaceChildren();
        ctx?.clearRect(0, 0, viewport.width, viewport.height);
        return raiseCurtain();
    };

    // ---- 自己修復 ---------------------------------------------------------------
    const healPiece = async (piece: Piece, delay: number) => {
        const { clone } = piece;
        clone.getAnimations().forEach((a) => a.cancel());

        if (!piece.destroyed) {
            if (reducedMotion) return;
            await settle(
                clone.animate([{ transform: transformOf(piece) }, { transform: IDENTITY }], {
                    duration: 800,
                    delay,
                    easing: "cubic-bezier(.16, 1, .3, 1)",
                    fill: "forwards",
                }),
            );
            clone.style.transform = "none";
            return;
        }

        if (reducedMotion) {
            clone.style.transform = "none";
            clone.style.visibility = "visible";
            await settle(clone.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay }));
            return;
        }

        // 砕けたものは、散った破片が逆再生のように集まって元に戻る
        const nodes = makeShards(5, { x: 0.5, y: 0.5 }).map((shard) => {
            const node = clone.cloneNode(true) as HTMLElement;
            node.style.visibility = "visible";
            node.style.clipPath = toClipPath(shard.polygon);
            layer.appendChild(node);
            const distance = 120 + Math.random() * 120;
            const from = {
                dx: piece.dx + shard.direction.x * distance,
                dy: piece.dy + shard.direction.y * distance + 120,
                angle: piece.angle + (Math.random() - 0.5) * 1.6,
            };
            return { node, animation: node.animate(
                [{ transform: transformOf(from), opacity: 0 }, { transform: IDENTITY, opacity: 1 }],
                { duration: 900, delay, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "both" },
            ) };
        });
        await Promise.all(nodes.map(({ animation }) => settle(animation)));
        clone.style.transform = "none";
        clone.style.visibility = "visible";
        nodes.forEach(({ node }) => node.remove());
    };

    async function heal(trigger: HealTrigger) {
        if (state !== "playing") return;
        state = "healing";
        const healStartedAt = performance.now();
        releaseDrag();
        emit("heal:start", { trigger, destroyed, total });
        callbacks.onHealStart();

        callbacks.onHealLog("detected");
        await wait(reducedMotion ? 150 : 400);
        callbacks.onHealLog("healing");
        await Promise.all(pieces.map((piece, i) => healPiece(piece, reducedMotion ? 0 : Math.min(i * 30, 500))));
        callbacks.onHealLog("done");
        await wait(reducedMotion ? 300 : 600);

        if (state !== "healing") return; // 途中で dispose された
        const { restoreCheck } = restore();
        const healMs = performance.now() - healStartedAt;
        emit("heal:done", { trigger, destroyed, total, healMs, restoreCheck });
        callbacks.onFinished({ destroyed, total, healMs });
    }

    return {
        heal: (trigger) => void heal(trigger),
        // ページ遷移などで途中のまま消えるときは、演出を飛ばしてすぐ戻す
        dispose: () => {
            if (state !== "done") restore();
        },
    };
}
