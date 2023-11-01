import {
  Has,
  defineComponentSystem,
  getComponentValueStrict,
  runQuery,
} from "@latticexyz/recs";
import { Address, createPublicClient, http } from "viem";

import { GameComponents } from "../../game/gameManager";
import getNetworkConfig from "../../network/getNetworkConfig";
import world from "../../network/world";

const createSanityCheckSystem = async (gameComponents: GameComponents) => {
  const networkConfig = getNetworkConfig();
  const worldAddress = networkConfig.worldAddress;
  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: http(),
  });
  const { UnclaimedRewards } = gameComponents;

  defineComponentSystem(world, UnclaimedRewards, async () => {
    let totalRewards = 0n;
    runQuery([Has(UnclaimedRewards)]).forEach((entity) => {
      const { value } = getComponentValueStrict(UnclaimedRewards, entity);
      totalRewards += value;
    });

    const worldAddressBalance = await publicClient.getBalance({
      address: worldAddress as Address,
    });

    if (totalRewards <= worldAddressBalance) {
      // console.log(
      //   "[Sanity Check] Balance sanity check passed",
      //   totalRewards,
      //   worldAddressBalance
      // );
    } else {
      // console.error(
      //   "[Sanity Check] Balance sanity check failed",
      //   totalRewards,
      //   worldAddressBalance
      // );
      // alert(
      //   "An automatic accounting check on the smart contract has failed. Please do not play this game until the issue is resolved."
      // );
    }
  });
};

export default createSanityCheckSystem;
