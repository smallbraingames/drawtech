import { useComponentValue } from "@latticexyz/react";
import { setComponent } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";

import { START_SELECTION_COLOR } from "../game/config";
import ControlState from "../game/controlState";
import ClickSound from "./ClickSound";
import { useGameComponents } from "./context/GameProvider";
import getHexColor from "./getHexColor";

const colors = Array.from(Array.from(Array(256).keys()));

const COLOR_PICKER_CLASS = "color-picker";

const ColorSelect = () => {
  const { ControlState: ControlStateComponent, SelectedColor } =
    useGameComponents();
  const controlState = useComponentValue(
    ControlStateComponent,
    singletonEntity,
    { value: ControlState.DRAW }
  ).value;
  const selectedColor = useComponentValue(SelectedColor, singletonEntity, {
    value: START_SELECTION_COLOR,
  }).value;
  const [menu, setMenu] = useState(false);
  const hexColor = getHexColor(selectedColor);

  const menuBind = useDrag(({ xy: [x, y], swipe: [, swipeY] }) => {
    if (swipeY === 1) {
      setMenu(false);
      return;
    }
    if (menu) {
      const element = document.elementFromPoint(x, y);
      const classes = element?.classList.contains(COLOR_PICKER_CLASS);
      if (!classes) return;
      const color = element?.id;
      if (color === undefined) return;
      setComponent(SelectedColor, singletonEntity, { value: Number(color) });
    }
  });

  const gameBind = useDrag(
    () => {
      setMenu(false);
    },
    { preventDefault: true }
  );

  if (
    controlState !== ControlState.DRAW &&
    controlState !== ControlState.ERASE
  ) {
    return <></>;
  }

  return (
    <div>
      <div
        {...gameBind()}
        className={`${
          menu
            ? "touch-none absolute top-0 left-0 backdrop-blur-sm h-screen w-screen"
            : ""
        }`}
      />
      <div
        {...menuBind()}
        className={`touch-none absolute bottom-0 left-0 w-screen bg-stone-800 ${
          menu ? "max-h-[100vh] w-screen h-fit" : "max-h-0 overflow-hidden"
        } transition transition-all duration-300 ease-in-out z-10`}
      >
        <div className="px-4 pt-4 pb-7 select-none">
          <div className="mb-2 flex items-center">
            <h1 className="text-lg tracking-tight text-stone-100 font-bold">
              COLORS
            </h1>
            <div className="flex-grow" />
            <div
              className="h-6 w-6"
              style={{ backgroundColor: getHexColor(selectedColor) }}
            />
          </div>
          <div className="overflow-hidden flex flex-wrap select-none">
            {colors.map((color) => (
              <div
                key={color}
                id={color.toString()}
                className={`${COLOR_PICKER_CLASS} w-[6.25%] ${
                  selectedColor === color
                    ? "border border-stone-900 border-2"
                    : ""
                }`}
                style={{
                  backgroundColor: getHexColor(color),
                  aspectRatio: 1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <ClickSound>
        <div
          id="color-wheel"
          onClick={() => {
            setMenu(!menu);
            setComponent(ControlStateComponent, singletonEntity, {
              value: ControlState.DRAW,
            });
          }}
          className={`p-1 rounded-sm transition transition-all ${
            controlState === ControlState.ERASE ? "opacity-50" : "opacity-100"
          }`}
        >
          <div
            className="h-7 w-7 rounded-sm"
            style={{ backgroundColor: hexColor }}
          />
        </div>
      </ClickSound>
    </div>
  );
};

export default ColorSelect;
