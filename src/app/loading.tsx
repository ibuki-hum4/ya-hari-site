import { loadingScreens } from "./components/loading/variants";

function pickLoadingScreen() {
    return loadingScreens[Math.floor(Math.random() * loadingScreens.length)];
}

export default function Loading() {
    return pickLoadingScreen();
}
