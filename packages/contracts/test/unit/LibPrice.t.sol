// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { wadDiv, wadMul, toWadUnsafe } from "solmate/src/utils/SignedWadMath.sol";

import { BaseTest } from "../Base.t.sol";
import { Canvas } from "codegen/index.sol";
import { BLOCKS_PER_INTERVAL, VRGDA_PRICE_DECAY, VRGDA_TARGET_PRICE, VRGDA_UNITS_PER_INTERVAL } from "common/Config.sol";
import { NotEnoughValue } from "common/Errors.sol";
import { Coord, Unit } from "common/Unit.sol";
import { LibPrice } from "libraries/LibPrice.sol";

contract LibPriceTest is BaseTest {
  function test_RevertsWhen_DuplicatePriceIsEqualToDoublePrice() public {
    Unit memory unit = Unit({ coord: Coord({ x: 0, y: 0 }), color: 10 });
    vm.warp(10);
    uint256 singleCost = LibPrice.getPrice({
      numSold: 0,
      blocksPerInterval: BLOCKS_PER_INTERVAL,
      unitsPerInterval: VRGDA_UNITS_PER_INTERVAL,
      blocksSinceStart: 10,
      targetPrice: VRGDA_TARGET_PRICE,
      wadPriceDecay: VRGDA_PRICE_DECAY
    });

    Unit[] memory duplicate = new Unit[](2);
    duplicate[0] = unit;
    duplicate[1] = unit;

    vm.expectRevert(NotEnoughValue.selector);
    world.draw{ value: singleCost * 2 }(duplicate);
  }

  function testFuzz_IncrementsNumSold(uint8[] memory coordInfo, address artist) public {
    vm.assume(artist != address(0));
    vm.assume(artist != worldAddress);
    Unit[] memory units = getCoordInfoUnits({ coordInfo: coordInfo });

    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    for (uint256 i = 0; i < units.length; i++) {
      uint256 numCoordSold = 0;
      Unit memory unit = units[i];
      for (uint256 j = 0; j < units.length; j++) {
        Unit memory jUnit = units[j];
        if (unit.coord.x == jUnit.coord.x && unit.coord.y == jUnit.coord.y) {
          numCoordSold += 1;
        }
      }
      assertEq(Canvas.getNumSold({ x: unit.coord.x, y: unit.coord.y }), numCoordSold);
    }
  }

  function test_getWadNumIntervals() public {
    assertEq(LibPrice.getWadNumIntervals({ blockDiff: 100, blocksPerInterval: 10 }), toWadUnsafe(10));
    assertEq(LibPrice.getWadNumIntervals({ blockDiff: 100, blocksPerInterval: 100 }), toWadUnsafe(1));
    assertEq(LibPrice.getWadNumIntervals({ blockDiff: 100, blocksPerInterval: 1 }), toWadUnsafe(100));
    assertEq(LibPrice.getWadNumIntervals({ blockDiff: 100, blocksPerInterval: 2 }), toWadUnsafe(50));
    assertApproxEqRel(LibPrice.getWadNumIntervals({ blockDiff: 100, blocksPerInterval: 3 }), 33.33e18, 1e16);
  }

  function testFuzz_getWadNumIntervalsPassesForReasonableRange(uint64 blockDiff, uint16 blocksPerInterval) public {
    vm.assume(blocksPerInterval > 0);
    assertEq(
      LibPrice.getWadNumIntervals({ blockDiff: blockDiff, blocksPerInterval: blocksPerInterval }),
      wadDiv(toWadUnsafe(blockDiff), toWadUnsafe(blocksPerInterval))
    );
  }

  /// ===== Modified tests from t11s https://github.com/transmissions11/VRGDAs/blob/master/test/LinearVRGDA.t.sol =====

  function test_GetPriceMatchesLinearVRGDATargetPrice() public {
    uint256 cost = LibPrice.getPrice({
      numSold: 0,
      blocksPerInterval: 100,
      unitsPerInterval: 2,
      blocksSinceStart: uint256((wadMul(wadDiv(toWadUnsafe(1), toWadUnsafe(2)), toWadUnsafe(100))) / 1e18),
      targetPrice: 69.42e18,
      wadPriceDecay: 0.31e18
    });

    assertApproxEqRel(cost, uint256(69.42e18), 0.00000000001e18);
  }

  function testFuzz_GetPriceMatchesLinearVRGDATargetPrice(
    uint16 blocksPerInterval,
    uint16 unitsPerInterval,
    uint16 targetPriceRaw,
    uint8 priceDecayRaw
  ) public {
    uint256 targetPrice = bound(targetPriceRaw, 1, 1e8) * 1e14;
    int256 wadPriceDecay = int256(int8(uint8(bound(priceDecayRaw, 1, 99)))) * 1e16;

    blocksPerInterval = uint16(bound(blocksPerInterval, 1000, 1e5));
    unitsPerInterval = uint16(bound(unitsPerInterval, 1, 100));

    uint256 blocksSinceStart = uint256(
      (wadMul(wadDiv(toWadUnsafe(1), toWadUnsafe(unitsPerInterval)), toWadUnsafe(blocksPerInterval))) / 1e18
    );

    console.log("Blocks since start", blocksSinceStart);

    uint256 cost = LibPrice.getPrice({
      numSold: 0,
      blocksPerInterval: blocksPerInterval,
      unitsPerInterval: unitsPerInterval,
      blocksSinceStart: blocksSinceStart,
      targetPrice: int256(targetPrice),
      wadPriceDecay: wadPriceDecay
    });

    assertApproxEqRel(cost, uint256(targetPrice), 1e16);
  }

  function testFuzz_GetPriceLinearVRGDATargetPriceAlwaysInRightConditions(uint16 numSold) public {
    numSold = uint16(bound(numSold, 0, type(uint16).max - 1));
    uint256 blocksSinceStart = uint256(wadMul(wadDiv(toWadUnsafe(numSold + 1), 2e18), toWadUnsafe(43200))) / 1e18;

    uint256 cost = LibPrice.getPrice({
      numSold: numSold,
      blocksPerInterval: 43200,
      unitsPerInterval: 2,
      blocksSinceStart: blocksSinceStart,
      targetPrice: 69.42e18,
      wadPriceDecay: 0.31e18
    });

    assertApproxEqRel(cost, 69.42e18, 1e9);
  }

  function test_GetPriceLinearVRGDAPricingBasic() public {
    uint256 numIntervals = 120;
    uint16 numMint = 239;

    uint256 cost = LibPrice.getPrice({
      numSold: numMint,
      blocksPerInterval: 1,
      unitsPerInterval: 2,
      blocksSinceStart: numIntervals,
      targetPrice: 69.42e18,
      wadPriceDecay: 0.31e18
    });

    assertApproxEqRel(cost, 69.42e18, 1e8);
  }
}
