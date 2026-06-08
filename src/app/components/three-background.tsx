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

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;

                // 散開時: 立方体状のランダムな空間に分布
                scattered[i3] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;
                scattered[i3 + 1] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;
                scattered[i3 + 2] = (Math.random() - 0.5) * SCATTER_RADIUS * 2;

                // 集合時: 球面上に均一分布させる
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                gathered[i3] = GATHER_RADIUS * Math.sin(phi) * Math.cos(theta);
                gathered[i3 + 1] = GATHER_RADIUS * Math.sin(phi) * Math.sin(theta);
                gathered[i3 + 2] = GATHER_RADIUS * Math.cos(phi);

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

                particlesMesh.rotation.y += 0.0009;
                particlesMesh.rotation.x += 0.0004;

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
