import { getContract } from "@latticexyz/common";
import { getComponentValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { Hex } from "viem";
import { getWalletClient } from "wagmi/actions";

import { Network } from "./createNetwork";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

const createSystemCalls = ({
  waitForTransaction,
  networkConfig,
  publicClient,
}: Network) => {
  const getWorldContract = async () => {
    const walletClient = await getWalletClient({
      chainId: networkConfig.chain.id,
    });
    if (walletClient?.account === undefined) {
      console.warn(
        "[Create System Calls] Wallet client is undefined",
        walletClient
      );
      return undefined;
    }
    await walletClient.switchChain({ id: networkConfig.chain.id });
    const worldContract = getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorldAbi,
      publicClient,
      walletClient,
    });
    return worldContract;
  };

  const increment = async () => {
    const tx = await (
      await getWorldContract()
    )?.write.increment({
      chain: networkConfig.chain,
    });
    if (!tx) return;
    await waitForTransaction(tx);
    return getComponentValue(Counter, singletonEntity);
  };

  return {
    increment,
  };
};

export default createSystemCalls;
