import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { FaEthereum } from "react-icons/fa";
import { LuDollarSign } from "react-icons/lu";

import { useGameComponents } from "../react/context/GameProvider";

const formatNumberWithTotalDigits = (
  number: number,
  totalDigits: number
): string => {
  const scaleFactor = 10 ** totalDigits;
  const formattedNumber = (
    Math.round(number * scaleFactor) / scaleFactor
  ).toString();
  return formattedNumber;
};

const Value = ({ price, digits }: { price: number; digits: number }) => {
  const { Settings } = useGameComponents();

  const { displayUnitsUSD, ethUSDExchangeRate } = useComponentValue(
    Settings,
    singletonEntity,
    {
      displayUnitsUSD: true,
      ethUSDExchangeRate: 1700,
    }
  );

  const priceUnits = displayUnitsUSD ? price * ethUSDExchangeRate : price;
  const priceTruncated = formatNumberWithTotalDigits(priceUnits, digits);

  return (
    <div className="rounded-sm flex items-center">
      <div>
        {displayUnitsUSD ? (
          <LuDollarSign className="text-stone-800" />
        ) : (
          <FaEthereum className="text-stone-800" />
        )}
      </div>
      <p className="font-mono">{priceTruncated}</p>
    </div>
  );
};

export default Value;
