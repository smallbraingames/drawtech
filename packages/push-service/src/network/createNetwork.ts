import { transportObserver } from "@latticexyz/common";
import { createWorld } from "@latticexyz/recs";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { Hex, createPublicClient, fallback, http } from "viem";

import mudConfig from "../contracts/mud.config";
import getNetworkConfig from "./getNetworkConfig";

export type Network = Awaited<ReturnType<typeof createNetwork>>;

const world = createWorld();

const createNetwork = async () => {
  const networkConfig = getNetworkConfig();

  console.log(
    "[Push Service: Setup Network] Setting up network",
    networkConfig.worldAddress,
    networkConfig.chain.id,
  );
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } =
    await syncToRecs<typeof mudConfig>({
      world,
      config: mudConfig,
      address: networkConfig.worldAddress as Hex,
      publicClient,
      startBlock: BigInt(networkConfig.initialBlockNumber),
      indexerUrl: networkConfig.indexerUrl,
    });

  return {
    world,
    components,
    publicClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    networkConfig,
    initialBlockNumber: networkConfig.initialBlockNumber,
  };
};

export default createNetwork;
