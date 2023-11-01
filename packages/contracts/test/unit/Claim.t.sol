// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";
import { Rewards } from "codegen/index.sol";
import { NoRewards, OutOfBounds } from "common/Errors.sol";
import { Coord, Unit } from "common/Unit.sol";

contract ClaimTest is BaseTest {
  function test_ClaimsCorrectAmount() public {
    address artist = address(0xace);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    uint256 prevBalance = address(artist).balance;
    Coord[] memory claimCoords = new Coord[](1);
    claimCoords[0] = Coord({ x: 0, y: 0 });

    world.claimRewards({ coords: claimCoords, artist: artist });
    assertTrue(address(artist).balance > prevBalance);
    assertEq(Rewards.get({ artist: artist }), 0);
  }

  function test_RevertsWhen_ClaimTwice() public {
    address artist = address(0x3233);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    Coord[] memory claimCoords = new Coord[](1);
    claimCoords[0] = Coord({ x: 0, y: 0 });

    world.claimRewards({ coords: claimCoords, artist: artist });
    assertEq(Rewards.get({ artist: artist }), 0);

    vm.expectRevert(NoRewards.selector);
    world.claimRewards({ coords: claimCoords, artist: artist });
  }

  function test_RevertsWhen_ClaimsOutOfBounds() public {
    address artist = address(0x3233);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    Coord[] memory claimCoords = new Coord[](1);
    claimCoords[0] = Coord({ x: 100, y: 100 });

    vm.expectRevert(OutOfBounds.selector);
    world.claimRewards({ coords: claimCoords, artist: artist });
  }

  function testFuzz_Claim(address artist, uint8[] memory coordInfo) public {
    vm.assume(coordInfo.length > 3);
    assumeValidPayableAddress(artist);

    address artistFirst = address(0x3233);

    Unit[] memory unitsFirst = new Unit[](1);
    unitsFirst[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    vm.deal(artistFirst, hugeValue);
    vm.prank(artistFirst);
    world.draw{ value: hugeValue }(unitsFirst);

    Unit[] memory units = getCoordInfoUnits(coordInfo);
    vm.assume(units[0].coord.x != 0 || units[0].coord.y != 0);
    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    Coord[] memory claimCoords = new Coord[](units.length);
    for (uint256 i = 0; i < units.length; i++) {
      claimCoords[i] = units[i].coord;
    }
    world.claimRewards({ coords: claimCoords, artist: artist });

    vm.expectRevert(NoRewards.selector);
    world.claimRewards({ coords: claimCoords, artist: artist });
  }

  function test_DuplicateUnitInClaimClaimsCorrectAmount() public {
    address artist = address(0xecaf);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    vm.deal(artist, hugeValue);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    uint256 prevBalance = address(artist).balance;
    Coord[] memory claimCoords = new Coord[](2);
    claimCoords[0] = Coord({ x: 0, y: 0 });
    claimCoords[1] = Coord({ x: 0, y: 0 });

    world.claimRewards({ coords: claimCoords, artist: artist });
    assertTrue(address(artist).balance > prevBalance);
    assertEq(Rewards.get({ artist: artist }), 0);
  }
}
