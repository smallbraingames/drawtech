// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";

import { Canvas, Name, Rewards } from "codegen/index.sol";
import { Coord, Unit } from "common/Unit.sol";
import { EmptyMove, NoRewards, NotEnoughValue, NotOwner, OutOfBounds } from "common/Errors.sol";
import { LibDraw } from "libraries/LibDraw.sol";
import { LibGrowth } from "libraries/LibGrowth.sol";
import { LibPrice } from "libraries/LibPrice.sol";
import { LibRewards } from "libraries/LibRewards.sol";

contract DrawSystem is System {
  function draw(Unit[] memory units) public payable {
    uint256 value = _msgValue();
    executeDraw({ units: units, value: value });
    LibRewards.emitSpent({ artist: _msgSender(), value: value, moveId: LibDraw.getMoveId() });
  }

  function drawFee(Unit[] memory units, uint256 fee, address feeTaker) public payable {
    uint256 value = _msgValue();
    if (value < fee) {
      revert NotEnoughValue();
    }
    executeDraw({ units: units, value: value - fee });
    payable(feeTaker).transfer(fee);
    LibRewards.emitSpent({ artist: _msgSender(), value: value, moveId: LibDraw.getMoveId() });
  }

  function executeDraw(Unit[] memory units, uint256 value) private {
    if (units.length == 0) {
      revert EmptyMove();
    }
    uint16 period = LibGrowth.getCurrentPeriod();
    uint16 canvasDim = LibGrowth.getPeriodCanvasDim(period);

    for (uint256 i = 0; i < units.length; i += 1) {
      Coord memory coord = units[i].coord;
      if (!LibGrowth.isCoordInDimBounds({ coord: coord, canvasDim: canvasDim })) {
        revert OutOfBounds();
      }
    }

    uint256 price = LibPrice.getTotalPriceAndIncrementNumSold({ units: units });
    if (value < price) {
      revert NotEnoughValue();
    }

    LibRewards.addUntrackedRewards({ value: value });
    LibRewards.trackRewards({ units: units });

    address artist = _msgSender();
    LibDraw.draw({ units: units, artist: artist });
  }

  function claimRewards(Coord[] memory coords, address artist) public {
    uint16 period = LibGrowth.getCurrentPeriod();
    uint16 canvasDim = LibGrowth.getPeriodCanvasDim(period);
    for (uint256 i = 0; i < coords.length; i += 1) {
      Coord memory coord = coords[i];
      if (!LibGrowth.isCoordInDimBounds({ coord: coord, canvasDim: canvasDim })) {
        revert OutOfBounds();
      }
      if (Canvas.getArtist({ x: coord.x, y: coord.y }) != artist) {
        revert NotOwner();
      }
    }

    LibRewards.trackRewards({ coords: coords });

    uint256 rewards = Rewards.get({ artist: artist });
    if (rewards == 0) {
      revert NoRewards();
    }
    Rewards.set({ artist: artist, value: 0 });

    payable(artist).transfer(rewards);

    LibRewards.emitClaimRewards({ artist: artist, value: rewards });
  }

  function setName(string memory name) public {
    Name.set({ artist: _msgSender(), value: name });
  }
}
