import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { HasValue } from "@latticexyz/recs";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther, zeroAddress } from "viem";

import Value from "../game/Value";
import { useGameComponents } from "./context/GameProvider";

const Rewards = () => {
  const { Artist, ClaimedRewards, UnclaimedRewards, getArtistEntity } =
    useGameComponents();
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const numActiveTiles = useEntityQuery([
    HasValue(Artist, { value: address ?? zeroAddress }),
  ]).length;
  const artistEntity = getArtistEntity(address ?? zeroAddress);
  const unclaimedRewards = useComponentValue(UnclaimedRewards, artistEntity, {
    value: 0n,
  }).value;
  const claimedRewards = useComponentValue(ClaimedRewards, artistEntity, {
    value: 0n,
  }).value;
  const totalRewards = Number(formatEther(unclaimedRewards + claimedRewards));

  return (
    <div className="flex flex-col gap-0.5 items-end tracking-tight">
      <div className="flex gap-1 p-0.5 bg-stone-100 rounded-sm w-fit items-center">
        <div className="h-3 w-3 bg-yellow-500 animate-pulse" />
        <div className="text-sm">
          <span className="font-mono">×{numActiveTiles}</span>{" "}
          <span className="font-bold">TILES EARNING REWARDS</span>
        </div>
      </div>
      <div className="flex gap-1 p-0.5 bg-stone-100 rounded-sm items-center w-fit text-sm">
        <Value price={totalRewards} digits={5} />
        <div className="font-bold">EARNED</div>
      </div>
    </div>
  );
};

export default Rewards;
