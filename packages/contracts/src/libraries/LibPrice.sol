// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { wadDiv, wadExp, wadLn, wadMul, wadPow, toWadUnsafe } from "solmate/src/utils/SignedWadMath.sol";

import { Canvas, InitialBlock } from "codegen/index.sol";
import { BLOCKS_PER_INTERVAL, VRGDA_PRICE_DECAY, VRGDA_TARGET_PRICE, VRGDA_UNITS_PER_INTERVAL } from "common/Config.sol";
import { Coord, Unit } from "common/Unit.sol";

library LibPrice {
  function getTotalPriceAndIncrementNumSold(Unit[] memory units) internal returns (uint256) {
    uint256 totalPrice = 0;
    for (uint256 i = 0; i < units.length; i++) {
      totalPrice += _getUnitPriceAndIncrementNumSold({ coord: units[i].coord });
    }
    return totalPrice;
  }

  function _getUnitPriceAndIncrementNumSold(Coord memory coord) private returns (uint256) {
    uint16 numSold = Canvas.getNumSold({ x: coord.x, y: coord.y });
    Canvas.setNumSold({ x: coord.x, y: coord.y, numSold: numSold + 1 });
    uint64 initialBlock = InitialBlock.get();
    return
      getPrice({
        numSold: numSold,
        blocksPerInterval: BLOCKS_PER_INTERVAL,
        unitsPerInterval: VRGDA_UNITS_PER_INTERVAL,
        blocksSinceStart: block.number - initialBlock,
        targetPrice: VRGDA_TARGET_PRICE,
        wadPriceDecay: VRGDA_PRICE_DECAY
      });
  }

  function getPrice(
    uint16 numSold,
    uint16 blocksPerInterval,
    uint16 unitsPerInterval,
    uint256 blocksSinceStart,
    int256 targetPrice,
    int256 wadPriceDecay
  ) internal pure returns (uint256) {
    int256 decayConstant = wadLn(1e18 - wadPriceDecay);
    int256 intervalsSinceStart = getWadNumIntervals({
      blockDiff: blocksSinceStart,
      blocksPerInterval: blocksPerInterval
    });
    int256 inverse = wadDiv(toWadUnsafe(numSold + 1), toWadUnsafe(unitsPerInterval));
    return uint256(wadMul(targetPrice, wadExp(wadMul(decayConstant, intervalsSinceStart - inverse))));
  }

  function getWadNumIntervals(uint256 blockDiff, uint16 blocksPerInterval) internal pure returns (int256) {
    return wadDiv(toWadUnsafe(blockDiff), toWadUnsafe(blocksPerInterval));
  }
}
