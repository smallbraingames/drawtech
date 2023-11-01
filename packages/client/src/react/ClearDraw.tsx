import { useComponentValue } from "@latticexyz/react";
import { Has, removeComponent, runQuery } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { LuTrash } from "react-icons/lu";

import ControlState from "../game/controlState";
import ClickSound from "./ClickSound";
import { useGameComponents } from "./context/GameProvider";

const ClearDraw = () => {
  const { Drawing, ControlState: ControlStateComponent } = useGameComponents();
  const controlState = useComponentValue(
    ControlStateComponent,
    singletonEntity,
    { value: ControlState.DRAW }
  ).value;

  if (
    controlState !== ControlState.DRAW &&
    controlState !== ControlState.ERASE
  ) {
    return <></>;
  }

  const clearDraw = async () => {
    const drawEntities = runQuery([Has(Drawing)]);
    drawEntities.forEach((entity) => {
      removeComponent(Drawing, entity);
    });
  };

  return (
    <ClickSound>
      <div
        className="flex items-center justify-center h-9 w-9 rounded-sm border border-r-2 border-b-4 border-red-800 text-red-800 bg-red-300 active:border"
        onClick={clearDraw}
      >
        <LuTrash className="text-2xl h-6 w-6" />
      </div>
    </ClickSound>
  );
};

export default ClearDraw;
