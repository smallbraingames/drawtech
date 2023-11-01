const CRYPTOCOMPARE_API_URL =
  "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD";

const getCryptocompareETHUSDExchangeRate = async (): Promise<number> => {
  return (await (await fetch(CRYPTOCOMPARE_API_URL)).json()).USD as number;
};

export default getCryptocompareETHUSDExchangeRate;
