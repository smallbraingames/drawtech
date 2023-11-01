import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { HasValue } from "@latticexyz/recs";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { formatEther, zeroAddress } from "viem";

import Value from "../game/Value";
import ClickSound from "./ClickSound";
import Loading from "./Loading";
import { useGameApi, useGameComponents } from "./context/GameProvider";

const Claim = () => {
  const {
    Artist,
    UnclaimedRewards,
    ClaimedRewards,
    getEntityCoord,
    getArtistEntity,
  } = useGameComponents();
  const { claimRewards } = useGameApi();
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const artistEntities = useEntityQuery([HasValue(Artist, { value: address })]);
  const coords = artistEntities.map((entity) => getEntityCoord(entity));
  const artistEntity = getArtistEntity(address ?? zeroAddress);
  const unclaimedRewards = Number(
    formatEther(useComponentValue(UnclaimedRewards, artistEntity)?.value ?? 0n)
  );
  const claimedRewards = Number(
    formatEther(useComponentValue(ClaimedRewards, artistEntity)?.value ?? 0n)
  );

  const [isLoading, setIsLoading] = useState(false);

  const totalRewards = unclaimedRewards + claimedRewards;

  const claim = async () => {
    setIsLoading(true);
    try {
      if (address && unclaimedRewards > 0n) await claimRewards(coords, address);
    } catch (e) {
      console.log("[Claim] Error claiming", e);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-stone-100 w-full h-full rounded-sm p-4 tracking-tight flex flex-col gap-4">
      <h1 className="text-xl font-bold text-center">CLAIM REWARDS</h1>
      <div>
        <div className="text-sm w-48">TOTAL REWARDS</div>
        <div className="text-xl bg-yellow-400 p-2 rounded-sm font-mono flex items-center">
          <Value price={totalRewards} digits={9} />
        </div>
      </div>
      <div>
        <div className="text-sm">UNCLAIMED REWARDS</div>
        <div className="text-xl bg-yellow-400 p-2 rounded-sm font-mono flex items-center">
          <Value price={unclaimedRewards} digits={9} />
        </div>
      </div>
      <div className="grow" />
      <ClickSound>
        <button
          className={`rounded-sm w-full p-2 text-xl font-bold transition transition-all flex items-center justify-center ${
            unclaimedRewards > 0 && !isLoading
              ? "bg-yellow-400 border-yellow-800 text-yellow-800 border border-b-4 border-r-2 active:border"
              : "bg-stone-300 text-stone-200"
          }`}
          onClick={claim}
        >
          {!isLoading ? "CLAIM" : <Loading fillColor="yellow" />}
        </button>
      </ClickSound>
    </div>
  );
};

export default Claim;
