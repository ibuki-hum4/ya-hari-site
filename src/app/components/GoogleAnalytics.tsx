import Script from "next/script";
import GAConsent from "./GAConsent";
import { GA_ID } from "../../lib/ga";

// 本番環境以外では GA を完全に無効化（開発データの混入を防ぐ）
export default function GoogleAnalytics() {
    if (process.env.NODE_ENV !== "production") return null;

    return (
        <>
            {/* gtag.js ライブラリ */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            {/* Consent Mode v2 デフォルト設定 + 初期化
                send_page_view:false → GAConsent でSPA対応の手動計測に統一 */}
            <Script id="gtag-init" strategy="afterInteractive">{`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  wait_for_update:500
});
gtag('config','${GA_ID}',{send_page_view:false});
`}</Script>
            {/* 同意復元 + SPA ページビュー追跡 */}
            <GAConsent />
        </>
    );
}
