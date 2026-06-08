import { CSSProperties, ReactElement, ReactNode } from "react";

const BRAND = "YAHARI";

function LoadingShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">{children}</div>
        </div>
    );
}

function LoadingLabel({ children }: { children: ReactNode }) {
    return <p className="text-muted text-sm tracking-widest">{children}</p>;
}

// リング型スピナー
function SpinnerLoading() {
    return (
        <LoadingShell>
            <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-line rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-ink rounded-full animate-spin"></div>
            </div>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 弾むドット
function DotsLoading() {
    return (
        <LoadingShell>
            <div className="flex items-center justify-center gap-2.5 mb-6">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-3 h-3 rounded-full bg-ink animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 走査するバー
function SweepLoading() {
    return (
        <LoadingShell>
            <div className="w-48 h-1 bg-line rounded-full overflow-hidden mx-auto mb-6">
                <div className="h-full w-1/3 bg-ink rounded-full animate-loading-sweep" />
            </div>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// イコライザー風バー
function EqualizerLoading() {
    return (
        <LoadingShell>
            <div className="flex items-end justify-center gap-1.5 h-10 mb-6">
                {[0, 1, 2, 3, 4].map((i) => (
                    <span
                        key={i}
                        className="w-1.5 bg-ink rounded-full animate-loading-equalize"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// タイピングカーソル風
function TypingLoading() {
    return (
        <LoadingShell>
            <p className="font-mono text-ink text-lg tracking-wide mb-2">
                Loading
                <span className="animate-loading-blink">_</span>
            </p>
            <LoadingLabel>PLEASE WAIT</LoadingLabel>
        </LoadingShell>
    );
}

// Netflixのオープニング風ズームイン
function NetflixLoading() {
    return (
        <LoadingShell>
            <h2 className="text-5xl sm:text-7xl font-bold text-ink tracking-[0.3em] animate-loading-netflix select-none">
                {BRAND}
            </h2>
        </LoadingShell>
    );
}

// 文字が小刻みに震える
function TrembleLoading() {
    return (
        <LoadingShell>
            <p className="text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none mb-4">
                {BRAND.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-loading-tremble"
                        style={{ animationDelay: `${i * 0.07}s` }}
                    >
                        {char}
                    </span>
                ))}
            </p>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// TikTokロゴ風の色ズレ・グリッチ
function TikTokLoading() {
    return (
        <LoadingShell>
            <div className="relative inline-block mb-4">
                <span
                    className="absolute inset-0 text-5xl sm:text-6xl font-bold tracking-widest text-[#ff004f]/70 animate-loading-glitch-1 select-none"
                    aria-hidden
                >
                    {BRAND}
                </span>
                <span
                    className="absolute inset-0 text-5xl sm:text-6xl font-bold tracking-widest text-[#00f2ea]/70 animate-loading-glitch-2 select-none"
                    aria-hidden
                >
                    {BRAND}
                </span>
                <span className="relative text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none">
                    {BRAND}
                </span>
            </div>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 蒸発するように消えていく
function EvaporateLoading() {
    return (
        <LoadingShell>
            <p className="text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none mb-4">
                {BRAND.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-loading-evaporate"
                        style={{ animationDelay: `${i * 0.12}s` }}
                    >
                        {char}
                    </span>
                ))}
            </p>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 文字がそれぞれの方向へ粒子のように飛び散る
const scatterOffsets = [
    { x: -42, y: -28, r: -40 },
    { x: -54, y: 18, r: 25 },
    { x: -14, y: -46, r: -15 },
    { x: 16, y: 42, r: 28 },
    { x: 48, y: -16, r: -22 },
    { x: 36, y: 34, r: 18 },
];

function ScatterLoading() {
    return (
        <LoadingShell>
            <p className="text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none mb-4">
                {BRAND.split("").map((char, i) => {
                    const offset = scatterOffsets[i % scatterOffsets.length];
                    return (
                        <span
                            key={i}
                            className="inline-block animate-loading-scatter"
                            style={{
                                "--scatter-x": `${offset.x}px`,
                                "--scatter-y": `${offset.y}px`,
                                "--scatter-r": `${offset.r}deg`,
                                animationDelay: `${i * 0.06}s`,
                            } as CSSProperties}
                        >
                            {char}
                        </span>
                    );
                })}
            </p>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// コードがタイプされていくターミナル風
function CodingLoading() {
    return (
        <LoadingShell>
            <p className="font-mono text-2xl sm:text-3xl text-ink tracking-wider mb-4">
                <span className="inline-block overflow-hidden whitespace-nowrap align-bottom border-r-2 border-ink animate-loading-typewriter">
                    {BRAND}
                </span>
            </p>
            <LoadingLabel>COMPILING...</LoadingLabel>
        </LoadingShell>
    );
}

// 文字が崩れ落ちて積み上がる
const crumbleRotations = [-16, 11, -9, 19, -13, 15];

function CrumbleLoading() {
    return (
        <LoadingShell>
            <p className="text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none mb-4">
                {BRAND.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-loading-crumble"
                        style={{
                            "--crumble-r": `${crumbleRotations[i % crumbleRotations.length]}deg`,
                            animationDelay: `${i * 0.1}s`,
                        } as CSSProperties}
                    >
                        {char}
                    </span>
                ))}
            </p>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 文字がベルトコンベアのように、左から現れて右へ抜けていく
function ConveyorLoading() {
    return (
        <LoadingShell>
            <p className="text-5xl sm:text-6xl font-bold tracking-widest text-ink select-none mb-4 overflow-hidden">
                {BRAND.split("").map((char, i) => (
                    <span
                        key={i}
                        className="inline-block animate-loading-conveyor"
                        style={{ animationDelay: `${i * 0.18}s` }}
                    >
                        {char}
                    </span>
                ))}
            </p>
            <LoadingLabel>LOADING...</LoadingLabel>
        </LoadingShell>
    );
}

// 猫: 丸くなってゆらゆら弾む
function CatLoading() {
    return (
        <LoadingShell>
            <p className="text-6xl sm:text-7xl mb-6 inline-block select-none animate-loading-cat-bounce" aria-hidden>
                🐱
            </p>
            <LoadingLabel>ごろごろ...</LoadingLabel>
        </LoadingShell>
    );
}

// 犬: しっぽを振るように楽しげに弾む
function DogLoading() {
    return (
        <LoadingShell>
            <p className="text-6xl sm:text-7xl mb-6 inline-block select-none animate-loading-dog-wag" aria-hidden>
                🐶
            </p>
            <LoadingLabel>わんわん...</LoadingLabel>
        </LoadingShell>
    );
}

// くじら: 泡を立てながら、ゆったり海面を泳ぐ
function WhaleLoading() {
    return (
        <LoadingShell>
            <div className="relative inline-block mb-6">
                <p className="text-6xl sm:text-7xl select-none animate-loading-whale-swim" aria-hidden>
                    🐳
                </p>
                <div className="absolute -top-1 -right-1 flex items-end gap-1" aria-hidden>
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-loading-bubble-rise"
                            style={{ animationDelay: `${i * 0.5}s` }}
                        />
                    ))}
                </div>
            </div>
            <LoadingLabel>ぷかぷか...</LoadingLabel>
        </LoadingShell>
    );
}

// 52Hzのくじら: 「世界でいちばん孤独なクジラ」と呼ばれる、誰にも届かない周波数で鳴き続けるクジラへのオマージュ
function Whale52HzLoading() {
    return (
        <LoadingShell>
            <p
                className="text-6xl sm:text-7xl mb-6 inline-block select-none opacity-40 grayscale animate-loading-whale-swim [animation-duration:6s]"
                aria-hidden
            >
                🐳
            </p>
            <div className="flex items-end justify-center gap-1.5 h-6 mb-4" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                    <span
                        key={i}
                        className="w-1 bg-muted/50 rounded-full animate-loading-52hz-pulse"
                        style={{ animationDelay: `${i * 0.3}s` }}
                    />
                ))}
            </div>
            <p className="font-mono text-xs text-muted tracking-[0.2em] mb-2">52 Hz</p>
            <LoadingLabel>誰にも届かない声で、今日も歌っている。</LoadingLabel>
        </LoadingShell>
    );
}

interface LoadingScreenEntry {
    id: string;
    element: ReactElement;
}

// id を指定すると `?load=<id>` でそのローディング画面を強制表示できる
export const loadingScreens: LoadingScreenEntry[] = [
    { id: "spinner", element: <SpinnerLoading key="spinner" /> },
    { id: "dots", element: <DotsLoading key="dots" /> },
    { id: "sweep", element: <SweepLoading key="sweep" /> },
    { id: "equalizer", element: <EqualizerLoading key="equalizer" /> },
    { id: "typing", element: <TypingLoading key="typing" /> },
    { id: "netflix", element: <NetflixLoading key="netflix" /> },
    { id: "tremble", element: <TrembleLoading key="tremble" /> },
    { id: "tiktok", element: <TikTokLoading key="tiktok" /> },
    { id: "evaporate", element: <EvaporateLoading key="evaporate" /> },
    { id: "scatter", element: <ScatterLoading key="scatter" /> },
    { id: "coding", element: <CodingLoading key="coding" /> },
    { id: "crumble", element: <CrumbleLoading key="crumble" /> },
    { id: "conveyor", element: <ConveyorLoading key="conveyor" /> },
    { id: "cat", element: <CatLoading key="cat" /> },
    { id: "dog", element: <DogLoading key="dog" /> },
    { id: "whale", element: <WhaleLoading key="whale" /> },
    { id: "52hz-whale", element: <Whale52HzLoading key="52hz-whale" /> },
];

export function pickLoadingScreen(): ReactElement {
    return loadingScreens[Math.floor(Math.random() * loadingScreens.length)].element;
}

export function getLoadingScreenById(id: string | null): ReactElement | undefined {
    return loadingScreens.find((screen) => screen.id === id)?.element;
}
