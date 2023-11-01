// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";

import { Lock } from "codegen/index.sol";

contract LockSystem is System {
  function lock() public {
    Lock.set({ value: true });
  }
}
