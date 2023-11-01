// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { StoreData } from "@latticexyz/store/src/StoreData.sol";
import { IModule, MODULE_INTERFACE_ID } from "@latticexyz/world/src/IModule.sol";
import { IWorldKernel } from "@latticexyz/world/src/IWorldKernel.sol";
import { Balances } from "@latticexyz/world/src/codegen/tables/Balances.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { WORLD_VERSION } from "@latticexyz/world/src/version.sol";
import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/tables/InstalledModules.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
import { CORE_MODULE_NAME } from "@latticexyz/world/src/modules/core/constants.sol";
import { requireInterface } from "@latticexyz/world/src/requireInterface.sol";
import { WorldContextProviderLib } from "@latticexyz/world/src/WorldContext.sol";

import { Lock } from "codegen/index.sol";

/* solhint-disable mud/no-msg-sender */
contract LockedWorld is IWorldKernel, StoreData {
  using WorldResourceIdInstance for ResourceId;

  error Locked();

  /// @notice Address of the contract's creator.
  address public immutable creator;

  /// @return The current version of the world contract.
  function worldVersion() public pure returns (bytes32) {
    return WORLD_VERSION;
  }

  /// @dev Event emitted when the World contract is created.
  constructor() {
    creator = msg.sender;
    emit HelloWorld(WORLD_VERSION);
  }

  /**
   * @dev Prevents the World contract from calling itself.
   */
  modifier requireNoCallback() {
    if (msg.sender == address(this)) {
      revert World_CallbackNotAllowed(msg.sig);
    }
    _;
  }

  function initialize(IModule coreModule) public requireNoCallback {
    // Only the initial creator of the World can initialize it
    if (msg.sender != creator) {
      revert World_AccessDenied(ROOT_NAMESPACE_ID.toString(), msg.sender);
    }

    // The World can only be initialized once
    if (InstalledModules._get(CORE_MODULE_NAME, keccak256("")) != address(0)) {
      revert World_AlreadyInitialized();
    }

    // Initialize the World by installing the core module
    _installRootModule(coreModule, new bytes(0));
  }

  /**
   * @dev Internal function to install a root module.
   * @param module The module to be installed.
   * @param args Arguments for module installation.
   */
  function _installRootModule(IModule module, bytes memory args) internal {
    // Require the provided address to implement the IModule interface
    requireInterface(address(module), MODULE_INTERFACE_ID);

    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: msg.sender,
      msgValue: 0,
      target: address(module),
      callData: abi.encodeCall(IModule.installRoot, (args))
    });

    // Register the module in the InstalledModules table
    InstalledModules._set(module.getName(), keccak256(args), address(module));
  }

  /// @dev Locked methods

  function installRootModule(IModule, bytes memory) external pure {
    revert Locked();
  }

  function call(ResourceId, bytes memory) external payable returns (bytes memory) {
    revert Locked();
  }

  function callFrom(address, ResourceId, bytes memory) external payable returns (bytes memory) {
    revert Locked();
  }

  function setRecord(ResourceId, bytes32[] calldata, bytes calldata, PackedCounter, bytes calldata) external pure {
    revert Locked();
  }

  function spliceStaticData(ResourceId, bytes32[] calldata, uint48, bytes calldata) external pure {
    revert Locked();
  }

  function spliceDynamicData(ResourceId, bytes32[] calldata, uint8, uint40, uint40, bytes calldata) external pure {
    revert Locked();
  }

  function setField(ResourceId, bytes32[] calldata, uint8, bytes calldata) external pure {
    revert Locked();
  }

  function setField(ResourceId, bytes32[] calldata, uint8, bytes calldata, FieldLayout) external pure {
    revert Locked();
  }

  function setStaticField(ResourceId, bytes32[] calldata, uint8, bytes calldata, FieldLayout) external pure {
    revert Locked();
  }

  function setDynamicField(ResourceId, bytes32[] calldata, uint8, bytes calldata) external pure {
    revert Locked();
  }

  function pushToDynamicField(ResourceId, bytes32[] calldata, uint8, bytes calldata) external pure {
    revert Locked();
  }

  function popFromDynamicField(ResourceId, bytes32[] calldata, uint8, uint256) external pure {
    revert Locked();
  }

  function deleteRecord(ResourceId, bytes32[] memory) external pure {
    revert Locked();
  }

  /**
   * @notice Accepts ETH and adds to the root namespace's balance.
   */
  receive() external payable {
    uint256 rootBalance = Balances._get(ROOT_NAMESPACE_ID);
    Balances._set(ROOT_NAMESPACE_ID, rootBalance + msg.value);
  }

  /**
   * @dev Fallback function to call registered function selectors.
   */
  fallback() external payable requireNoCallback {
    (ResourceId systemId, bytes4 systemFunctionSelector) = FunctionSelectors._get(msg.sig);

    if (ResourceId.unwrap(systemId) == 0) revert World_FunctionSelectorNotFound(msg.sig);

    if (
      Lock.get() &&
      bytes32(abi.encode(systemId)) != bytes32(0x737900000000000000000000000000004472617753797374656d000000000000)
    ) {
      revert Locked();
    }

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    // Call the function and forward the call data
    bytes memory returnData = SystemCall.callWithHooksOrRevert(msg.sender, systemId, callData, msg.value);

    // If the call was successful, return the return data
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }
}
/* solhint-enable mud/no-msg-sender */
