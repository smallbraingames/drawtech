import { useEntityQuery } from "@latticexyz/react";
import {
  Has,
  HasValue,
  getComponentValue,
  getComponentValueStrict,
  runQuery,
} from "@latticexyz/recs";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { LuCoins } from "react-icons/lu";
import { Address, formatEther } from "viem";

import Value from "../game/Value";
import ClickSound from "./ClickSound";
import ResolveName from "./ResolveName";
import { useGameComponents } from "./context/GameProvider";

type Artist = {
  address: Address;
  rewards: bigint;
  activeTiles: number;
};

enum LeaderboardState {
  REWARDS = "REWARDS",
  TILES = "TILES",
}

const ArtistRow = ({
  artist,
  rank,
  state,
}: {
  artist: Artist;
  rank: number;
  state: LeaderboardState;
}) => {
  return (
    <>
      <div
        className={`h-10 w-10 aspect-square flex items-center justify-center text-lg ${
          rank <= 3
            ? `text-yellow-100 bg-yellow-${rank + 4}00 rounded-sm`
            : "text-stone-800"
        } `}
      >
        {rank}.
      </div>
      <h1 className="text-lg col-span-3 font-bold">
        <ResolveName address={artist.address} maxLength={11} />
      </h1>

      {state === LeaderboardState.REWARDS ? (
        <div className="col-span-3 bg-stone-100 flex items-center w-full justify-end">
          <Value price={Number(formatEther(artist.rewards))} digits={4} />
        </div>
      ) : (
        <div className="col-span-3 bg-stone-100 flex gap-1 items-center w-full justify-end">
          <div className="h-3 w-3 bg-stone-800" />
          <p className="font-mono">×{artist.activeTiles}</p>
        </div>
      )}
    </>
  );
};

const ACTIVE_CLASS = "text-stone-100 bg-stone-800 border-2 border-stone-800";
const INACTIVE_CLASS =
  "text-stone-800 bg-stone-100 border border-1 border-stone-800 border-r-2 border-b-4 drop-shadow-md";

const Leaderboard = () => {
  const [state, setState] = useState(LeaderboardState.REWARDS);
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const { Artist, ClaimedRewards, UnclaimedRewards, getEntityArtist } =
    useGameComponents();
  const artistEntities = useEntityQuery([Has(UnclaimedRewards)]);
  const artists: Artist[] = artistEntities.map((entity) => {
    const address = getEntityArtist(entity);
    const rewards =
      getComponentValueStrict(UnclaimedRewards, entity).value +
      (getComponentValue(ClaimedRewards, entity)?.value ?? 0n);
    const activeTiles = runQuery([HasValue(Artist, { value: address })]).size;
    return { address, rewards, activeTiles };
  });

  if (state === LeaderboardState.TILES) {
    artists.sort((a, b) => b.activeTiles - a.activeTiles);
  } else {
    artists.sort((a, b) => (b.rewards - a.rewards > 0n ? 1 : -1));
  }

  const activeArtistIndex = address
    ? artists.findIndex((artist) => artist.address === address)
    : -1;

  return (
    <div className="mx-4 h-full bg-stone-100 text-stone-800 tracking-tight px-4 overflow-y-scroll flex flex-col rounded-sm">
      <div className="py-4 sticky top-0 bg-stone-100">
        <h1 className="font-bold text-xl text-center">TOP ARTISTS</h1>
        <div className="flex gap-2 items-center w-full justify-center mt-2 text-xs">
          <ClickSound>
            <div
              className={`flex gap-1 p-2 items-center rounded-sm transition transition-all ${
                state === LeaderboardState.REWARDS
                  ? ACTIVE_CLASS
                  : INACTIVE_CLASS
              }`}
              onClick={() => {
                setState(LeaderboardState.REWARDS);
              }}
            >
              <LuCoins className="text-xl h-4 w-4" />
              <p className="tracking-tight">REWARDS</p>
            </div>
          </ClickSound>
          <ClickSound>
            <div
              className={`flex gap-1 p-2 items-center rounded-sm transition transition-all ${
                state === LeaderboardState.TILES ? ACTIVE_CLASS : INACTIVE_CLASS
              }`}
              onClick={() => {
                setState(LeaderboardState.TILES);
              }}
            >
              <div
                className={`h-4 w-4 ${
                  state === LeaderboardState.TILES
                    ? "bg-stone-100"
                    : "bg-stone-800"
                }`}
              />
              <p className="tracking-tight">TILES</p>
            </div>
          </ClickSound>
        </div>
      </div>
      <div className="mb-auto">
        <div className="grid gap-2 grid-cols-7 items-center">
          {artists.map((artist, i) => {
            return (
              <ArtistRow
                artist={artist}
                key={artist.address}
                rank={i + 1}
                state={state}
              />
            );
          })}
        </div>
      </div>
      {activeArtistIndex >= 0 && (
        <div className="sticky bottom-0 pb-4 bg-stone-100 pt-4">
          <div className="border border-2 border-yellow-800 rounded-sm">
            <div className="grid gap-2 grid-cols-7 items-center p-2">
              <ArtistRow
                artist={artists[activeArtistIndex]}
                rank={activeArtistIndex + 1}
                state={state}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
