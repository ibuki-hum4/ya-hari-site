"use client";

import { useState } from "react";
import { FiRefreshCw, FiCopy, FiCheck } from "react-icons/fi";

type Category = "遅刻" | "宿題" | "仕事" | "日常";

const EXCUSES: Record<Category, string[]> = {
    遅刻: [
        "昨晩、近所で謎の光の柱が出現し、その調査に追われていたため遅刻しました。",
        "家を出たら靴が左右逆になっており、履き直したら間に合わなくなりました。",
        "電車のドアに荷物が挟まり、車掌さんが解放してくれるまで40分かかりました。",
        "目覚ましをセットしたのですが、猫が電源ケーブルを噛み切ってしまいました。",
        "昨日読んだ量子力学の本の影響で、時間の流れが相対的に感じられてしまいました。",
        "道路工事を迂回しようとしたら、知らない路地に迷い込んで出口が見つかりませんでした。",
        "財布を忘れて取りに戻ったら、財布が部屋の奥に隠れていて見つけるまで時間がかかりました。",
        "朝のニュースで衝撃的な情報を見てしまい、気づいたら1時間経っていました。",
        "乗ったバスが終点まで行ってしまい、折り返しに乗ったため大幅に遅れました。",
        "駅の券売機が壊れており、全員が窓口に並ぶことになってしまいました。",
    ],
    宿題: [
        "宿題をやり終えた後、プリンターのインクが切れてしまいました。",
        "昨夜書き上げたところ、突然の停電でデータが消えてしまいました。",
        "宿題帳を持ってきたつもりが、同じサイズの別のノートでした。",
        "弟がノートに落書きをして提出できる状態ではなくなりました。",
        "問題の意味を深く考えすぎた結果、哲学的な考察になってしまいました。",
        "やり終えた宿題を玄関に置いておいたら、風で飛んでいきました。",
        "宿題の範囲を間違えて、別の教科のものを完璧に仕上げてしまいました。",
        "ペンのインクが切れ、新しいものを買いに行ったら閉店時間で買えませんでした。",
    ],
    仕事: [
        "送信したつもりのメールが下書きフォルダに残っていました。大変失礼しました。",
        "クラウドの同期が途中で止まっており、最新版のファイルが手元にありませんでした。",
        "VPNの接続が不安定で、作業環境にアクセスできない状況が続いておりました。",
        "先ほどまで資料を作成していたのですが、ショートカットキーのミスで全て閉じてしまいました。",
        "ミーティングのリンクが更新されており、以前のURLで入室を試み続けておりました。",
        "バージョン管理でコンフリクトが発生し、解消に時間がかかってしまいました。",
        "本番環境と開発環境の設定を取り違えてデプロイしてしまい、ロールバック対応しておりました。",
        "キーボードが突然反応しなくなり、USB接続のものを借りてくる間に時間を要しました。",
    ],
    日常: [
        "冷蔵庫を開けたら中から声がして、確認に15分かかりました（換気扇の音でした）。",
        "充電していたつもりのスマホが、コードが抜けていてバッテリー切れになっていました。",
        "ゲームを「あと1分だけ」と続けた結果、気づいたら朝になっていました。",
        "SNSで「2分で確認できる動画」を開いたら、気づいたら3時間後でした。",
        "靴下を探していたら、なぜか全部1枚ずつバラバラになっていました。",
        "今日やるべきことをメモしようとしたら、ペンが6本とも全部インク切れでした。",
        "財布に入れていた大事なレシートを、間違えてゴミと一緒に捨ててしまいました。",
        "気合いを入れてベッドを直したら、枕が行方不明になりました。",
        "正しいパスワードを入力しているのに弾かれ続け、30分後にCaps Lockに気づきました。",
    ],
};

export default function ExcuseGenerator() {
    const [category, setCategory] = useState<Category>("遅刻");
    const [excuse, setExcuse] = useState("");
    const [copied, setCopied] = useState(false);
    const [bouncing, setBouncing] = useState(false);

    const generate = () => {
        const list = EXCUSES[category];
        const pick = list[Math.floor(Math.random() * list.length)];
        setExcuse(pick);
        setBouncing(true);
        setTimeout(() => setBouncing(false), 400);
    };

    const copy = () => {
        if (!excuse) return;
        navigator.clipboard.writeText(excuse);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const categories: Category[] = ["遅刻", "宿題", "仕事", "日常"];

    return (
        <div className="space-y-5 max-w-xl">
            {/* Category selector */}
            <div>
                <p className="text-xs text-muted mb-2">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${category === c ? "bg-ink text-surface" : "border border-line text-muted hover:text-ink"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate button */}
            <button onClick={generate}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ink text-surface text-sm hover:opacity-80 transition-opacity">
                <FiRefreshCw size={15} className={bouncing ? "animate-spin" : ""} />
                言い訳を生成する
            </button>

            {/* Output */}
            {excuse && (
                <div className="border border-line rounded-2xl p-5 bg-surface-alt space-y-3">
                    <p className="text-sm leading-relaxed text-ink">{excuse}</p>
                    <button onClick={copy}
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors">
                        {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
                        {copied ? "コピーしました" : "コピー"}
                    </button>
                </div>
            )}
            <p className="text-xs text-muted">※ 使用は自己責任で。効果は保証しません。</p>
        </div>
    );
}
