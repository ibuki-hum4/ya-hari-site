/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",       // src ディレクトリ
    "./app/**/*.{js,ts,jsx,tsx}",       // app ディレクトリを含める場合
    "./pages/**/*.{js,ts,jsx,tsx}",     // pages ディレクトリ
    "./components/**/*.{js,ts,jsx,tsx}" // コンポーネント
  ],
  theme: {
    extend: {
      fontFamily: {
        noto: ['"Noto Sans JP"', 'sans-serif'], // フォント追加
      },
    },
  },
  plugins: [],
}
