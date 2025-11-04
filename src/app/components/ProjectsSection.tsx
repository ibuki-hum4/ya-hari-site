'use client';

import { mainProjects, smallProjects } from '../config/projects';

/**
 * プロジェクト・制作物を表示するコンポーネント
 * 
 * 設定は /src/app/config/projects.ts で管理されています
 * 新しいプロジェクトの追加や設定変更は、そちらのファイルで行ってください！
 */
export function ProjectsSection() {
  return (
    <>
      {/* メインプロジェクト */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {mainProjects.map((project, index) => (
          <div
            key={project.title}
            className="fade-in group"
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-sm transition-transform duration-150 border border-gray-200 dark:border-slate-600">
              {/* グラデーションヘッダー */}
                <div className={`h-28 rounded-lg bg-gradient-to-br ${project.gradient} mb-6 flex items-center justify-center transition-transform duration-150`}>
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-1">{project.title}</div>
                  <div className="text-sm opacity-90">{project.subtitle}</div>
                </div>
              </div>
              
              {/* コンテンツ */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {project.description}
              </p>
              
              {/* リンクボタン */}
              {project.link !== '#' ? (
                <a 
                  href={project.link}
                  target={project.target || '_self'}
                  rel={project.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                >
                  詳細を見る
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <div className="inline-flex items-center px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50">
                  準備中
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 小さなプロジェクト */}
              <div className="fade-in">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          その他のプロジェクト
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {smallProjects.map((project, index) => (
            <div
              key={project.name}
                      className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm transition-colors duration-150 border border-gray-200 dark:border-slate-600 group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {project.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                {project.tech}
              </p>
              
              {/* 小プロジェクトのリンク */}
              {project.link && project.link !== '#' && (
                <a
                  href={project.link}
                  target={project.target || '_self'}
                  rel={project.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  詳細 →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * 🎯 使い方のメモ:
 * 
 * 1. プロジェクトを追加/削除/変更したい場合
 *    → /src/app/config/projects.ts を編集してください
 * 
 * 2. デザインを変更したい場合
 *    → このファイル（ProjectsSection.tsx）を編集してください
 * 
 * 3. グラデーション色を変更したい場合
 *    → projects.ts の gradient プロパティを変更してください
 *    → 利用可能な色は projects.ts の availableGradients を参考に
 */