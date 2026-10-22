// 崩壊・再起動・500 を1つの chunk にまとめる
// 崩壊が始まった時点で次の画面も読み込み済みになり、切り替わる瞬間に元のページが見えない

export { default as CollapseMode } from "./CollapseMode";
export { default as RebootScreen } from "./RebootScreen";
export { default as OutageScreen } from "./OutageScreen";
