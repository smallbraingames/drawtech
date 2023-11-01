import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";

import ControlState from "../game/controlState";
import ArtistInfo from "./ArtistInfo";
import MakeMove from "./MakeMove";
import Price from "./Price";
import { useGameComponents } from "./context/GameProvider";

const ControlPanel = () => {
  const { ControlState: ControlStateComponent } = useGameComponents();

  const controlState = useComponentValue(
    ControlStateComponent,
    singletonEntity,
    { value: ControlState.DRAW }
  ).value;

  return (
    <div>
      {(controlState === ControlState.DRAW ||
        controlState === ControlState.ERASE) && <MakeMove />}
      {controlState === ControlState.PRICE && <Price />}
      {controlState === ControlState.INSPECT && <ArtistInfo />}
    </div>
  );
};

export default ControlPanel;
