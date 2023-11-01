const getCoordsIterator = (canvasDim: number) => {
  const halfDim = Math.floor(canvasDim / 2);
  const getCoordsIterator = function* () {
    for (let x = -halfDim; x <= halfDim; x++) {
      for (let y = -halfDim; y <= halfDim; y++) {
        yield { x, y };
      }
    }
  };
  return getCoordsIterator;
};

export default getCoordsIterator;
