import { BLOCKS_PER_INTERVAL, CANVAS_GROWTH_ROOT } from "./config";

const getPeriod = (blockDiff: number) => {
  const intervals = blockDiff / BLOCKS_PER_INTERVAL;
  return Math.floor(Math.pow(intervals, 1 / CANVAS_GROWTH_ROOT));
};

export default getPeriod;
