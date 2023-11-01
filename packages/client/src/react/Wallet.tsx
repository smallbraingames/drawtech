import { useComponentValue } from "@latticexyz/react";
import { updateComponent } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { usePrivy } from "@privy-io/react-auth";
import { ChangeEvent, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { LuCopy, LuDollarSign } from "react-icons/lu";
import { formatEther, zeroAddress } from "viem";
import { useBalance } from "wagmi";

import Value from "../game/Value";
import getNetworkConfig from "../network/getNetworkConfig";
import ClickSound from "./ClickSound";
import { useGameApi, useGameComponents } from "./context/GameProvider";
import truncateString from "./truncateString";

const ACTIVE_CLASS = "text-stone-100 bg-stone-800 border-2 border-stone-800";
const INACTIVE_CLASS =
  "text-stone-800 bg-stone-100 border border-1 border-stone-800 border-r-2 border-b-4 drop-shadow-md";

const Wallet = () => {
  const { user, exportWallet, logout } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;
  const { Name, Settings, getArtistEntity } = useGameComponents();
  const { setName } = useGameApi();

  const displayUnitsUSD =
    useComponentValue(Settings, singletonEntity)?.displayUnitsUSD ?? true;

  const { data } = useBalance({
    address,
    chainId: getNetworkConfig().chainId,
  });
  const balance = Number(formatEther(data?.value ?? 0n));

  const artistEntity = getArtistEntity(address ?? zeroAddress);
  const name = useComponentValue(Name, artistEntity, {
    value: address ?? zeroAddress,
  }).value;

  const [nameInput, setNameInput] = useState("");

  const isNameInputValid = (name: string) => {
    if (name.length > 32) return false;
    if (name.match(/[^a-zA-Z0-9]/)) return false;
    return true;
  };

  return (
    <div className="bg-stone-100 h-full rounded-sm p-4 tracking-tight flex flex-col gap-8 text-stone-800">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold text-center">NAME</div>
        <div>
          <input
            className="px-2 py-1 focus:outline-none rounded-sm"
            type="text"
            value={nameInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              isNameInputValid(e.target.value) && setNameInput(e.target.value)
            }
            placeholder={name.toUpperCase()}
          />
        </div>

        <ClickSound enabled={nameInput.length > 0}>
          <button
            onClick={() => {
              if (nameInput.length === 0) return;
              setName(nameInput);
              setNameInput("");
            }}
            className={`w-full p-1 rounded-sm font-bold ${
              nameInput.length > 0
                ? "bg-green-400 text-green-800 border border-b-4 border-r-2 border-green-800 p-1 active:border"
                : "bg-stone-300 text-stone-200"
            }`}
          >
            CHANGE NAME
          </button>
        </ClickSound>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold text-center">UNITS</div>
        <div className="flex gap-2 items-center w-full justify-center mt-2 text-xs">
          <ClickSound>
            <div
              className={`flex gap-1 p-2 items-center rounded-sm transition transition-all ${
                displayUnitsUSD ? ACTIVE_CLASS : INACTIVE_CLASS
              }`}
              onClick={() => {
                updateComponent(Settings, singletonEntity, {
                  displayUnitsUSD: true,
                });
              }}
            >
              <LuDollarSign className="text-xl h-4 w-4" />
              <p className="tracking-tight">USD</p>
            </div>
          </ClickSound>
          <ClickSound>
            <div
              className={`flex gap-1 p-2 items-center rounded-sm transition transition-all ${
                !displayUnitsUSD ? ACTIVE_CLASS : INACTIVE_CLASS
              }`}
              onClick={() => {
                updateComponent(Settings, singletonEntity, {
                  displayUnitsUSD: false,
                });
              }}
            >
              <FaEthereum className="text-xl h-4 w-4" />
              <p className="tracking-tight">ETH</p>
            </div>
          </ClickSound>
        </div>
      </div>

      <div className="flex flex-col gap-2 justify-">
        <div className="text-lg font-bold text-center">WALLET</div>
        {balance !== undefined && (
          <div className="flex items-center">
            <Value price={balance} digits={10} />
          </div>
        )}

        {address !== undefined && (
          <ClickSound>
            <div className="p-2 bg-stone-200 rounded-sm flex gap-1 items-center justify-between">
              <div>{truncateString(address, 21)}</div>
              <div
                className="active:text-stone-600"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                }}
              >
                <LuCopy />
              </div>
            </div>
          </ClickSound>
        )}

        <ClickSound>
          <button
            onClick={() => exportWallet()}
            className="w-full p-1 rounded-sm font-bold bg-orange-400 text-orange-800 border border-b-4 border-r-2 border-orange-800 p-1 active:border"
          >
            EXPORT WALLET
          </button>
        </ClickSound>
        <ClickSound>
          <button
            onClick={() => logout()}
            className="w-full p-1 rounded-sm font-bold bg-red-400 text-red-800 border border-b-4 border-r-2 border-red-800 p-1 active:border"
          >
            LOG OUT
          </button>
        </ClickSound>
      </div>
    </div>
  );
};

export default Wallet;
