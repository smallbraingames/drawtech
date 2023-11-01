import worlds from "../contracts/worlds.json";
import supportedChains from "./supportedChains";

const getNetworkConfig = () => {
  const chainId = Number(process.env.CHAIN_ID || 31337);
  const chainIndex = supportedChains.findIndex((c) => c.id === chainId);
  const chain = supportedChains[chainIndex];
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }
  const world = (
    worlds as {
      [key: string]: { address: `0x${string}`; blockNumber?: bigint | number };
    }
  )[chain.id.toString()];
  const worldAddress = world?.address;
  const initialBlockNumber = world?.blockNumber ?? 0n;
  const getIndexerUrl = (chainId: number): string | undefined => {
    if (chainId === 84531) {
      return "https://indexer.base-goerli-mud-services.linfra.xyz";
    } else if (chainId === 8453) {
      return "https://indexer.base-mainnet-mud-services.linfra.xyz";
    }
    return undefined;
  };
  return {
    indexerUrl: getIndexerUrl(chainId),
    chainId,
    chain,
    faucetServiceUrl: chain.faucetUrl,
    worldAddress,
    initialBlockNumber,
  };
};

export default getNetworkConfig;
