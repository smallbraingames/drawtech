// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { Unit, Coord } from "common/Unit.sol";

/**
 * @title IDrawSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IDrawSystem {
  function draw(Unit[] memory units) external payable;

  function drawFee(Unit[] memory units, uint256 fee, address feeTaker) external payable;

  function claimRewards(Coord[] memory coords, address artist) external;

  function setName(string memory name) external;
}
