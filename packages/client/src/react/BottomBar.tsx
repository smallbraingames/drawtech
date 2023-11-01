import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";

import { START_SELECTION_COLOR } from "../game/config";
import ClearDraw from "./ClearDraw";
import ColorSelect from "./ColorSelect";
import Controls from "./Controls";
import Eraser from "./Eraser";
import { useGameComponents } from "./context/GameProvider";
import getHexColor from "./getHexColor";

const BottomBar = () => {
  const gameComponents = useGameComponents();
  const { SelectedColor } = gameComponents;

  const selectedColor = useComponentValue(SelectedColor, singletonEntity, {
    value: START_SELECTION_COLOR,
  }).value;
  const hexColor = getHexColor(selectedColor);

  return (
    <div
      className="flex flex-wrap mx-4 pb-7 gap-1"
      style={{ borderColor: hexColor }}
    >
      <div className="pointer-events-auto">
        <Controls />
      </div>
      <div className="grow" />
      <div className="pointer-events-auto">
        <ClearDraw />
      </div>
      <div className="pointer-events-auto">
        <Eraser />
      </div>
      <div className="pointer-events-auto">
        <ColorSelect />
      </div>
    </div>
  );
};

export default BottomBar;
