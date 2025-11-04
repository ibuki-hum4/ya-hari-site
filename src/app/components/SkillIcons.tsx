'use client';

import { skills, generateSkillIconsUrl } from '../config/skills';

/**
 * スキルアイコンを表示するコンポーネント
 * 
 * 設定は /src/app/config/skills.ts で管理されています
 * 新しいスキルの追加や設定変更は、そちらのファイルで行ってください！
 */
export function SkillIcons() {
  const skillIconUrl = generateSkillIconsUrl();

  return (
    <div className="fade-in mb-16">
      {/* メインのスキルアイコン */}
      <div className="flex justify-center mb-8">
        <img 
          src={skillIconUrl}
          alt="技術スキル"
          className="max-w-full h-auto transition-transform duration-150"
          loading="lazy"
        />
      </div>

      {/* スキル名一覧（オプション - 表示したくない場合はコメントアウト） */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-w-4xl mx-auto">
        {skills.map((skill, index) => (
          <div
            key={skill.icon}
            className="text-center"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="text-xs text-gray-600 dark:text-gray-400 fade-in">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 🎯 使い方のメモ:
 * 
 * 1. スキルを追加/削除/変更したい場合
 *    → /src/app/config/skills.ts を編集してください
 * 
 * 2. スキル名一覧を非表示にしたい場合
 *    → 上記の「スキル名一覧」セクションをコメントアウトしてください
 * 
 * 3. アイコンサイズや配置を調整したい場合
 *    → skills.ts の skillDisplayConfig を変更してください
 */