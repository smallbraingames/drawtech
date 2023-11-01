import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { Entity, Has, getComponentValueStrict } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";

import Value from "../game/Value";
import { MED_PRICE_COLOR } from "../phaser/config";
import getPriceColor from "../phaser/getPriceColor";
import { useGameComponents } from "./context/GameProvider";

const Price = () => {
  const { Price, Selected } = useGameComponents();
  const selectedCoordEntity = useComponentValue(Selected, singletonEntity, {
    value: singletonEntity,
  }).value as Entity;
  const price = useComponentValue(Price, selectedCoordEntity)?.value;
  const priceEntities = useEntityQuery([Has(Price)]);
  const prices = priceEntities.map(
    (entity) => getComponentValueStrict(Price, entity).value
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const color =
    price !== undefined ? getPriceColor(price, minPrice, maxPrice) : "white";

  return (
    <div className="flex gap-2 p-2 bg-stone-100 rounded-sm mx-4 transition transition-opacity items-center">
      <div>
        <div className="flex gap-1 items-center w-max text-lg">
          <div
            style={{ backgroundColor: price ? color : MED_PRICE_COLOR }}
            className="h-8 w-8"
          />
          <Value price={price ? price : avgPrice} digits={6} />
          <div className="font-bold tracking-tight ml-1">
            {price ? "TILE PRICE" : "AVG PRICE"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Price;
