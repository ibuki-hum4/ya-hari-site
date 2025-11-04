/*
  シンプルで高速なページの骨組み。
  - Lenis は `useLenisScroll` で初期化済み（hook 内で制御）
  - 最小限のマークアップとアクセシブルなナビ
  - 各セクションは軽量にして後からコンポーネント単位で微調整します
*/
'use client';

import { useEffect } from 'react';
import { ProjectsSection } from './components/ProjectsSection';
import InterlinksSection from './components/InterlinksSection';
import { useLenisScroll } from './hooks/useSmoothInertiaScroll';

export default function Home() {
  // Lenis（スムーススクロール）を初期化
  useLenisScroll();

  // シンプルな低スペック検出（body にフラグ）
  useEffect(() => {
    try {
      const mem = (navigator as any).deviceMemory || 4;
      const cores = (navigator as any).hardwareConcurrency || 4;
      const lowSpec = (mem && mem <= 1.5) || (cores && cores <= 2);
      if (lowSpec) document.body.classList.add('low-spec');
      else document.body.classList.remove('low-spec');
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="inline-flex items-center gap-3 text-lg font-semibold">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">や</span>
              <span className="sr-only">ホームへ</span>
              <span aria-hidden className="hidden sm:inline">やーはり</span>
            </a>

            <nav className="hidden md:flex items-center gap-4">
              <a href="#profile" className="text-sm hover:underline focus:outline-none">Skills</a>
              <a href="#portfolio" className="text-sm hover:underline focus:outline-none">Works</a>
              <a href="#contact" className="text-sm hover:underline focus:outline-none">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">やーはり</h1>
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300 max-w-xl">
                  Frontend Engineer / System Engineer — モダンな技術で使いやすい体験を作ります。
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="mailto:yahari@skyia.jp" className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-md text-sm font-semibold">Contact</a>
                  <a href="#portfolio" className="inline-flex items-center justify-center px-5 py-3 border rounded-md text-sm">Portfolio</a>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                {/* 軽量なプロフィールプレースホルダ */}
                <div className="w-44 h-44 sm:w-56 sm:h-56 bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden">
                  <svg className="w-full h-full text-neutral-200 dark:text-neutral-700" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="profile">
                    <rect width="100%" height="100%" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="profile" className="py-16 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Skills</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 max-w-xl">使用中／学習中の技術スタック（簡潔に）</p>

            {/* 軽量版 ProjectsSection を使って簡易的に表示。後で個別コンポーネントに差し替えます */}
            <div className="mt-8">
              {/* ProjectsSection コンポーネントは軽量化済み */}
              <ProjectsSection />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold">Contact</h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">仕事のご依頼やお問い合わせはこちらから。お気軽にどうぞ。</p>
            <div className="mt-6">
              <a href="mailto:yahari@skyia.jp" className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-md text-sm font-semibold">メールで連絡</a>
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <InterlinksSection />
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} やーはり — Built with Next.js
        </div>
      </footer>
    </div>
  );
}
