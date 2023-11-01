import { useEffect } from "react";
import { FaEthereum } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";
import { Address, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import logo from "../../public/assets/logo.png";
import getNetworkConfig from "../network/getNetworkConfig";
import truncateString from "./truncateString";

const GetEth = ({ address }: { address: Address }) => {
  // Just for playtest
  // useEffect(() => {
  //   // Anvil private key
  //   const account = privateKeyToAccount(
  //     "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  //   );
  //   const walletClient = createWalletClient({
  //     account,
  //     chain: getNetworkConfig().chain,
  //     transport: http(),
  //   });
  //   walletClient.sendTransaction({
  //     account,
  //     chain: getNetworkConfig().chain,
  //     to: address,
  //     value: parseEther("1"),
  //   });
  // }, []);

  return (
    <div className="flex flex-col gap-4 w-full h-full items-center justify-center tracking-tight">
      <div className="w-72 flex flex-col gap-12">
        <div>
          <div className="flex gap-1 tracking-tight items-center">
            <div className="w-20 h-20">
              <img src={logo} className="object-fit" />
            </div>
            <div className="w-20 h-20 text-yellow-800">
              <FaEthereum className="text-7xl" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Get some ETH on Base</h1>
          <p className="text-sm">
            You'll use ETH, the official currency of Base, to buy tiles and earn
            rewards
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xl">Receive ETH on Base</div>
          <div className="p-4 bg-stone-200 rounded-sm">
            <div className="flex gap-1 justify-between items-center">
              <div>
                <div>Copy Address</div>
                <div className="text-sm">{truncateString(address, 30)}</div>
              </div>
              <div
                className="active:text-stone-600"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                }}
              >
                <LuCopy className="text-3xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm">
          Once there is ETH in your wallet, you'll get started with the rest of
          the app. We recommend at least 0.01 ETH.
        </div>

        {/* <div className="text-lg font-bold p-3 bg-yellow-00">
          PLAYTEST: YOU ARE BEING AIRDROPPED 1 ETH HOLD TIGHT USE IT WISELY
        </div> */}
      </div>
    </div>
  );
};

export default GetEth;
