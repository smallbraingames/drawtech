import { useEffect } from "react";

import BottomBar from "./BottomBar";
import ControlPanel from "./ControlPanel";
import InfoPages from "./InfoPages";

const Game = () => {
  useEffect(() => {
    try {
      self.navigator.clearAppBadge();
    } catch (e) {
      console.warn("[Game] could not clear app badge", e);
    }
  }, []);

  return (
    <div
      className="absolute top-0 left-0 w-screen h-screen flex flex-col pointer-events-none"
      style={{ minHeight: "-webkit-fill-available" }}
    >
      <div className="flex mx-4 mt-4">
        <div className="grow" />
        <div className="w-min h-min pointer-events-auto">
          <InfoPages />
        </div>
      </div>

      <div className="grow" />

      <div className="flex flex-row-reverse mb-2">
        <div className="w-min pointer-events-auto">
          <ControlPanel />
        </div>
      </div>
      <div>
        <BottomBar />
      </div>
    </div>
  );
};

export default Game;
