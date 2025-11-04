'use client';

import React from 'react';

export default function InterlinksSection() {
  return (
    <section id="interlinks" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">相互リンク</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">関連するサイトやプロフィールへのリンクです。ぜひご覧ください。</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://example.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition">メインサイト</a>
          <a href="https://blog.example.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition">ブログ</a>
          <a href="https://github.com/yahari-dev" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition">GitHub</a>
          <a href="https://qiita.com/yahari" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition">Qiita</a>
        </div>
      </div>
    </section>
  );
}
