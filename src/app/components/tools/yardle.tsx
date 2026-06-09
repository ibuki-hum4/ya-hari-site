"use client";

import { useState, useEffect, useCallback } from "react";

// Compact 5-letter word list (answer candidates + broader guess list)
const ANSWERS = ["about","above","abuse","actor","acute","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alert","alike","align","alive","alley","allow","alone","along","alter","angel","anger","angle","angry","anime","ankle","annex","annoy","apart","apple","apply","arena","argue","arise","armor","array","arrow","asked","atlas","avoid","awake","award","aware","awful","badly","baker","basic","basis","batch","beach","began","begin","being","below","bench","birth","black","blade","blame","bland","blast","blaze","bleed","blend","bless","blind","block","blood","blown","blues","board","bonus","boost","brand","brave","break","breed","brief","bring","broad","broke","brown","build","built","burst","buyer","cabin","candy","cause","chain","chair","chart","chase","cheap","check","chief","child","china","civic","civil","claim","clean","clear","click","cliff","climb","clock","clone","cloud","coach","coast","color","comic","count","cover","crack","craft","crane","crash","cream","cross","crowd","crown","cubic","curve","cycle","daily","dance","debug","dense","depth","devil","digit","dirty","disco","dizzy","doubt","dough","draft","drain","drama","drank","dress","drown","dried","drive","drone","drove","early","earth","eight","elite","ember","empty","enemy","enjoy","enter","entry","equal","error","ethic","event","every","exact","exist","extra","fable","faced","fancy","fault","feast","fence","fever","field","fight","final","first","flame","flare","flash","fleet","flesh","float","floor","flora","flour","focus","foggy","force","forge","forte","forum","found","frame","frank","fresh","front","froze","fruit","fully","funny","gamer","genre","ghost","giant","given","glass","globe","gloom","glyph","going","grace","grade","grand","grant","grasp","grass","grave","greet","grief","grind","groan","gross","group","grown","guard","guess","guide","guild","guilt","guise","haiku","happy","harsh","haste","haven","heart","heavy","hello","hence","herbs","hinge","hippo","honor","horse","hotel","house","hover","human","humor","hurry","hyper","ideal","image","imply","index","indie","inner","input","irony","issue","ivory","japan","jewel","joint","joker","judge","juice","juicy","karma","kayak","knife","knock","known","label","lance","laser","later","laugh","layer","learn","leave","legal","lemon","level","light","limit","liver","local","logic","loose","lover","loyal","lucky","magic","major","maker","manor","march","match","mayor","media","melts","mercy","merit","metal","micro","might","minor","minus","modal","model","money","month","moral","motel","mount","mouse","mouth","movie","music","naive","nerve","never","night","ninja","noble","noise","north","noted","novel","nurse","ocean","offer","often","olive","onset","order","other","outer","oxide","ozone","paint","panel","paper","party","pasta","patch","pause","peace","pearl","phase","phone","photo","piano","place","plain","plane","plant","plate","plaza","plaza","plaza","pluck","plumb","point","poker","polar","polka","pools","power","press","price","pride","prime","print","prior","prize","probe","proof","prose","proud","proxy","pulse","pupil","queen","queue","quick","quiet","quota","quote","radar","radio","raise","range","rapid","ratio","reach","ready","realm","rebel","remix","reply","reset","right","rival","river","robot","rocky","rough","round","route","royal","ruler","rural","scene","score","scout","sense","serve","seven","shade","shake","shame","shape","share","sharp","shift","shine","shirt","shock","shoot","shore","short","shout","shown","sight","silky","silly","since","sixth","sixty","skate","skill","skull","slate","sleep","slice","slide","slope","smart","smile","smoke","snake","solar","solve","sorry","south","space","spare","spark","spawn","speed","spend","spine","spoke","sport","spray","squad","stack","staff","stage","stair","stake","stand","stark","start","state","stays","steal","steel","steep","steer","stem","stone","stood","storm","story","strap","stray","strip","stuff","style","suite","sunny","super","surge","sword","synth","table","taste","teach","teeth","tenth","those","three","throw","tiger","timer","title","toast","today","token","touch","tough","toxic","trace","track","trade","trail","train","trait","trash","tread","treat","trend","trial","tribe","trick","tried","troop","truck","truly","trust","truth","tumor","tutor","twice","twist","ultra","under","union","unity","until","upper","urban","usage","usual","utter","valid","value","valve","vapor","vault","vegan","verse","video","vigor","viral","virus","visit","vital","vivid","vocal","voice","voter","watch","water","weary","weave","weird","whale","where","which","while","white","whole","whose","width","wired","witty","world","worry","worth","would","wrath","write","wrong","yell","yield","young","yours","youth","zebra","zesty","zippy","zombi","zonal"];

type LetterState = "correct" | "present" | "absent" | "empty";

function pickWord(): string {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return ANSWERS[seed % ANSWERS.length];
}

const KEYBOARD_ROWS = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "⌫"],
];

export default function Yardle() {
    const [answer] = useState(pickWord);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [current, setCurrent] = useState("");
    const [letterMap, setLetterMap] = useState<Record<string, LetterState>>({});
    const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
    const [shake, setShake] = useState(false);

    const MAX_GUESSES = 6;
    const WORD_LEN = 5;

    const getStates = useCallback((guess: string): LetterState[] => {
        const result: LetterState[] = Array(WORD_LEN).fill("absent");
        const ansArr = answer.split("");
        const used = Array(WORD_LEN).fill(false);
        // Correct pass
        for (let i = 0; i < WORD_LEN; i++) {
            if (guess[i] === ansArr[i]) { result[i] = "correct"; used[i] = true; }
        }
        // Present pass
        for (let i = 0; i < WORD_LEN; i++) {
            if (result[i] === "correct") continue;
            for (let j = 0; j < WORD_LEN; j++) {
                if (!used[j] && guess[i] === ansArr[j]) { result[i] = "present"; used[j] = true; break; }
            }
        }
        return result;
    }, [answer]);

    const submitGuess = useCallback(() => {
        if (current.length !== WORD_LEN || status !== "playing") return;
        if (!ANSWERS.includes(current.toLowerCase())) { setShake(true); setTimeout(() => setShake(false), 600); return; }
        const states = getStates(current.toLowerCase());
        const newGuesses = [...guesses, current.toLowerCase()];
        setGuesses(newGuesses);
        setCurrent("");
        setLetterMap(prev => {
            const next = { ...prev };
            const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0 };
            current.split("").forEach((ch, i) => {
                const s = states[i];
                if ((priority[s] ?? 0) > (priority[next[ch.toLowerCase()]] ?? 0)) next[ch.toLowerCase()] = s;
            });
            return next;
        });
        if (current.toLowerCase() === answer) setStatus("won");
        else if (newGuesses.length >= MAX_GUESSES) setStatus("lost");
    }, [current, guesses, status, answer, getStates]);

    const keyPress = useCallback((key: string) => {
        if (status !== "playing") return;
        if (key === "ENTER") { submitGuess(); return; }
        if (key === "⌫" || key === "BACKSPACE") { setCurrent(c => c.slice(0, -1)); return; }
        if (/^[A-Z]$/.test(key) && current.length < WORD_LEN) setCurrent(c => c + key);
    }, [status, current, submitGuess]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => keyPress(e.key.toUpperCase());
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [keyPress]);

    const bgColor: Record<LetterState, string> = {
        correct: "bg-emerald-500 border-emerald-500 text-white",
        present: "bg-amber-400 border-amber-400 text-white",
        absent: "bg-zinc-500 border-zinc-500 text-white",
        empty: "bg-transparent border-line text-ink",
    };
    const kbColor: Record<LetterState, string> = {
        correct: "bg-emerald-500 text-white",
        present: "bg-amber-400 text-white",
        absent: "bg-zinc-400 dark:bg-zinc-600 text-white",
        empty: "bg-surface-alt text-ink",
    };

    return (
        <div className="flex flex-col items-center gap-5 select-none">
            {/* Grid */}
            <div className="space-y-1.5">
                {Array.from({ length: MAX_GUESSES }).map((_, row) => {
                    const isCurrentRow = row === guesses.length;
                    const word = row < guesses.length ? guesses[row] : isCurrentRow ? current : "";
                    const states = row < guesses.length ? getStates(word) : Array(WORD_LEN).fill("empty");
                    return (
                        <div key={row} className={`flex gap-1.5 ${isCurrentRow && shake ? "animate-bounce" : ""}`}>
                            {Array.from({ length: WORD_LEN }).map((_, col) => (
                                <div key={col}
                                    className={`w-12 h-12 border-2 flex items-center justify-center text-lg font-bold uppercase rounded-lg transition-colors ${bgColor[states[col] as LetterState]}`}>
                                    {word[col] ?? ""}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Status */}
            {status === "won" && <p className="text-emerald-500 font-bold">🎉 Correct! The word was <span className="uppercase">{answer}</span></p>}
            {status === "lost" && <p className="text-red-500 font-bold">Answer: <span className="uppercase">{answer}</span></p>}

            {/* Keyboard */}
            <div className="space-y-1.5">
                {KEYBOARD_ROWS.map((row, ri) => (
                    <div key={ri} className="flex gap-1 justify-center">
                        {row.map(key => (
                            <button key={key} onClick={() => keyPress(key)}
                                className={`px-2 py-3 min-w-[2rem] rounded-lg text-xs font-bold transition-colors ${key.length > 1 ? "px-3 text-[10px]" : ""} ${kbColor[letterMap[key.toLowerCase()] ?? "empty"]}`}>
                                {key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
