// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Canvas, CanvasColor, PeriodRewardTotal } from "codegen/index.sol";
import { Unit } from "common/Unit.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";

library LibDraw {
  function draw(Unit[] memory units, address artist) internal {
    uint256 moveId = getMoveId();
    for (uint256 i = 0; i < units.length; i++) {
      _drawUnit({ unit: units[i], artist: artist, moveId: moveId });
    }
  }

  function getMoveId() internal view returns (uint256) {
    uint16 period = LibGrowth.getCurrentPeriod();
    uint80 periodRewardTotal = PeriodRewardTotal.get({ period: period });
    uint256 moveId = uint256(keccak256(abi.encodePacked(block.number, periodRewardTotal)));
    return moveId;
  }

  function _drawUnit(Unit memory unit, address artist, uint256 moveId) private {
    Canvas.setArtist({ x: unit.coord.x, y: unit.coord.y, artist: artist });
    CanvasColor.set({
      x: unit.coord.x,
      y: unit.coord.y,
      id: moveId,
      value: unit.color,
      blockNumber: uint64(block.number)
    });
  }
}
