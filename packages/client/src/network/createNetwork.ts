import { transportObserver } from "@latticexyz/common";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";

import getNetworkConfig from "./getNetworkConfig";
import world from "./world";

export type Network = Awaited<ReturnType<typeof createNetwork>>;

const createNetwork = async () => {
  const networkConfig = getNetworkConfig();

  console.log("[Setup Network] Setting up network", networkConfig);
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } =
    await syncToRecs({
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
