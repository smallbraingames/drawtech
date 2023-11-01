// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { wadPow } from "solmate/src/utils/SignedWadMath.sol";
import { BaseTest } from "../Base.t.sol";
import { BLOCKS_PER_INTERVAL, INITIAL_CANVAS_DIM, WAD_CANVAS_GROWTH_ROOT } from "common/Config.sol";
import { Coord } from "common/Unit.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";
import { LibRewards } from "libraries/LibRewards.sol";

contract LibGrowthTest is BaseTest {
  function test_CoordInDimBounds() public {
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: 0 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 1, y: 0 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: 1 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 1, y: 1 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -1, y: 0 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: -1 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -1, y: -1 }), 3), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 2, y: 0 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: 2 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 2, y: 2 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -2, y: 0 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: -2 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -2, y: -2 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 3, y: 0 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: 3 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 3, y: 3 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -3, y: 0 }), 3), false);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: 0, y: -3 }), 7), true);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: -3, y: -3 }), 8), true);
  }

  function testFuzz_CoordInDimBounds(uint16 dim, int16 x, int16 y) public {
    vm.assume(-1e4 < x && x < 1e4);
    vm.assume(-1e4 < y && y < 1e4);
    vm.assume(LibRewards.abs(x) <= dim / 2);
    vm.assume(LibRewards.abs(y) <= dim / 2);
    vm.assume(dim > 0);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: x, y: y }), dim), true);
  }

  function testFuzz_CoordOutOfDimBounds(uint16 dim, int16 x, int16 y) public {
    vm.assume(-1e4 < x && x < 1e4);
    vm.assume(-1e4 < y && y < 1e4);
    vm.assume(LibRewards.abs(x) > dim / 2 || LibRewards.abs(y) > dim / 2);
    vm.assume(dim > 0);
    assertEq(LibGrowth.isCoordInDimBounds(Coord({ x: x, y: y }), dim), false);
  }

  function test_GetCurrentPeriod() public {
    assertEq(LibGrowth.getCurrentPeriod(), 0);
    vm.roll(block.number + BLOCKS_PER_INTERVAL);
    assertEq(LibGrowth.getCurrentPeriod(), 1);
  }

  function testFuzz_GetCurrentPeriodDoesNotRevertAfterLargeIntervals(uint32 blockNumber) public {
    vm.assume(blockNumber >= block.number);
    vm.roll(blockNumber);
    LibGrowth.getCurrentPeriod();
  }

  function test_WadRoot() public {
    assertApproxEqRel(LibGrowth.wadRoot(1e18, 1e18), 1e18, 1e9);
    assertApproxEqRel(LibGrowth.wadRoot(1e18, 2e18), 1e18, 1e9);
    assertApproxEqRel(LibGrowth.wadRoot(1e18, 3e18), 1e18, 1e9);
    assertApproxEqRel(LibGrowth.wadRoot(4e18, 2e18), 2e18, 1e9);
    assertApproxEqRel(LibGrowth.wadRoot(9e18, 2e18), 3e18, 1e9);
    assertApproxEqRel(LibGrowth.wadRoot(27e18, 3e18), 3e18, 1e9);
  }

  function test_GetPeriodCanvasDim() public {
    assertEq(LibGrowth.getPeriodCanvasDim(0), INITIAL_CANVAS_DIM);
    assertEq(LibGrowth.getPeriodCanvasDim(1), INITIAL_CANVAS_DIM + 2);
    assertEq(LibGrowth.getPeriodCanvasDim(2), INITIAL_CANVAS_DIM + 4);
    assertEq(LibGrowth.getPeriodCanvasDim(10), INITIAL_CANVAS_DIM + 20);
  }

  function testFuzz_GetPeriodCanvasDimDoesNotRevertForReasonableValues(uint8 period) public {
    assertEq(LibGrowth.getPeriodCanvasDim(period), INITIAL_CANVAS_DIM + uint256(period) * 2);
  }
}
