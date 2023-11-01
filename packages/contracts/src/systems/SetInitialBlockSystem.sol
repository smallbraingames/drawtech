// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

import { AlreadySetInitialBlock } from "common/Errors.sol";
import { InitialBlock } from "codegen/index.sol";

contract SetInitialBlockSystem is System {
  function setInitialBlock() public {
    if (InitialBlock.get() != 0) {
      revert AlreadySetInitialBlock();
    }
    InitialBlock.set({ value: uint64(block.number) });
  }
}
