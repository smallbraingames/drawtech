// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";

import { Coord, Unit } from "common/Unit.sol";

contract RewardsTracker {
  mapping(uint256 => address) public canvas;
  mapping(address => uint256) public rewards;
  mapping(uint256 => uint256) public emptyUnitValue;

  function getCoordHash(Coord memory coord) public pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(coord.x, coord.y)));
  }

  function draw(Unit[] memory units, address artist, uint256 value, uint256 canvasDim) public {
    int256 intCanvasDim = int256(uint256(canvasDim));

    uint256 valuePerTile = value / (canvasDim ** 2);
    for (int256 x = -intCanvasDim / 2; x <= intCanvasDim / 2; x++) {
      for (int256 y = -intCanvasDim / 2; y <= intCanvasDim / 2; y++) {
        Coord memory coord = Coord({ x: int16(x), y: int16(y) });
        uint256 hash = getCoordHash({ coord: coord });
        address coordArtist = canvas[hash];
        if (coordArtist == address(0)) {
          emptyUnitValue[hash] += valuePerTile;
        } else {
          rewards[coordArtist] += valuePerTile;
        }
      }
    }

    for (uint256 i = 0; i < units.length; i += 1) {
      Unit memory unit = units[i];
      uint256 hash = getCoordHash({ coord: unit.coord });
      address prevArtist = canvas[hash];
      if (prevArtist == address(0)) {
        rewards[artist] += emptyUnitValue[hash];
      }
      canvas[hash] = artist;
    }
  }
}
