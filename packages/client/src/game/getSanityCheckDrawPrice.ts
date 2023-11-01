import { GameApi } from "./gameManager";
import { Unit } from "./unit";

const PRICE_SLIP_PERCENT = 10n;

const getSanityCheckDrawPrice = async (
  move: Unit[],
  valueWei: bigint,
  api: GameApi
) => {
  const valueWeiSlip = (valueWei * PRICE_SLIP_PERCENT) / 100n;
  let errorsWhenLowerPrice = false;
  try {
    await api.getGasEstimate(move, valueWeiSlip);
  } catch (e) {
    errorsWhenLowerPrice = true;
  }
  return errorsWhenLowerPrice;
};

export default getSanityCheckDrawPrice;
