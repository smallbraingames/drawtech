import { HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { Address } from "viem";

import { GameComponents } from "./gameManager";

const getHasMadeMove = (artist: Address, gameComponents: GameComponents) => {
  const { Artist, UnclaimedRewards, ClaimedRewards, getArtistEntity } =
    gameComponents;

  const hasActiveTiles =
    runQuery([HasValue(Artist, { value: artist })]).size > 0;
  if (hasActiveTiles) return true;

  const artistEntity = getArtistEntity(artist);
  const unclaimedRewards =
    getComponentValue(UnclaimedRewards, artistEntity)?.value ?? 0n;
  const claimedRewards =
    getComponentValue(ClaimedRewards, artistEntity)?.value ?? 0n;
  const totalRewards = unclaimedRewards + claimedRewards;

  return totalRewards > 0n;
};

export default getHasMadeMove;
