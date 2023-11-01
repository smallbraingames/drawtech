// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { BaseTest } from "../Base.t.sol";
import { Coord, Unit } from "common/Unit.sol";
import { Lock } from "codegen/index.sol";
import { LockedWorld } from "../../src/LockedWorld.sol";
import { DrawSystem } from "../../src/systems/DrawSystem.sol";

contract LockSystemTest is BaseTest {
  function test_RevertWhen_NonGameSystemsCalledTwice() public {
    vm.expectRevert(LockedWorld.Locked.selector);
    world.lock();
    vm.expectRevert(LockedWorld.Locked.selector);
    world.setInitialBlock();
  }

  function testFuzz_RevertWhen_RegisterSystem(bytes2 typeId, bytes30 name, bool publicAccess) public {
    DrawSystem system = new DrawSystem();
    ResourceId systemId = ResourceIdLib.encode(typeId, name);
    vm.expectRevert(LockedWorld.Locked.selector);
    world.registerSystem(systemId, system, publicAccess);
  }

  function test_CanDrawWhenLocked() public {
    address artist = address(0x1);
    uint256 hugeValue = 100 ether;
    vm.deal(artist, hugeValue);
    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });
    vm.prank(artist);
    world.draw{ value: hugeValue }(units);
  }

  function test_RevertsWhen_TryUnlock() public {
    vm.expectRevert();
    Lock.set(false);
  }

  function testFuzz_RevertsWhen_TryUnlock(address addr) public {
    vm.expectRevert();
    Lock.set(false);

    vm.deal(addr, 1 ether);
    vm.startPrank(addr);
    vm.expectRevert();
    Lock.set(false);
    vm.stopPrank();
  }
}
