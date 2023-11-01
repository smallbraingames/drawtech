import config from "contracts/out/Config.sol/Config.json";

const getContractConfigValue = (name: string): string => {
  const node = config.ast.nodes.find((node) => node.name === name);
  if (!node) {
    throw Error(`No node with name ${name} found in config`);
  }
  const value = node.value?.value;
  if (value === undefined) {
    throw Error(`Node with name ${name} has no value`);
  }
  return value;
};

const parseWadSolidityNotation = (value: string): number => {
  const [num] = value.split("e");
  return Number(num);
};

export const getFee = (value: bigint) => (value * 623n) / 10000n;
export const FEE_TAKER_ADDRESS = "0xC0E1825be1eD2fBD3f67af161bb4a3Dfc642dF96";

export const VRGDA_PRICE_DECAY = parseWadSolidityNotation(
  getContractConfigValue("VRGDA_PRICE_DECAY")
);
export const VRGDA_UNITS_PER_INTERVAL = Number(
  getContractConfigValue("VRGDA_UNITS_PER_INTERVAL")
);
export const VRGDA_TARGET_PRICE = parseWadSolidityNotation(
  getContractConfigValue("VRGDA_TARGET_PRICE")
);
export const BLOCKS_PER_INTERVAL = parseWadSolidityNotation(
  getContractConfigValue("BLOCKS_PER_INTERVAL")
);

export const INITIAL_CANVAS_DIM = Number(
  getContractConfigValue("INITIAL_CANVAS_DIM")
);
export const CANVAS_GROWTH_ROOT = parseWadSolidityNotation(
  getContractConfigValue("WAD_CANVAS_GROWTH_ROOT")
);

export const START_SELECTION_COLOR = 0;
export const EMPTY_TILE_COLOR = 15;
export const ACTIVE_TILE_FLASH_ALPHA = 0.5;
export const ACTIVE_TILE_ANIMATION_DURATION = 800;
export const ACTIVE_TILE_ANIMATION_INTERVAL = 2300;
export const ACTIVE_TILE_SCALE_FACTOR = 1.3;
