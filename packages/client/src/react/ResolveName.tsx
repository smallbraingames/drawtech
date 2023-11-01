import { useComponentValue } from "@latticexyz/react";
import { Address } from "viem";

import { useGameComponents } from "./context/GameProvider";
import truncateString from "./truncateString";

const ResolveName = ({
  address,
  maxLength,
}: {
  address: Address;
  maxLength: number;
}) => {
  const { Name, getArtistEntity } = useGameComponents();
  const artistEntity = getArtistEntity(address);
  const name = useComponentValue(Name, artistEntity, {
    value: address,
  }).value;

  return <p>{truncateString(name, maxLength).toUpperCase()}</p>;
};

export default ResolveName;
