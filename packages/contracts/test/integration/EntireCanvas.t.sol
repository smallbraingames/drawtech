// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";
import { Coord, Unit } from "common/Unit.sol";
import { INITIAL_CANVAS_DIM } from "common/Config.sol";

contract EntireCanvasTest is BaseTest {
  function test_DrawAndClaimRewardsForEntireCanvas() public {
    uint256 totalUnits = INITIAL_CANVAS_DIM ** 2;
    Unit[] memory units1 = new Unit[](totalUnits / 3);
    Coord[] memory coords1 = new Coord[](totalUnits / 3);
    Unit[] memory units2 = new Unit[](totalUnits / 3);
    Coord[] memory coords2 = new Coord[](totalUnits / 3);
    Unit[] memory units3 = new Unit[](totalUnits - totalUnits / 3 - totalUnits / 3);
    Coord[] memory coords3 = new Coord[](totalUnits - totalUnits / 3 - totalUnits / 3);

    uint256 indexTracker = 0;
    uint256 index1 = 0;
    uint256 index2 = 0;
    uint256 index3 = 0;
    int16 halfDim = int16(INITIAL_CANVAS_DIM / 2);
    for (int16 x = -halfDim; x <= halfDim; x++) {
      for (int16 y = -halfDim; y <= halfDim; y++) {
        if (indexTracker % 3 == 0) {
          if (index1 >= totalUnits / 3) {
            units3[index3] = Unit({ coord: Coord({ x: x, y: y }), color: 3 });
            coords3[index3] = Coord({ x: x, y: y });
          } else {
            units1[index1] = Unit({ coord: Coord({ x: x, y: y }), color: 1 });
            coords1[index1] = Coord({ x: x, y: y });
          }
          index1++;
        } else if (indexTracker % 3 == 1) {
          if (index2 >= totalUnits / 3) {
            units3[index3] = Unit({ coord: Coord({ x: x, y: y }), color: 3 });
            coords3[index3] = Coord({ x: x, y: y });
          } else {
            units2[index2] = Unit({ coord: Coord({ x: x, y: y }), color: 2 });
            coords2[index2] = Coord({ x: x, y: y });
          }
          index2++;
        } else {
          units3[index3] = Unit({ coord: Coord({ x: x, y: y }), color: 3 });
          coords3[index3] = Coord({ x: x, y: y });
          index3++;
        }
        indexTracker++;
      }
    }

    // Commented because of stack too deep
    // player1 = address(0x1ace)
    // player2 = address(0x2cea)
    // player3 = address(0x3eac)

    vm.deal(address(0x1ace), hugeValue);
    vm.prank(address(0x1ace));
    world.draw{ value: hugeValue }(units1);

    vm.deal(address(0x2cea), hugeValue);
    vm.prank(address(0x2cea));
    world.draw{ value: hugeValue }(units2);

    vm.deal(address(0x3eac), hugeValue);
    vm.prank(address(0x3eac));
    world.draw{ value: hugeValue }(units3);

    vm.prank(address(0x1ace));
    world.claimRewards(coords1, address(0x1ace));

    vm.startPrank(address(0x1ace));
    vm.expectRevert();
    world.claimRewards(coords2, address(0x1ace));
    vm.stopPrank();

    vm.prank(address(0x2cea));
    world.claimRewards(coords2, address(0x2cea));

    vm.prank(address(0x3eac));
    world.claimRewards(coords3, address(0x3eac));

    // All the rewards that went in are claimed, and even if the entire board is covered this works
    assertApproxEqRel(address(0x1ace).balance + address(0x2cea).balance + address(0x3eac).balance, hugeValue * 3, 1e4);

    assertEq(address(0x1ace).balance, address(0x2cea).balance);
  }
}
