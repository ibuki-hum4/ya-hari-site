// プロフィールの元データ。名前・年齢などの文章は messages の about.* にある
// 趣味・できることは現状日本語のみ（英語表示でも日本語のまま出る）

export const hobbies = ["音楽", "ゲーム"] as const;

export const abilities = ["バリトンサックス", "ギター", "インフラ", "k8s"];

export const contacts = {
    email: "yahari@skyia.jp",
    github: { handle: "@ibuki-hum4", url: "https://github.com/ibuki-hum4" },
    x: { handle: "@Yaaaaahari", url: "https://x.com/Yaaaaahari" },
};
