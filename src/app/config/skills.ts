/**
 * スキルアイコン設定ファイル
 * 
 * 🎯 使い方:
 * 1. 新しいスキルを追加したい場合は、skills配列に追加してください
 * 2. アイコン名は https://skillicons.dev/ で確認できます
 * 3. 順番を変えたい場合は、配列の順序を変更してください
 * 4. 削除したい場合は、該当の行を削除してください
 * 
 * 💡 ヒント:
 * - アイコン名は小文字で入力してください（例: javascript → js）
 * - 利用可能なアイコン一覧: https://skillicons.dev/
 */

export interface Skill {
  /** アイコン名（skillicons.devで使用される名前） */
  icon: string;
  /** 表示名（日本語OK） */
  name: string;
  /** 説明（オプション） */
  description?: string;
}

/**
 * 表示したいスキル一覧
 * ここに新しいスキルを追加/削除/並び替えができます！
 */
export const skills: Skill[] = [
  // プログラミング言語
  { icon: 'js', name: 'JavaScript', description: 'メインで使用している言語' },
  { icon: 'ts', name: 'TypeScript', description: '型安全な開発で愛用' },
  { icon: 'go', name: 'Go', description: 'システム開発やクラウドに使用' },
  { icon: 'ruby', name:'Ruby', description: 'バックエンドの開発の愛用' },
  
  // フレームワーク・ライブラリ
  { icon: 'react', name: 'React', description: 'UIライブラリ' },
  { icon: 'nextjs', name: 'Next.js', description: 'Reactフレームワーク' },
  { icon: 'nodejs', name: 'Node.js', description: 'サーバーサイドJavaScript' },

  
  // マークアップ・スタイリング
  { icon: 'html', name: 'HTML', description: 'マークアップ言語' },
  { icon: 'css', name: 'CSS', description: 'スタイリング' },
  { icon: 'tailwind', name: 'Tailwind CSS', description: 'ユーティリティCSS' },
  
  // デザインツール
  { icon: 'figma', name: 'Figma', description: 'UIデザインツール' },
  
  // 開発ツール
  { icon: 'git', name: 'Git', description: 'バージョン管理' },
  { icon: 'github', name: 'GitHub', description: 'コード管理・共有' },
  { icon: 'docker', name: 'Docker', description: 'コンテナ化' },
  { icon: 'vscode', name: 'VSCode', description: 'メインのコードエディタ' },
  { icon: 'vercel', name: 'Vercel', description: 'デプロイ・ホスティング' },
  { icon: 'k8s', name: 'Kubernetes', description: 'コンテナオーケストレーション' },
];

/**
 * 表示設定
 */
export const skillDisplayConfig = {
  /** 1行に表示するアイコン数 */
  iconsPerLine: 8,
  
  /** テーマ（light または dark） */
  theme: 'light' as 'light' | 'dark',
  
  /** アイコンサイズ（ピクセル単位、オプション） */
  // size: 48, // デフォルトサイズを使う場合はコメントアウト
};

/**
 * スキルアイコンのURLを生成する関数
 * 通常は変更不要です
 */
export function generateSkillIconsUrl(): string {
  const iconNames = skills.map(skill => skill.icon).join(',');
  const { iconsPerLine, theme } = skillDisplayConfig;
  
  return `https://skillicons.dev/icons?i=${iconNames}&theme=${theme}&perline=${iconsPerLine}`;
}

/**
 * 🚀 クイックスタートガイド:
 * 
 * 新しいスキルを追加する場合:
 * 1. skillsの配列に新しいオブジェクトを追加
 *    例: { icon: 'python', name: 'Python', description: 'データ分析で使用' }
 * 
 * アイコンの並びを変更する場合:
 * 1. skills配列内の順序を変更
 * 
 * 1行のアイコン数を変更する場合:
 * 1. skillDisplayConfig.iconsPerLine の値を変更
 * 
 * テーマを変更する場合:
 * 1. skillDisplayConfig.theme を 'light' または 'dark' に変更
 */
