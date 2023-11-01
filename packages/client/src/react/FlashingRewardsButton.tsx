import { useComponentValue } from "@latticexyz/react";
import { usePrivy } from "@privy-io/react-auth";
import { LuCoins } from "react-icons/lu";
import { Address, zeroAddress } from "viem";

import { useGameComponents } from "./context/GameProvider";

const FlashingRewardsButton = () => {
  const { user } = usePrivy();
  const address = user?.wallet?.address as Address | undefined;
  const { UnclaimedRewards, getArtistEntity } = useGameComponents();
  const artistEntity = getArtistEntity(address ?? zeroAddress);
  const unclaimedRewards = useComponentValue(UnclaimedRewards, artistEntity, {
    value: 0n,
  }).value;
  return (
    <div className="relative flex items-center justify-center h-9 w-9 rounded-sm bg-yellow-400 border-r-2 border-b-4 border border-1 border-yellow-800 text-yellow-800 active:border">
      {unclaimedRewards > 0 && (
        <>
          <span className="absolute -right-1.5 -top-1.5 rounded-full h-3.5 w-3.5 bg-yellow-800 animate-ping opacity-75"></span>
          <span className="absolute -right-1.5 -top-1.5 rounded-full h-3.5 w-3.5 bg-yellow-800"></span>
        </>
      )}
      <LuCoins />
    </div>
  );
};

export default FlashingRewardsButton;
