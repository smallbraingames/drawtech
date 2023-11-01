import { defineComponentSystem, removeComponent } from "@latticexyz/recs";
import { throttleTime } from "rxjs";

import ControlState from "../../game/controlState";
import { GameComponents } from "../../game/gameManager";
import getCanvasDim from "../../game/getCanvasDim";
import sampler from "../../game/sampler";
import world from "../../network/world";
import { Phaser } from "../createPhaser";
import { CanvasManager } from "../managers/createCanvasManager";

const createCanvasSystem = (
  phaser: Phaser,
  gameComponents: GameComponents,
  canvasManager: CanvasManager
) => {
  const {
    Drawing,
    Color,
    Price,
    Period,
    ControlState: ControlStateComponent,
    InitialSyncComplete,
  } = gameComponents;

  const {
    camera: { phaserCamera },
  } = phaser;

  defineComponentSystem(world, Color, (update) => {
    const { entity, value } = update;
    const color = value[0]?.value;
    if (color === undefined) {
      console.warn("[Canvas System] Color changed, but no color found", update);
      return;
    }
    canvasManager.setCanvas(entity, color);
    removeComponent(Drawing, entity);
  });

  let initialSyncCompleteTime: number | undefined = undefined;
  defineComponentSystem(world, InitialSyncComplete, (update) => {
    const { value } = update;
    if (!value[0]?.value) return;
    initialSyncCompleteTime = Date.now();
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Color.update$.pipe(throttleTime(500)).subscribe(() => {
    if (initialSyncCompleteTime === undefined) return;
    const timeSinceInitialSyncComplete = Date.now() - initialSyncCompleteTime;
    if (timeSinceInitialSyncComplete < 5000) return;
    sampler.triggerAttackRelease(["D3", "F#3", "A3", "C#4"], 2000);
    phaserCamera.shake(100, 0.02);
  });

  defineComponentSystem(world, Price, (update) => {
    const { entity, value } = update;
    const price = value[0]?.value;
    price !== undefined && canvasManager.setPrice(entity, price);
  });

  defineComponentSystem(world, ControlStateComponent, (update) => {
    const { value } = update;
    const controlState = value[0]?.value as ControlState | undefined;
    if (controlState === undefined) return;
    if (value[0]?.value === value[1]?.value) return;
    canvasManager.setControlState(controlState);
  });

  defineComponentSystem(world, Period, (update) => {
    const { value } = update;
    const period = value[0]?.value;
    if (period === undefined) return;
    const dim = getCanvasDim(period);
    console.log(
      "[Canvas System] Period changed, updating dimension",
      period,
      dim
    );
    canvasManager.setCanvasDim(dim);
  });
};

export default createCanvasSystem;
