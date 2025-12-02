"use client";

import { IoMailOutline } from "react-icons/io5";
import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero() {
    const profileImage = "/icon.png";
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvasRef.current, 
            alpha: true,
            antialias: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x888888,
            transparent: true,
            opacity: 0.6,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Floating geometric shapes
        const shapes: THREE.Mesh[] = [];
        const geometries = [
            new THREE.IcosahedronGeometry(0.3, 0),
            new THREE.OctahedronGeometry(0.25, 0),
            new THREE.TetrahedronGeometry(0.3, 0),
        ];

        for (let i = 0; i < 8; i++) {
            const geometry = geometries[i % geometries.length];
            const material = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                wireframe: true,
                transparent: true,
                opacity: 0.3,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            shapes.push(mesh);
            scene.add(mesh);
        }

        camera.position.z = 5;

        // Mouse movement
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;

            shapes.forEach((shape, i) => {
                shape.rotation.x += 0.003 + i * 0.001;
                shape.rotation.y += 0.002 + i * 0.001;
                shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
            });

            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);

    return (
        <div className="relative overflow-hidden">
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
            />
            <section className="min-h-screen flex items-center justify-center px-8">
                <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
                    {/* 左側: 名前・サブタイトル・ボタン */}
                    <div className="flex-1 flex flex-col items-start gap-4">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">やーはり</h1>
                        <p className="text-xl md:text-2xl text-gray-600">Full-Stack / Infra Developer</p>
                        <a 
                            href="mailto:yahari@mail.skyia.jp" 
                            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
                        >
                            <IoMailOutline size={20} />
                            Contact
                        </a>
                    </div>

                    {/* 右側: アイコン */}
                    <div className="flex-1 flex justify-center md:justify-end">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-400">
                            <Image 
                                src={profileImage}
                                alt="プロフィール画像"
                                width={256}
                                height={256}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );  
}