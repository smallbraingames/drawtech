import { useComponentValue } from "@latticexyz/react";
import { setComponent } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { LuBrush, LuSmile, LuTag } from "react-icons/lu";

import ControlState from "../game/controlState";
import ClickSound from "./ClickSound";
import { useGameComponents } from "./context/GameProvider";

const CONTROL_BUTTON =
  "flex items-center justify-center h-9 w-9 rounded-sm transition transition-all";
const ACTIVE = "text-stone-100 bg-stone-800";
const INACTIVE =
  "text-stone-800 bg-stone-100 border border-1 border-stone-800 border-r-2 border-b-4";
const Controls = () => {
  const { ControlState: ControlStateComponent } = useGameComponents();

  const controlState = useComponentValue(
    ControlStateComponent,
    singletonEntity,
    { value: ControlState.DRAW }
  ).value;

  return (
    <div className="flex gap-1">
      <ClickSound>
        <div
          className={`${CONTROL_BUTTON} ${
            controlState === ControlState.INSPECT ? ACTIVE : INACTIVE
          }`}
          onClick={() =>
            setComponent(ControlStateComponent, singletonEntity, {
              value: ControlState.INSPECT,
            })
          }
        >
          <LuSmile className="text-2xl h-6 w-6" />
        </div>
      </ClickSound>
      <ClickSound>
        <div
          className={`${CONTROL_BUTTON} ${
            controlState === ControlState.PRICE ? ACTIVE : INACTIVE
          }`}
          onClick={() =>
            setComponent(ControlStateComponent, singletonEntity, {
              value: ControlState.PRICE,
            })
          }
        >
          <LuTag className="text-2xl h-6 w-6" />
        </div>
      </ClickSound>
      <ClickSound>
        <div
          className={`${CONTROL_BUTTON} ${
            controlState === ControlState.DRAW ||
            controlState === ControlState.ERASE
              ? ACTIVE
              : INACTIVE
          }`}
          onClick={() =>
            setComponent(ControlStateComponent, singletonEntity, {
              value: ControlState.DRAW,
            })
          }
        >
          <LuBrush className="text-2xl h-6 w-6" />
        </div>
      </ClickSound>
    </div>
  );
};

export default Controls;
