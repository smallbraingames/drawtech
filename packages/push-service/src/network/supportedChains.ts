import {
  MUDChain,
  latticeTestnet,
  mudFoundry,
} from "@latticexyz/common/chains";
import { base, baseGoerli } from "viem/chains";

const BASE_MAIN_HTTP = "https://mainnet.base.org";
const baseMud = {
  name: base.name,
  id: base.id,
  network: base.network,
  nativeCurrency: base.nativeCurrency,
  rpcUrls: {
    default: {
      http: [BASE_MAIN_HTTP],
    },
    public: {
      http: [BASE_MAIN_HTTP],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://base.blockscout.com/",
    },
  },
};

const BASE_GOERLI_BLASTAPI_HTTP = "https://base-goerli.public.blastapi.io";
const BASE_GOERLI_BLASTAPI_WS = "wss://base-goerli.public.blastapi.io";
const baseGoerliMud = {
  name: baseGoerli.name,
  id: baseGoerli.id,
  network: baseGoerli.network,
  nativeCurrency: baseGoerli.nativeCurrency,
  rpcUrls: {
    default: {
      http: [BASE_GOERLI_BLASTAPI_HTTP],
      webSocket: [BASE_GOERLI_BLASTAPI_WS],
    },
    public: {
      http: [BASE_GOERLI_BLASTAPI_HTTP],
      webSocket: [BASE_GOERLI_BLASTAPI_WS],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://base-goerli.blockscout.com/",
    },
  },
};

const supportedChains = [
  latticeTestnet,
  mudFoundry,
  baseMud,
  baseGoerliMud,
] as MUDChain[];

export default supportedChains;
