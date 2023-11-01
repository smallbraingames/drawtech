// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SafeCastLib } from "solmate/src/utils/SafeCastLib.sol";
import { Canvas, PeriodRewardTotal, Rewards, RewardClaim, Spent } from "codegen/index.sol";
import { Coord, Unit } from "common/Unit.sol";
import { INITIAL_CANVAS_DIM } from "common/Config.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";

library LibRewards {
  function addUntrackedRewards(uint256 value) internal {
    uint16 currentPeriod = LibGrowth.getCurrentPeriod();
    PeriodRewardTotal.set({
      period: currentPeriod,
      value: PeriodRewardTotal.get({ period: currentPeriod }) + SafeCastLib.safeCastTo80(value)
    });
  }

  function trackRewards(Unit[] memory units) internal {
    for (uint256 i = 0; i < units.length; i++) {
      _trackCoordRewards({ coord: units[i].coord });
    }
  }

  function trackRewards(Coord[] memory coords) internal {
    for (uint256 i = 0; i < coords.length; i++) {
      _trackCoordRewards({ coord: coords[i] });
    }
  }

  function _trackCoordRewards(Coord memory coord) private {
    address artist = Canvas.getArtist({ x: coord.x, y: coord.y });
    if (artist == address(0)) {
      return;
    }
    uint80 untrackedCoordRewards = _getUntrackedCoordRewards({ coord: coord });
    if (untrackedCoordRewards == 0) {
      return;
    }
    Canvas.setTotalRewardsTracked({
      x: coord.x,
      y: coord.y,
      totalRewardsTracked: Canvas.getTotalRewardsTracked({ x: coord.x, y: coord.y }) + untrackedCoordRewards
    });
    Rewards.set({ artist: artist, value: Rewards.get({ artist: artist }) + untrackedCoordRewards });
  }

  function _getUntrackedCoordRewards(Coord memory coord) internal view returns (uint80) {
    uint16 currentPeriod = LibGrowth.getCurrentPeriod();
    uint16 startPeriod = getCoordStartPeriod(coord);
    uint80 cumulativeReward = 0;
    for (uint16 i = startPeriod; i <= currentPeriod; i++) {
      uint80 totalPeriodUnits = uint80(LibGrowth.getPeriodCanvasDim({ period: i })) ** 2;
      cumulativeReward += PeriodRewardTotal.get({ period: i }) / totalPeriodUnits;
    }
    uint80 trackedRewards = Canvas.getTotalRewardsTracked({ x: coord.x, y: coord.y });
    return cumulativeReward - trackedRewards;
  }

  function getCoordStartPeriod(Coord memory coord) internal pure returns (uint16) {
    uint16 xPeriod = getEarliestStartPeriod(coord.x);
    uint16 yPeriod = getEarliestStartPeriod(coord.y);
    return max(xPeriod, yPeriod);
  }

  function getEarliestStartPeriod(int16 n) internal pure returns (uint16) {
    uint16 positiveCanvasDim = INITIAL_CANVAS_DIM / 2;
    uint16 absN = abs(n);
    if (absN <= positiveCanvasDim) {
      return 0;
    }
    return absN - positiveCanvasDim;
  }

  function emitClaimRewards(address artist, uint256 value) internal {
    RewardClaim.set({ artist: artist, value: value });
  }

  function emitSpent(address artist, uint256 value, uint256 moveId) internal {
    Spent.set({
      artist: artist,
      id: moveId,
      value: SafeCastLib.safeCastTo80(value),
      blockNumber: SafeCastLib.safeCastTo64(block.number)
    });
  }

  function abs(int16 x) internal pure returns (uint16) {
    return x < 0 ? uint16(-x) : uint16(x);
  }

  function max(uint16 x, uint16 y) internal pure returns (uint16) {
    return x > y ? x : y;
  }
}
