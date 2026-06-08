"use client";

import { useEffect, useRef, memo, useState, useCallback } from "react";
import type { WebGLRenderer, PointsMaterial } from "three";

// コナミコマンドのシーケンス
const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

// HSLからRGBに変換するヘルパー関数
function hslToHex(h: number, s: number, l: number): number {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
    };
    return (f(0) << 16) | (f(8) << 8) | f(4);
}

const PARTICLE_COUNT = 420;
const SCATTER_RADIUS = 6; // 散らばった状態の広がり
const GATHER_RADIUS = 1.8; // 集まった状態（球体）の半径
const MORPH_EASE = 0.05; // 集合/散開の追従速度（小さいほど滑らかでゆっくり）

// サイト全体の背景として常駐するThree.jsシーン
// スクロールに応じて、粒子が緩やかに球状に集まったり、散らばったりする
const ThreeBackground = memo(function ThreeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rainbowMode, setRainbowMode] = useState(false);
    const konamiIndexRef = useRef(0);
    const scrollProgressRef = useRef(0);

    // コナミコマンドの検出
    const handleKonamiCode = useCallback((event: KeyboardEvent) => {
        if (event.code === KONAMI_CODE[konamiIndexRef.current]) {
            konamiIndexRef.current++;
            if (konamiIndexRef.current === KONAMI_CODE.length) {
                setRainbowMode(prev => !prev);
                konamiIndexRef.current = 0;
            }
        } else {
            konamiIndexRef.current = 0;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKonamiCode);
        return () => window.removeEventListener('keydown', handleKonamiCode);
    }, [handleKonamiCode]);

    // スクロール進捗(0〜1)を追跡し、粒子の集合/散開の目標値として使う
    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgressRef.current = scrollable > 0
                ? Math.min(Math.max(window.scrollY / scrollable, 0), 1)
                : 0;
        };

        updateScrollProgress();
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress, { passive: true });
        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        let animationId: number;
        let renderer: WebGLRenderer | null = null;

        // Three.jsを動的インポート
        import("three").then((THREE) => {
            if (!canvasRef.current) return;

            // Scene setup
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current,
                alpha: true,
                antialias: false, // パフォーマンス向上
                powerPreference: "low-power" // 省電力モード
            });

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 最大2に制限

            // 各粒子について「散らばった位置」と「集まった位置（球面上）」をあらかじめ計算しておき、
            // 毎フレーム両者を補間することで、現れたり消えたりせず滑らかに集合/拡散する
            const positions = new Float32Array(PARTICLE_COUNT * 3);
            const scattered = new Float32Array(PARTICLE_COUNT * 3);
            const gathered = new Float32Array(PARTICLE_COUNT * 3);
            const drift = new Float32Array(PARTICLE_COUNT); // 個々の漂うような動きの位相

            // 集合時の図形: 正二十面体(12頂点・30辺)を採用し、粒子を頂点へ寄せて辺を線でつなぐことで
            // 「散らばっていた点が集まり、輪郭のはっきりした図形になる」演出を実現する
            const PHI = (1 + Math.sqrt(5)) / 2;
            const rawVertices: [number, number, number][] = [
                [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
                [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
                [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
            ];
            const vertexScale = GATHER_RADIUS / Math.sqrt(1 + PHI * PHI);
            const shapeVertices = rawVertices.map(
                ([x, y, z]) => [x * vertexScale, y * vertexScale, z * vertexScale] as const
            );

            // 頂点間の最短距離(=辺の長さ)に一致するペアだけを辺として抽出する(12頂点から30辺が求まる)
            let edgeLength = Infinity;
            for (let i = 0; i < shapeVertices.length; i++) {
                for (let j = i + 1; j < shapeVertices.length; j++) {
                    const [ax, ay, az] = shapeVertices[i];
                    const [bx, by, bz] = shapeVertices[j];
                    edgeLength = Math.min(edgeLength, Math.hypot(ax - bx, ay - by, az - bz));
                }
            }
            const shapeEdges: [number, number][] = [];
            for (let i = 0; i < shapeVertices.length; i++) {
                for (let j = i + 1; j < shapeVertices.length; j++) {
                    const [ax, ay, az] = shapeVertices[i];
                    const [bx, by, bz] = shapeVertices[j];
                    if (Math.abs(Math.hypot(ax - bx, ay - by, az - bz) - edgeLength) < edgeLength * 0.05) {
                        shapeEdges.push([i, j]);
                    }
                }
            }

            // 集合時: 粒子を「頂点グループ」と「辺グループ」に振り分け、図形の輪郭全体に粒子を並べる
            // (頂点1つあたり5粒子・辺1本あたり12粒子で 12*5 + 30*12 = 420 個ちょうど埋まる)
            const PARTICLES_PER_VERTEX = 5;
            const PARTICLES_PER_EDGE = 12;
            const vertexParticleTotal = shapeVertices.length * PARTICLES_PER_VERTEX;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;

                // 散開時: 立方体状のランダムな空間に分布
                scattered[i3] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;
                scattered[i3 + 1] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;
                scattered[i3 + 2] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;

                if (i < vertexParticleTotal) {
                    // 頂点グループ: indexを頂点数で割った余りを頂点番号とする
                    // → i = 0..11 がそれぞれ頂点0..11の「代表粒子」になり、線の描画(後述)とインデックスが一致する
                    const vertexIndex = i % shapeVertices.length;
                    const [vx, vy, vz] = shapeVertices[vertexIndex];
                    const jitter = 0.1;
                    gathered[i3] = vx + (Math.random() - 0.5) * jitter;
                    gathered[i3 + 1] = vy + (Math.random() - 0.5) * jitter;
                    gathered[i3 + 2] = vz + (Math.random() - 0.5) * jitter;
                } else {
                    // 辺グループ: 頂点間を等間隔に結ぶ位置に並べ、図形の輪郭(ワイヤーフレーム)を粒子そのもので描く
                    const edgeParticleIndex = i - vertexParticleTotal;
                    const edgeIndex = Math.floor(edgeParticleIndex / PARTICLES_PER_EDGE) % shapeEdges.length;
                    const positionOnEdge = edgeParticleIndex % PARTICLES_PER_EDGE;
                    const t = (positionOnEdge + 0.5) / PARTICLES_PER_EDGE;
                    const [a, b] = shapeEdges[edgeIndex];
                    const [ax, ay, az] = shapeVertices[a];
                    const [bx, by, bz] = shapeVertices[b];
                    const jitter = 0.05;
                    gathered[i3] = THREE.MathUtils.lerp(ax, bx, t) + (Math.random() - 0.5) * jitter;
                    gathered[i3 + 1] = THREE.MathUtils.lerp(ay, by, t) + (Math.random() - 0.5) * jitter;
                    gathered[i3 + 2] = THREE.MathUtils.lerp(az, bz, t) + (Math.random() - 0.5) * jitter;
                }

                drift[i] = Math.random() * Math.PI * 2;

                positions[i3] = scattered[i3];
                positions[i3 + 1] = scattered[i3 + 1];
                positions[i3 + 2] = scattered[i3 + 2];
            }

            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.035,
                color: 0x999999,
                transparent: true,
                opacity: 0.55,
            }) as PointsMaterial;

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            // 各頂点を代表する粒子(インデックス = 頂点番号)同士を辺で結ぶ線を用意しておく。
            // 集合が進むほど不透明度を上げ、図形の輪郭が浮かび上がるようにする
            const linePositions = new Float32Array(shapeEdges.length * 2 * 3);
            const linesGeometry = new THREE.BufferGeometry();
            linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            const linesMaterial = new THREE.LineBasicMaterial({
                color: 0x999999,
                transparent: true,
                opacity: 0,
            });
            const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
            scene.add(linesMesh);

            camera.position.z = 5;

            // Mouse movement
            let mouseX = 0;
            let mouseY = 0;

            const handleMouseMove = (event: MouseEvent) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            };

            window.addEventListener('mousemove', handleMouseMove, { passive: true });

            // Animation (フレームレートを制限)
            let lastTime = 0;
            const fps = 60;
            const interval = 1000 / fps;

            // 集合度合い(0=散開, 1=集合)。スクロール目標値へゆっくり滑らかに追従させる
            let morph = 0;
            const positionAttr = particlesGeometry.getAttribute('position') as InstanceType<typeof THREE.BufferAttribute>;

            const animate = (time: number) => {
                animationId = requestAnimationFrame(animate);

                const delta = time - lastTime;
                if (delta < interval) return;
                lastTime = time - (delta % interval);

                // 虹色モードの処理
                if (rainbowMode) {
                    const hue = (time * 0.05) % 360;
                    particlesMaterial.color.setHex(hslToHex(hue, 70, 60));
                    particlesMaterial.opacity = 0.45;
                } else {
                    particlesMaterial.color.setHex(0x999999);
                    particlesMaterial.opacity = 0.55;
                }

                // 集合度をスクロール位置へ滑らかに追従させる(急に現れたり消えたりしない)
                morph += (scrollProgressRef.current - morph) * MORPH_EASE;

                const array = positionAttr.array as Float32Array;
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const i3 = i * 3;
                    const phase = time * 0.0005 + drift[i];
                    // 散らばっているときほど揺らぎを大きく、集まるにつれて落ち着かせる
                    const driftAmount = 0.35 * (1 - morph * 0.7);

                    array[i3] = THREE.MathUtils.lerp(scattered[i3], gathered[i3], morph) + Math.sin(phase) * driftAmount;
                    array[i3 + 1] = THREE.MathUtils.lerp(scattered[i3 + 1], gathered[i3 + 1], morph) + Math.cos(phase * 0.9) * driftAmount;
                    array[i3 + 2] = THREE.MathUtils.lerp(scattered[i3 + 2], gathered[i3 + 2], morph) + Math.sin(phase * 1.1) * driftAmount;
                }
                positionAttr.needsUpdate = true;

                // 図形の頂点を代表する粒子(インデックス = 頂点番号)の現在位置を辺としてつなぎ直し、
                // 集合が進むほど線をはっきり浮かび上がらせる(散開中はほぼ見えないようにして雑然とした印象を避ける)
                const linePosArray = linesGeometry.getAttribute('position').array as Float32Array;
                for (let e = 0; e < shapeEdges.length; e++) {
                    const [a, b] = shapeEdges[e];
                    const ai = a * 3;
                    const bi = b * 3;
                    const ei = e * 6;
                    linePosArray[ei] = array[ai];
                    linePosArray[ei + 1] = array[ai + 1];
                    linePosArray[ei + 2] = array[ai + 2];
                    linePosArray[ei + 3] = array[bi];
                    linePosArray[ei + 4] = array[bi + 1];
                    linePosArray[ei + 5] = array[bi + 2];
                }
                linesGeometry.getAttribute('position').needsUpdate = true;
                linesMaterial.color.copy(particlesMaterial.color);
                linesMaterial.opacity = Math.max(0, morph - 0.5) * 1.1 * (rainbowMode ? 0.7 : 0.5);

                particlesMesh.rotation.y += 0.0009;
                particlesMesh.rotation.x += 0.0004;
                linesMesh.rotation.y += 0.0009;
                linesMesh.rotation.x += 0.0004;

                camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
                camera.position.y += (mouseY * 0.25 - camera.position.y) * 0.05;
                camera.lookAt(scene.position);

                renderer?.render(scene, camera);
            };

            animationId = requestAnimationFrame(animate);

            // Resize handler (デバウンス)
            let resizeTimeout: NodeJS.Timeout;
            const handleResize = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer?.setSize(window.innerWidth, window.innerHeight);
                }, 100);
            };

            window.addEventListener('resize', handleResize, { passive: true });

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('resize', handleResize);
            };
        });

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            renderer?.dispose();
        };
    }, [rainbowMode]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
        />
    );
});

export default ThreeBackground;
