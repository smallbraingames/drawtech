// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { toWadUnsafe, wadDiv, wadPow } from "solmate/src/utils/SignedWadMath.sol";

import { InitialBlock } from "codegen/index.sol";
import { BLOCKS_PER_INTERVAL, INITIAL_CANVAS_DIM, WAD_CANVAS_GROWTH_ROOT } from "common/Config.sol";
import { Coord } from "common/Unit.sol";
import { LibPrice } from "libraries/LibPrice.sol";

library LibGrowth {
  function isCoordInDimBounds(Coord memory coord, uint16 canvasDim) internal pure returns (bool) {
    int16 halfDim = int16(canvasDim / 2);
    return (coord.x >= -halfDim) && (coord.x <= halfDim) && (coord.y >= -halfDim) && (coord.y <= halfDim);
  }

  function getCurrentPeriod() internal view returns (uint16) {
    int256 wadNumIntervals = LibPrice.getWadNumIntervals({
      blockDiff: block.number - InitialBlock.get(),
      blocksPerInterval: BLOCKS_PER_INTERVAL
    });

    return uint16(uint256(wadRoot(wadNumIntervals, WAD_CANVAS_GROWTH_ROOT) / 1e18));
  }

  function wadRoot(int256 x, int256 n) internal pure returns (int256) {
    return wadPow(x, wadDiv(1e18, n));
  }

  function getPeriodCanvasDim(uint16 period) internal pure returns (uint16) {
    return INITIAL_CANVAS_DIM + period * 2;
  }
}
