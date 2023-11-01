import { useComponentValue } from "@latticexyz/react";
import { setComponent } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { LuEraser } from "react-icons/lu";

import ControlState from "../game/controlState";
import ClickSound from "./ClickSound";
import { useGameComponents } from "./context/GameProvider";

const ACTIVE_CLASS = "text-pink-300 bg-pink-800 border-1 border-pink-800";
const INACTIVE_CLASS =
  "text-pink-800 bg-pink-300 border border-1 border-r-2 border-b-4 border-pink-800";

const Eraser = () => {
  const { ControlState: ControlStateComponent } = useGameComponents();
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

  return (
    <ClickSound>
      <div
        className={`flex items-center justify-center h-9 w-9 rounded-sm transition transition-all ${
          controlState === ControlState.ERASE ? ACTIVE_CLASS : INACTIVE_CLASS
        }`}
        onClick={() =>
          setComponent(ControlStateComponent, singletonEntity, {
            value:
              controlState === ControlState.ERASE
                ? ControlState.DRAW
                : ControlState.ERASE,
          })
        }
      >
        <LuEraser className="text-2xl h-6 w-6" />
      </div>
    </ClickSound>
  );
};

export default Eraser;
