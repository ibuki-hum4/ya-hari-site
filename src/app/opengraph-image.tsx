import { ImageResponse } from "next/og";

export const alt = "やーはり | ポートフォリオ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "96px",
                    backgroundColor: "#fdfdfd",
                    color: "#1a1a1a",
                }}
            >
                <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.4em", color: "#757575" }}>
                    PORTFOLIO
                </div>
                <div style={{ display: "flex", fontSize: 136, fontWeight: 700, letterSpacing: "0.04em", marginTop: 20 }}>
                    やーはり
                </div>
                <div style={{ display: "flex", fontSize: 34, color: "#757575", marginTop: 32 }}>
                    Web Developer — ya-hari.skyia.jp
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 48,
                        width: 160,
                        height: 4,
                        borderRadius: 9999,
                        backgroundColor: "#1a1a1a",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
