// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";

contract NameTest is BaseTest {
  function test_NameDoesNotRevert() public {
    address artist = address(0xace);
    vm.prank(artist);
    world.setName("test");
  }
}
