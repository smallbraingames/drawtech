import { scale } from "chroma-js";

import { HIGH_PRICE_COLOR, LOW_PRICE_COLOR, MED_PRICE_COLOR } from "./config";

const colorScale = scale([LOW_PRICE_COLOR, MED_PRICE_COLOR, HIGH_PRICE_COLOR]);

const getPriceColor = (
  priceWei: number,
  minPriceWei: number,
  maxPriceWei: number
): string => {
  if (maxPriceWei === minPriceWei) {
    return colorScale(0).hex();
  }
  const scale =
    Math.log(priceWei / minPriceWei) / Math.log(maxPriceWei / minPriceWei);
  return colorScale(scale).hex();
};

export default getPriceColor;
