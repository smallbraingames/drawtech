import { useEntityQuery } from "@latticexyz/react";
import { Has } from "@latticexyz/recs";
import { MouseEvent, useEffect, useState } from "react";
import { parseEther } from "viem";
import { getAccount } from "wagmi/actions";

import Value from "../game/Value";
import getDrawPrice from "../game/getDrawPrice";
import getHasMadeMove from "../game/getHasMadeMove";
import getMove from "../game/getMove";
import getSanityCheckDrawPrice from "../game/getSanityCheckDrawPrice";
import initServiceWorker from "../service-worker/initServiceWorker";
import ClickSound from "./ClickSound";
import Loading from "./Loading";
import Notifications from "./Notifications";
import { useGameApi, useGameComponents } from "./context/GameProvider";

const BLUR_CONTAINER_ID = "blur-container";

const MakeMove = () => {
  const api = useGameApi();

  const gameComponents = useGameComponents();
  const { Drawing, latestBlock$ } = gameComponents;

  const numDrawUnits = useEntityQuery([Has(Drawing)]).length;
  const move = getMove(gameComponents);
  const [price, setPrice] = useState(getDrawPrice(move, gameComponents));

  const [isLoading, setIsLoading] = useState(false);

  const [notificationPrompt, setNotificationPrompt] = useState(false);

  const processHideClick = (e: MouseEvent<HTMLDivElement>) => {
    const id = document.elementFromPoint(e.clientX, e.clientY)?.id;
    if (id !== BLUR_CONTAINER_ID) return;
    setNotificationPrompt(false);
  };

  useEffect(() => {
    const sub = latestBlock$.subscribe(() => {
      setPrice(getDrawPrice(move, gameComponents));
    });
    return () => {
      sub.unsubscribe();
    };
  }, [move, gameComponents]);

  const makeMove = async () => {
    setIsLoading(true);
    try {
      const account = getAccount();
      if (account.address) {
        const hasMadeMove = getHasMadeMove(account.address, gameComponents);
        if (hasMadeMove) {
          const address = getAccount().address;
          address && initServiceWorker(address);
        }
        const move = getMove(gameComponents);
        const price = parseEther(
          getDrawPrice(move, gameComponents).toFixed(18).toString()
        );
        const sanityCheck = await getSanityCheckDrawPrice(move, price, api);
        if (sanityCheck) {
          await api.draw(move, price);
          if (!hasMadeMove) {
            setNotificationPrompt(true);
          }
        } else {
          console.warn("[Color Select Menu] Sanity check failed");
        }
      }
    } catch (e) {
      console.log("[Make Move] Error making move", e);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex gap-1 px-4 items-center">
        <div
          className={`flex gap-1 items-center transition transition-opacity text-sm ${
            numDrawUnits > 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-stone-100 rounded-sm p-1 flex gap-1 items-center">
            <div className="h-3 w-3 bg-stone-800" />
            <p className="font-mono">×{numDrawUnits}</p>
          </div>
          <div className="flex items-center bg-stone-100 p-1 rounded-sm">
            <Value price={price} digits={5} />
          </div>
        </div>
        <div className="ml-2">
          <ClickSound
            enabled={numDrawUnits > 0}
            note={["D3", "F#3", "A3", "C#4"]}
          >
            <button
              className={`p-4 transition transition-all rounded-sm ${
                numDrawUnits > 0 && !isLoading
                  ? "bg-purple-500 border border-1 border-r-2 border-b-4 border-purple-800 text-stone-100 active:border-2"
                  : "bg-stone-300 text-stone-200"
              }`}
              onClick={() => numDrawUnits > 0 && !isLoading && makeMove()}
            >
              {!isLoading ? (
                <p className="font-bold text-md tracking-tight">DRAW!</p>
              ) : (
                <div className="h-8 w-8">
                  <Loading fillColor="purple" />
                </div>
              )}
            </button>
          </ClickSound>
        </div>
      </div>

      <div onClick={(e: MouseEvent<HTMLDivElement>) => processHideClick(e)}>
        {notificationPrompt && (
          <div
            id={BLUR_CONTAINER_ID}
            className="absolute top-0 left-0 w-screen h-screen backdrop-blur-sm z-30 flex items-center justify-center touch-none"
            style={{ minHeight: "-webkit-fill-available" }}
          >
            <div className="w-fit flex items-center justify-center">
              <Notifications setNotificationPrompt={setNotificationPrompt} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MakeMove;
