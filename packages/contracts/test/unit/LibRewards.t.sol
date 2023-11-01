// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { wadPow, wadMul, toWadUnsafe } from "solmate/src/utils/SignedWadMath.sol";

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";
import { RewardsTracker } from "./RewardsTracker.t.sol";
import { Canvas, CanvasData, Rewards, PeriodRewardTotal } from "codegen/index.sol";
import { Coord, Unit } from "common/Unit.sol";
import { BLOCKS_PER_INTERVAL, INITIAL_CANVAS_DIM, WAD_CANVAS_GROWTH_ROOT } from "common/Config.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";
import { LibRewards } from "libraries/LibRewards.sol";

contract LibRewardsTest is BaseTest {
  function test_Max() public {
    assertEq(LibRewards.max(1, 2), 2);
    assertEq(LibRewards.max(2, 1), 2);
    assertEq(LibRewards.max(1, 1), 1);
  }

  function testFuzz_Max(uint16 x, uint16 y) public {
    assertTrue(LibRewards.max(x, y) >= x);
    assertTrue(LibRewards.max(x, y) >= y);
  }

  function test_Abs() public {
    assertEq(LibRewards.abs(1), 1);
    assertEq(LibRewards.abs(-1), 1);
    assertEq(LibRewards.abs(0), 0);
  }

  function testFuzz_Abs(int16 x) public {
    vm.assume(x > -32767 && x < 32767);
    uint16 abs = LibRewards.abs(x);
    assertTrue(abs >= 0);
    assertEq(abs, x < 0 ? uint16(-x) : uint16(x));
  }

  function test_GetUntrackedCoordRewards() public {
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });
    address artist = address(0xface);
    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);
    uint256 trueUntrackedCoordRewards = hugeValue / (INITIAL_CANVAS_DIM ** 2);

    int16 halfDim = int16(INITIAL_CANVAS_DIM / 2);

    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 0, y: 0 }) }), trueUntrackedCoordRewards);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 1, y: 0 }) }), trueUntrackedCoordRewards);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 0, y: 1 }) }), trueUntrackedCoordRewards);
    assertEq(
      LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: -halfDim, y: halfDim }) }),
      trueUntrackedCoordRewards
    );
    assertEq(
      LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: halfDim, y: -halfDim }) }),
      trueUntrackedCoordRewards
    );

    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: halfDim + 1, y: 0 }) }), 0);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 0, y: halfDim + 1 }) }), 0);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: -(halfDim + 1), y: 0 }) }), 0);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 0, y: -(halfDim + 1) }) }), 0);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: halfDim + 1, y: halfDim + 1 }) }), 0);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: -(halfDim + 1), y: -(halfDim + 1) }) }), 0);
  }

  function testFuzz_GetUntrackedCoordRewards(uint8 period, int16 x, int16 y) public {
    vm.assume(x > -32767 && x < 32767);
    vm.assume(y > -32767 && y < 32767);

    uint256 periodBlockNumber = period == 0
      ? 0
      : uint256(
        wadMul(
          wadPow(int256(uint256(period)) * 1e18, WAD_CANVAS_GROWTH_ROOT),
          toWadUnsafe(uint256(BLOCKS_PER_INTERVAL))
        ) / 1e18
      );
    vm.roll(block.number + periodBlockNumber + 1);
    assertEq(LibGrowth.getCurrentPeriod(), period);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    address artist = address(0xface);
    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    uint16 canvasDim = LibGrowth.getPeriodCanvasDim({ period: period });
    int16 halfDim = int16(canvasDim / 2);
    if ((x >= -halfDim && x <= halfDim) && (y >= -halfDim && y <= halfDim)) {
      assertEq(
        LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: x, y: y }) }),
        hugeValue / (uint80(canvasDim) ** 2)
      );
    } else {
      assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: x, y: y }) }), 0);
    }
  }

  function test_GetEarliestStartPeriod() public {
    assertEq(LibRewards.getEarliestStartPeriod(0), 0);
    assertEq(LibRewards.getEarliestStartPeriod(int16(INITIAL_CANVAS_DIM / 2)), 0);
    assertEq(LibRewards.getEarliestStartPeriod(int16(INITIAL_CANVAS_DIM / 2 + 1)), 1);
    assertEq(LibRewards.getEarliestStartPeriod(int16(INITIAL_CANVAS_DIM / 2 + 8)), 8);
    assertEq(LibRewards.getEarliestStartPeriod(-1 * int16(INITIAL_CANVAS_DIM / 2)), 0);
    assertEq(LibRewards.getEarliestStartPeriod(-1 * int16(INITIAL_CANVAS_DIM / 2) - 1), 1);
    assertEq(LibRewards.getEarliestStartPeriod(-1 * int16(INITIAL_CANVAS_DIM / 2) - 8), 8);
  }

  function testFuzz_GetEarliestStartPeriod(int16 n) public {
    vm.assume(n > -32767 && n < 32767);
    uint16 period = LibRewards.getEarliestStartPeriod(n);
    if (LibRewards.abs(n) < INITIAL_CANVAS_DIM / 2) {
      assertEq(period, 0);
    } else {
      assertEq(period, LibRewards.abs(n) - INITIAL_CANVAS_DIM / 2);
    }
  }

  function testFuzz_GetCoordStartPeriod(int16 x, int16 y) public {
    vm.assume(x > -32767 && x < 32767);
    vm.assume(y > -32767 && y < 32767);

    uint16 max = LibRewards.abs(x);
    if (LibRewards.abs(y) > max) {
      max = LibRewards.abs(y);
    }

    uint16 period = 0;
    if (max > INITIAL_CANVAS_DIM / 2) {
      period = max - INITIAL_CANVAS_DIM / 2;
    }

    assertEq(LibRewards.getCoordStartPeriod(Coord({ x: x, y: y })), period);
  }

  function test_DistributesRewards() public {
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });
    address artist = address(0xface);
    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);
    uint256 trueUntrackedCoordRewards = hugeValue / (INITIAL_CANVAS_DIM ** 2);

    int256 intCanvasDim = int256(uint256(INITIAL_CANVAS_DIM));
    for (int256 x = -intCanvasDim / 2; x <= intCanvasDim / 2; x++) {
      for (int256 y = -intCanvasDim / 2; y <= intCanvasDim / 2; y++) {
        Coord memory coord = Coord({ x: int16(x), y: int16(y) });
        uint256 untrackedCoordRewards = LibRewards._getUntrackedCoordRewards({ coord: coord });
        assertEq(untrackedCoordRewards, trueUntrackedCoordRewards);
      }
    }

    assertEq(PeriodRewardTotal.get({ period: 0 }), hugeValue);
  }

  function test_RedeemRewards() public {
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });
    address artist = address(0xface);
    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);
    uint256 trueUntrackedCoordRewards = hugeValue / (INITIAL_CANVAS_DIM ** 2);

    assertEq(Rewards.get({ artist: artist }), 0);
    assertEq(Canvas.getTotalRewardsTracked({ x: 0, y: 0 }), 0);
    assertEq(PeriodRewardTotal.get({ period: 0 }), hugeValue);

    address taker = address(0xace);
    vm.deal(taker, hugeValue);
    vm.prank(taker);
    world.draw{ value: hugeValue }(units);

    assertApproxEqRel(Rewards.get({ artist: artist }), trueUntrackedCoordRewards * 2, 1e2);
    assertEq(Rewards.get({ artist: taker }), 0);
    assertApproxEqRel(Canvas.getTotalRewardsTracked({ x: 0, y: 0 }), trueUntrackedCoordRewards * 2, 1e2);
    assertEq(LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: 0, y: 0 }) }), 0);
    assertEq(PeriodRewardTotal.get({ period: 0 }), 2 * hugeValue);
  }

  /// forge-config: default.fuzz.runs = 15
  function testFuzz_MoveSequenceRewardAccountingLargeWaits(
    uint8[][] memory coordInfosRaw,
    address[] memory artistsRaw,
    uint256 blockWait
  ) public {
    blockWait = bound(blockWait, 1e5, 1e6);
    uint256 coordInfosLength = coordInfosRaw.length < 3 ? coordInfosRaw.length : 3;
    uint8[][] memory coordInfos = new uint8[][](coordInfosLength);
    for (uint256 i = 0; i < coordInfosLength; i++) {
      uint256 coordInfoLength = coordInfosRaw[i].length < 40 ? coordInfosRaw[i].length : 40;
      coordInfos[i] = new uint8[](coordInfoLength);
      for (uint256 j = 0; j < coordInfoLength; j++) {
        coordInfos[i][j] = coordInfosRaw[i][j];
      }
    }
    address[] memory artists = new address[](coordInfos.length);
    vm.assume(artistsRaw.length > 0 && artistsRaw[0] != address(0));
    for (uint256 i = 0; i < coordInfos.length; i++) {
      if (i < artistsRaw.length) {
        if (artistsRaw[i] == address(0)) artistsRaw[i] = artistsRaw[0];
        artists[i] = artistsRaw[i];
      } else {
        artists[i] = artistsRaw[0];
      }
      assumeValidPayableAddress(artists[i]);
    }

    RewardsTracker rewardsTracker = new RewardsTracker();

    uint256 smallValue = blockWait * 1e15;
    for (uint256 i = 0; i < coordInfos.length; i++) {
      vm.roll(block.number + blockWait);
      Unit[] memory units = getCoordInfoUnits({ coordInfo: coordInfos[i] });
      address artist = artists[i];
      vm.deal(artist, smallValue);
      vm.prank(artist);
      world.draw{ value: smallValue }(units);
      uint256 canvasDim = LibGrowth.getPeriodCanvasDim({ period: LibGrowth.getCurrentPeriod() });
      rewardsTracker.draw({ artist: artist, units: units, value: smallValue, canvasDim: canvasDim });
    }

    uint256 allPeriodsRewardTotal = 0;
    uint16 currentPeriod = LibGrowth.getCurrentPeriod();
    for (uint16 i = 0; i <= currentPeriod; i++) {
      console.log("period reward total", PeriodRewardTotal.get({ period: i }));
      allPeriodsRewardTotal += PeriodRewardTotal.get({ period: i });
    }
    console.log("small value", smallValue);
    console.log("coordInfos.length", coordInfos.length);
    console.log("allPeriodsRewardTotal", allPeriodsRewardTotal);
    assertEq(allPeriodsRewardTotal, coordInfos.length * smallValue);

    uint256 accountedRewards = 0;
    int256 intCanvasDim = int256(uint256(LibGrowth.getPeriodCanvasDim({ period: currentPeriod })));

    for (int256 x = -intCanvasDim / 2; x <= intCanvasDim / 2; x++) {
      for (int256 y = -intCanvasDim / 2; y <= intCanvasDim / 2; y++) {
        accountedRewards += LibRewards._getUntrackedCoordRewards({ coord: Coord({ x: int16(x), y: int16(y) }) });
      }
    }

    for (uint256 i = 0; i < artists.length; i++) {
      bool isUnique = true;
      for (uint256 j = 0; j < i; j++) {
        if (artists[j] == artists[i]) {
          isUnique = false;
          break;
        }
      }
      if (isUnique) {
        accountedRewards += Rewards.get({ artist: artists[i] });
      }
    }

    assertTrue(accountedRewards <= coordInfos.length * smallValue);
    assertApproxEqRel(accountedRewards, coordInfos.length * smallValue, 1e5);

    for (uint256 i = 0; i < artists.length; i++) {
      bool isUnique = true;
      for (uint256 j = 0; j < i; j++) {
        if (artists[j] == artists[i]) {
          isUnique = false;
          break;
        }
      }
      if (isUnique) {
        address artist = artists[i];
        uint256 artistRewards = Rewards.get({ artist: artist });
        for (int256 x = -intCanvasDim / 2; x <= intCanvasDim / 2; x++) {
          for (int256 y = -intCanvasDim / 2; y <= intCanvasDim / 2; y++) {
            CanvasData memory canvasData = Canvas.get({ x: int16(x), y: int16(y) });
            if (canvasData.artist == artist) {
              uint80 untrackedCoordRewards = LibRewards._getUntrackedCoordRewards({
                coord: Coord({ x: int16(x), y: int16(y) })
              });
              artistRewards += untrackedCoordRewards;
              if (untrackedCoordRewards > 0) {
                Coord[] memory coords = new Coord[](1);
                coords[0] = Coord({ x: int16(x), y: int16(y) });
                world.claimRewards({ coords: coords, artist: artist });
              }
            }
          }
        }
        if (artistRewards != address(artist).balance) {
          Coord[] memory coords = new Coord[](0);
          world.claimRewards({ coords: coords, artist: artist });
        }
        console.log("rewards tracker", rewardsTracker.rewards(artist));
        console.log("artist rewards", artistRewards);
        assertApproxEqRel(rewardsTracker.rewards(artist), artistRewards, 1e5);
        console.log("artist balance", address(artist).balance);
        console.log("artist", artist);
        assertEq(address(artist).balance, artistRewards);
      }
    }
  }
}
