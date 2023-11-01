import { Entity, getComponentValue } from "@latticexyz/recs";

import { GameComponents } from "./gameManager";
import getPrice from "./getPrice";
import { Unit } from "./unit";

const getDrawPrice = (move: Unit[], gameComponents: GameComponents) => {
  const { getCoordEntity, NumSold, initialBlockNumber, latestBlock$ } =
    gameComponents;
  const numAdditionalSold = new Map<Entity, number>();
  let price = 0;
  const blockDiff = latestBlock$.value - initialBlockNumber;
  for (const { coord } of move) {
    const entity = getCoordEntity(coord);
    const prevNumSoldInMove = numAdditionalSold.get(entity) ?? 0;
    const numSold =
      (numAdditionalSold.get(entity) ?? 0) +
      (getComponentValue(NumSold, entity)?.value ?? 0);
    price += getPrice(blockDiff, numSold);
    numAdditionalSold.set(entity, prevNumSoldInMove + 1);
  }
  return price;
};

export default getDrawPrice;
