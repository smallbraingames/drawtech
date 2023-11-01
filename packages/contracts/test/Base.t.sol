// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { Coord, Unit } from "common/Unit.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";

contract BaseTest is MudTest {
  IWorld public world;
  uint256 hugeValue = 1e5 ether;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  function assumeValidPayableAddress(address addr) internal {
    vm.assume(
      addr != address(0xCe71065D4017F316EC606Fe4422e11eB2c47c246) &&
        addr != address(0x4e59b44847b379578588920cA78FbF26c0B4956C) &&
        addr != address(0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84) &&
        addr != address(0x185a4dc360CE69bDCceE33b3784B0282f7961aea) &&
        addr != address(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D) &&
        addr != worldAddress &&
        addr > address(0x9)
    );
    assumePayable(addr);
  }

  function getCoordInfoUnits(uint8[] memory coordInfo) internal view returns (Unit[] memory) {
    uint256 coordInfoPaddedLen = coordInfo.length < 3 ? 3 : coordInfo.length;
    uint8[] memory coordInfoPadded = new uint8[](coordInfoPaddedLen);
    for (uint256 i = 0; i < coordInfo.length; i += 1) {
      coordInfoPadded[i] = coordInfo[i];
    }
    Unit[] memory units = new Unit[](coordInfoPadded.length / 3);
    int16 canvasDim = int16(LibGrowth.getPeriodCanvasDim({ period: LibGrowth.getCurrentPeriod() }));
    for (uint256 i = 0; i < units.length; i += 1) {
      uint256 j = i * 3;
      int16 x = int16(uint16(bound(coordInfoPadded[j], 0, uint16(canvasDim))));
      int16 y = int16(uint16(bound(coordInfoPadded[j + 1], 0, uint16(canvasDim))));
      if (x > canvasDim / 2) {
        x = int16(uint16(bound(uint16(x), 0, uint16(canvasDim) / 2)));
        x = -x;
      }
      if (y > canvasDim / 2) {
        y = int16(uint16(bound(uint16(y), 0, uint16(canvasDim) / 2)));
        y = -y;
      }
      units[i] = Unit({ coord: Coord({ x: x, y: y }), color: coordInfoPadded[j + 2] });
    }
    return units;
  }
}
