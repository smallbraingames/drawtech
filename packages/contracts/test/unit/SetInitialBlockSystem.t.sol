// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";

import { LockedWorld } from "../../src/LockedWorld.sol";

contract SetInitialBlockTest is BaseTest {
  function test_RevertsWhen_SetInitialBlockTwice() public {
    vm.expectRevert(LockedWorld.Locked.selector);
    world.setInitialBlock();
  }

  function testFuzz_RevertsWhen_SetInitialBlockTwice(address setter, uint256 blockNumber) public {
    vm.startPrank(setter);
    vm.roll(blockNumber);
    vm.deal(setter, 1 ether);
    vm.expectRevert();
    world.setInitialBlock();
    vm.stopPrank();
  }
}
