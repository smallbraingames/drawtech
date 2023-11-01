import { mudConfig } from "@latticexyz/world/register";

export default mudConfig({
  worldContractName: "LockedWorld",
  tables: {
    Canvas: {
      keySchema: { x: "int16", y: "int16" },
      valueSchema: {
        artist: "address",
        numSold: "uint16",
        totalRewardsTracked: "uint80",
      },
      storeArgument: false,
    },
    Rewards: {
      keySchema: { artist: "address" },
      valueSchema: {
        value: "uint80",
      },
      storeArgument: false,
    },
    PeriodRewardTotal: {
      keySchema: { period: "uint16" },
      valueSchema: {
        value: "uint80",
      },
      storeArgument: false,
    },
    Lock: {
      keySchema: {},
      valueSchema: { value: "bool" },
      storeArgument: false,
    },
    InitialBlock: {
      keySchema: {},
      valueSchema: { value: "uint64" },
      storeArgument: false,
    },
    CanvasColor: {
      keySchema: { x: "int16", y: "int16", id: "uint256" },
      valueSchema: {
        value: "uint8",
        blockNumber: "uint64",
      },
      offchainOnly: true,
    },
    Name: {
      keySchema: { artist: "address" },
      valueSchema: {
        value: "string",
      },
      offchainOnly: true,
    },
    RewardClaim: {
      keySchema: { artist: "address" },
      valueSchema: {
        value: "uint256",
      },
      offchainOnly: true,
    },
    Spent: {
      keySchema: { artist: "address", id: "uint256" },
      valueSchema: {
        value: "uint80",
        blockNumber: "uint64",
      },
      offchainOnly: true,
    },
  },
});
