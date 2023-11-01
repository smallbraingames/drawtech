// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";
import { Canvas, CanvasData } from "codegen/index.sol";
import { INITIAL_CANVAS_DIM } from "common/Config.sol";
import { EmptyMove, NotEnoughValue, OutOfBounds } from "common/Errors.sol";
import { Coord, Unit } from "common/Unit.sol";

contract DrawSystemTest is BaseTest {
  function test_DrawWritesToCanvas() public {
    address artist = address(0x1);
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 10 });
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    CanvasData memory unit = Canvas.get({ x: 0, y: 0 });
    assertEq(unit.artist, artist);
    assertEq(unit.numSold, 1);
  }

  function test_DrawingDuplicatesCountsCorrectly() public {
    address artist = address(0x32);
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](2);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 10 });
    units[1] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 8 });

    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    CanvasData memory unit = Canvas.get({ x: 0, y: 0 });
    assertEq(unit.artist, artist);
    assertEq(unit.numSold, 2);
  }

  function test_RevertsWhen_EmptyMove() public {
    address artist = address(0xcafe);
    vm.deal(artist, hugeValue);
    vm.expectRevert(EmptyMove.selector);
    vm.prank(artist);
    world.draw{ value: hugeValue }(new Unit[](0));
  }

  function test_RevertsWhen_NotEnoughValue() public {
    address artist = address(0xcafe);
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 10 });
    vm.expectRevert(NotEnoughValue.selector);
    vm.prank(artist);
    world.draw{ value: 1 }(units);
  }

  function test_RevertsWhen_OutOfBounds() public {
    address artist = address(0xcafe);
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: int16(INITIAL_CANVAS_DIM), y: int16(INITIAL_CANVAS_DIM) }), color: 10 });
    vm.expectRevert(OutOfBounds.selector);
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);
  }

  function test_UnsetCanvasHasZeroArtist() public {
    address unitArtist = Canvas.getArtist({ x: 0, y: 0 });
    assertEq(unitArtist, address(0));

    address artist = address(0xcafe);
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 10 });
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);

    unitArtist = Canvas.getArtist({ x: 0, y: 0 });
    assertEq(unitArtist, artist);

    unitArtist = Canvas.getArtist({ x: 1, y: 1 });
    assertEq(unitArtist, address(0));
  }
}
