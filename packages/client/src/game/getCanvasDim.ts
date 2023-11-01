import { INITIAL_CANVAS_DIM } from "./config";

const getCanvasDim = (period: number) => {
  return INITIAL_CANVAS_DIM + period * 2;
};

export default getCanvasDim;
