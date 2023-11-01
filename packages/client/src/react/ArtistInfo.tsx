import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import {
  Entity,
  Has,
  HasValue,
  getComponentValueStrict,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaEthereum } from "react-icons/fa";
import { Address, formatEther, zeroAddress } from "viem";

import Value from "../game/Value";
import getColor from "../phaser/getColor";
import ResolveName from "./ResolveName";
import { useGameComponents } from "./context/GameProvider";

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

const getHexColor = (c: number) => {
  const color = getColor(c);
  const rgb = Phaser.Display.Color.IntegerToRGB(color);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const ArtistInfo = () => {
  const {
    Artist,
    Color,
    ClaimedRewards,
    Selected,
    UnclaimedRewards,
    getArtistEntity,
  } = useGameComponents();

  const selectedCoordEntity = useComponentValue(Selected, singletonEntity, {
    value: singletonEntity,
  }).value as Entity;
  const artist = useComponentValue(Artist, selectedCoordEntity, {
    value: zeroAddress,
  }).value as Address;
  const color = useComponentValue(Color, selectedCoordEntity, {
    value: 0,
  }).value;
  const artistEntity = getArtistEntity(artist);
  const claimedRewards = useComponentValue(ClaimedRewards, artistEntity, {
    value: 0n,
  }).value;
  const unclaimedRewards = useComponentValue(UnclaimedRewards, artistEntity, {
    value: 0n,
  }).value;
  const rewards = Number(formatEther(claimedRewards + unclaimedRewards));
  const numDrawUnits = useEntityQuery([
    HasValue(Artist, { value: artist }),
  ]).length;
  const numArtists = new Set(
    useEntityQuery([Has(Artist)]).map(
      (e) => getComponentValueStrict(Artist, e).value as Address
    )
  ).size;

  return (
    <div className="flex gap-2 p-2 bg-stone-100 rounded-sm mx-4 transition transition-opacity items-center text-lg">
      {artist !== zeroAddress ? (
        <>
          <div
            style={{ backgroundColor: getHexColor(color) }}
            className="h-11 w-11"
          />
          <div className="flex flex-col">
            <div className="font-bold text-lg">
              {artist !== zeroAddress && (
                <ResolveName address={artist} maxLength={9} />
              )}
            </div>
            <div className="flex gap-1">
              <div className="flex gap-1 items-center font-mono text-sm">
                <div className="h-3 w-3 bg-stone-800" /> ×{numDrawUnits}
              </div>
              <div className="flex items-center text-sm">
                <Value price={rewards} digits={4} />
              </div>
            </div>
          </div>{" "}
        </>
      ) : (
        <div className="text-lg tracking-tight w-max">
          {numArtists} <span className="font-bold">ARTISTS</span>
        </div>
      )}
    </div>
  );
};

export default ArtistInfo;
