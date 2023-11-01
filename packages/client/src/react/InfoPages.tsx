import { MouseEvent, useState } from "react";
import { LuInfo, LuTrophy, LuWallet2 } from "react-icons/lu";

import Claim from "./Claim";
import ClickSound from "./ClickSound";
import FlashingRewardsButton from "./FlashingRewardsButton";
import Info from "./Info";
import Leaderboard from "./Leaderboard";
import Rewards from "./Rewards";
import Wallet from "./Wallet";

const BLUR_CONTAINER_ID = "leaderboard-container";

enum InfoPageState {
  NONE = "NONE",
  CLAIM = "CLAIM",
  LEADERBOARD = "LEADERBOARD",
  WALLET = "WALLET",
  INFO = "INFO",
}

const InfoPages = () => {
  const [state, setState] = useState(InfoPageState.NONE);

  const processHideClick = (e: MouseEvent<HTMLDivElement>) => {
    const id = document.elementFromPoint(e.clientX, e.clientY)?.id;
    if (id !== BLUR_CONTAINER_ID) return;
    setState(InfoPageState.NONE);
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-max items-end">
        <div className="flex gap-1 w-min">
          <ClickSound>
            <div onClick={() => setState(InfoPageState.CLAIM)}>
              <FlashingRewardsButton />
            </div>
          </ClickSound>
          <ClickSound>
            <div
              className="border border-r-2 border-b-4 border-sky-800 text-sky-800 bg-sky-300 h-9 w-9 active:border rounded-sm flex items-center justify-center"
              onClick={() => setState(InfoPageState.LEADERBOARD)}
            >
              <LuTrophy className="text-2xl h-6 w-6" />
            </div>
          </ClickSound>
          <ClickSound>
            <div
              className="border border-r-2 border-b-4 border-green-800 text-green-800 bg-green-300 h-9 w-9 active:border rounded-sm flex items-center justify-center"
              onClick={() => setState(InfoPageState.WALLET)}
            >
              <LuWallet2 className="text-2xl h-6 w-6" />
            </div>
          </ClickSound>
          <ClickSound>
            <div
              className="border border-r-2 border-b-4 border-gray-800 text-gray-800 bg-gray-300 h-9 w-9 active:border rounded-sm flex items-center justify-center"
              onClick={() => setState(InfoPageState.INFO)}
            >
              <LuInfo className="text-2xl h-6 w-6" />
            </div>
          </ClickSound>
        </div>
        <div>
          <Rewards />
        </div>
      </div>

      <div onClick={(e: MouseEvent<HTMLDivElement>) => processHideClick(e)}>
        {state !== InfoPageState.NONE && (
          <div
            id={BLUR_CONTAINER_ID}
            className="absolute top-0 left-0 w-screen h-screen backdrop-blur-sm z-30 flex items-center justify-center touch-none"
            style={{ minHeight: "-webkit-fill-available" }}
          >
            <div className="w-fit flex items-center justify-center">
              {state === InfoPageState.CLAIM && <Claim />}
              {state === InfoPageState.WALLET && <Wallet />}
            </div>
            <div className="w-fit h-2/3 flex items-center justify-center">
              {state === InfoPageState.LEADERBOARD && <Leaderboard />}
              {state === InfoPageState.INFO && <Info />}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InfoPages;
