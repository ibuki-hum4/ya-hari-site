import Header from "../components/header";
import Footer from "../components/footer";

export const metadata = {
    title: "プライバシーポリシー | やーはり",
    description: "やーはりのポートフォリオサイトのプライバシーポリシー",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            
            <main className="pt-20">
                <section className="py-20 px-8">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            プライバシーポリシー
                        </h1>
                        
                        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                やーはり（以下「当サイト」といいます）は、ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
                            </p>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    1. 収集する情報
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    当サイトでは、以下の情報を収集することがあります：
                                </p>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>お問い合わせフォームからご提供いただくお名前、メールアドレス、お問い合わせ内容</li>
                                    <li>Google Analyticsによるアクセス解析データ（匿名化されたIPアドレス、ブラウザ情報、閲覧ページなど）</li>
                                    <li>Cookieによるサイト利用状況</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    2. Cookieの使用について
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    当サイトでは、ユーザー体験の向上およびアクセス解析のためにCookieを使用しています。
                                </p>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                    Google Analytics
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。
                                    Google Analyticsはデータの収集のためにCookieを使用しています。
                                    このデータは匿名で収集されており、個人を特定するものではありません。
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Cookieを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。
                                    詳しくは
                                    <a 
                                        href="https://policies.google.com/technologies/partner-sites" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Googleのポリシーと規約
                                    </a>
                                    をご覧ください。
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    3. 情報の利用目的
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    収集した情報は、以下の目的で利用します：
                                </p>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                                    <li>お問い合わせへの対応</li>
                                    <li>サイトの改善およびサービス向上</li>
                                    <li>アクセス状況の分析</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    4. 情報の第三者提供
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    5. セキュリティ
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    当サイトは、個人情報の漏洩、滅失、毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    6. Cloudflare Turnstile
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    当サイトのお問い合わせフォームでは、スパム防止のためにCloudflare Turnstileを使用しています。
                                    これにより、ユーザーが人間であることを確認しています。
                                    詳しくは
                                    <a 
                                        href="https://www.cloudflare.com/ja-jp/privacypolicy/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Cloudflareのプライバシーポリシー
                                    </a>
                                    をご覧ください。
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    7. プライバシーポリシーの変更
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
                                    変更後のプライバシーポリシーは、当サイトに掲載した時点から効力を生じるものとします。
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    8. お問い合わせ
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    本プライバシーポリシーに関するお問い合わせは、
                                    <a 
                                        href="/contact" 
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        お問い合わせページ
                                    </a>
                                    よりご連絡ください。
                                </p>
                            </section>

                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    制定日：2024年12月2日
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
