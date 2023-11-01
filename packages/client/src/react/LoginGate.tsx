import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { zeroAddress } from "viem";
import { useBalance } from "wagmi";

import getNetworkConfig from "../network/getNetworkConfig";
import Game from "./Game";
import GetEth from "./GetEth";
import Loading from "./Loading";
import Login from "./Login";
import { useGameComponents } from "./context/GameProvider";

const LoginGate = () => {
  const { ready, user } = usePrivy();
  const { InitialSyncComplete } = useGameComponents();

  const address = user?.wallet?.address as `0x${string}` | undefined;
  const {
    data,
    isLoading: isBalanceLoading,
    refetch,
  } = useBalance({
    address: address ?? zeroAddress,
    chainId: getNetworkConfig().chainId,
  });

  const balance = data?.value;
  const initialSyncComplete = useComponentValue(
    InitialSyncComplete,
    singletonEntity,
    { value: false }
  ).value;

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!ready || isBalanceLoading) {
    return <Loading fillColor="yellow" fullScreen={true} />;
  }

  if (!address) {
    return (
      <div className="absolute top-0 left-0 h-screen w-screen bg-stone-100">
        <Login />
      </div>
    );
  }
  if (!balance) {
    return (
      <div className="absolute top-0 left-0 h-screen w-screen bg-stone-100">
        <GetEth address={address} />
      </div>
    );
  }

  if (!initialSyncComplete) {
    return <Loading fillColor="yellow" fullScreen={true} />;
  }
  console.log("[Login Gate] Wallet connected, rendering game", address);
  return <Game />;
};

export default LoginGate;
