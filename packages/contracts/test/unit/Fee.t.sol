// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { BaseTest } from "../Base.t.sol";
import { NotEnoughValue } from "common/Errors.sol";
import { Coord, Unit } from "common/Unit.sol";

contract FeeTest is BaseTest {
  function test_TakesFee() public {
    address feeTaker = address(0xcafe);
    address artist = address(0xface);

    Unit[] memory units = new Unit[](1);
    units[0] = Unit({ coord: Coord({ x: 0, y: 0 }), color: 0 });

    uint256 feeAmount = 0.05 ether;

    uint256 prevFeeTakerBalance = address(feeTaker).balance;

    vm.deal(artist, hugeValue + feeAmount);
    vm.prank(artist);
    world.drawFee{ value: hugeValue }(units, feeAmount, feeTaker);

    assertEq(address(feeTaker).balance, prevFeeTakerBalance + feeAmount);
  }

  function testFuzz_TakesFee(address feeTaker, address artist, uint256 feeAmount, uint8[] memory coordInfo) public {
    assumeValidPayableAddress(feeTaker);
    assumeValidPayableAddress(artist);

    feeAmount = bound(feeAmount, 0, hugeValue);

    Unit[] memory units = getCoordInfoUnits(coordInfo);

    vm.deal(artist, hugeValue + feeAmount);

    uint256 prevFeeTakerBalance = address(feeTaker).balance;
    vm.prank(artist);
    world.drawFee{ value: hugeValue + feeAmount }(units, feeAmount, feeTaker);

    if (feeTaker != artist) {
      assertEq(address(feeTaker).balance, prevFeeTakerBalance + feeAmount);
    } else {
      assertEq(address(feeTaker).balance, prevFeeTakerBalance - hugeValue);
    }
  }

  function testFuzz_RevertsWhen_NotEnoughValue(
    address feeTaker,
    address artist,
    uint256 feeAmount,
    uint256 lessThanFeeAmount,
    uint8[] memory coordInfo
  ) public {
    assumeValidPayableAddress(feeTaker);
    assumeValidPayableAddress(artist);
    feeAmount = bound(feeAmount, 1, hugeValue);
    lessThanFeeAmount = bound(lessThanFeeAmount, 1, feeAmount) - 1;

    Unit[] memory units = getCoordInfoUnits(coordInfo);

    vm.deal(artist, feeAmount);
    vm.startPrank(artist);
    vm.expectRevert(NotEnoughValue.selector);
    world.drawFee{ value: lessThanFeeAmount }(units, feeAmount, feeTaker);
    vm.stopPrank();
  }
}
