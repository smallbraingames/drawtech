import {
  BLOCKS_PER_INTERVAL,
  VRGDA_PRICE_DECAY,
  VRGDA_TARGET_PRICE,
  VRGDA_UNITS_PER_INTERVAL,
} from "./config";

const getPrice = (blockDiff: number, numSold: number) => {
  const decayConstant = Math.log(1 - VRGDA_PRICE_DECAY);
  const intervalsSinceStart = blockDiff / BLOCKS_PER_INTERVAL;
  const inverse = (numSold + 1) / VRGDA_UNITS_PER_INTERVAL;
  return (
    VRGDA_TARGET_PRICE *
    Math.exp(decayConstant * (intervalsSinceStart - inverse))
  );
};

export default getPrice;
