import ReactDOM from "react-dom/client";

import gameManager from "./game/gameManager";
import getIsPWA from "./pwa/getIsPWA";
import App from "./react/App";
import { GameProvider } from "./react/context/GameProvider";
import { PWAProvider } from "./react/context/PWAContext";

const rootElement = document.getElementById("react-root");
if (!rootElement) throw Error("[React] No react root element found");
const root = ReactDOM.createRoot(rootElement);

const { gameComponents, syncGame, api } = gameManager;

const bypassPwa = import.meta.env.VITE_BYPASS_PWA_CHECK === "true";
if (bypassPwa) {
  console.log("[React] PWA check bypassed");
}

const isPWA = getIsPWA() || bypassPwa;

root.render(
  <GameProvider gameComponents={gameComponents} api={api}>
    <PWAProvider value={isPWA}>
      <App />
    </PWAProvider>
  </GameProvider>
);

if (isPWA) {
  syncGame();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).game = gameManager;
