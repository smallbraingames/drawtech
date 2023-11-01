// Need no-explicit-any because of rex-gestures

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Entity,
  defineComponentSystem,
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { pixelCoordToTileCoord } from "@smallbraingames/small-phaser";
import Pan from "phaser3-rex-plugins/plugins/input/gestures/pan/Pan";
import Press from "phaser3-rex-plugins/plugins/input/gestures/press/Press";
import Tap from "phaser3-rex-plugins/plugins/input/gestures/tap/Tap";

import ControlState from "../../game/controlState";
import Coord from "../../game/coord";
import { GameComponents } from "../../game/gameManager";
import getCanvasDim from "../../game/getCanvasDim";
import sampler from "../../game/sampler";
import world from "../../network/world";
import {
  NOTE_SEQUENCE,
  NOTE_SEQUENCE_NUM_OCTAVES,
  NOTE_SEQUENCE_STARTING_OCTAVE,
  TAP_INTERVAL,
  TILE_SIZE,
} from "../config";
import { Phaser as PhaserEngine } from "../createPhaser";
import { CanvasManager } from "../managers/createCanvasManager";

const createDrawSystem = (
  phaser: PhaserEngine,
  gameComponents: GameComponents,
  canvasManager: CanvasManager
) => {
  const { scene } = phaser;
  const {
    getCoordEntity,
    ControlState: ControlStateComponent,
    Drawing,
    Period,
    Selected,
    SelectedColor,
  } = gameComponents;
  const { input } = scene;

  const getNotPanning = () => {
    const activePointers = input.manager.pointers.filter((p) => p.isDown);
    return activePointers.length <= 1;
  };

  const getDim = () => {
    const period = getComponentValue(Period, singletonEntity)?.value;
    if (period === undefined) return undefined;
    const dim = getCanvasDim(period);
    return dim;
  };

  const getIsInDim = (coord: Coord): boolean => {
    const dim = getDim();
    if (dim === undefined) return false;
    const halfDim = Math.floor(dim / 2);
    return (
      coord.x >= -halfDim &&
      coord.x <= halfDim &&
      coord.y >= -halfDim &&
      coord.y <= halfDim
    );
  };

  const processTap = (pixelCoord: Coord) => {
    if (!getNotPanning()) return;
    const coord = pixelCoordToTileCoord(pixelCoord, TILE_SIZE, TILE_SIZE);
    if (!getIsInDim(coord)) return;
    const coordEntity = getCoordEntity(coord);
    const controlState = getComponentValue(
      ControlStateComponent,
      singletonEntity
    )?.value;

    setComponent(Selected, singletonEntity, { value: coordEntity });

    const color = getComponentValue(SelectedColor, singletonEntity)?.value;
    if (color === undefined) return;

    if (controlState === ControlState.DRAW) {
      getComponentValue(Drawing, coordEntity)?.value !== color &&
        setComponent(Drawing, coordEntity, { value: color });
    } else if (controlState === ControlState.ERASE)
      removeComponent(Drawing, coordEntity);
  };

  const pan: Pan = (scene as any).rexGestures.add.pan();
  pan.on("pan", ({ worldX, worldY }: { worldX: number; worldY: number }) => {
    processTap({ x: worldX, y: worldY });
  });

  const tap: Tap = (scene as any).rexGestures.add.tap({
    tapInterval: TAP_INTERVAL,
  });
  tap.on(
    "tap",
    ({
      worldX,
      worldY,
    }: {
      worldX: number;
      worldY: number;
      isTapped: boolean;
    }) => {
      processTap({ x: worldX, y: worldY });
      removeComponent(Selected, singletonEntity);
    }
  );

  const press: Press = (scene as any).rexGestures.add.press();
  press.on(
    "pressstart",
    ({ worldX, worldY }: { worldX: number; worldY: number }) => {
      processTap({ x: worldX, y: worldY });
    }
  );
  press.on(
    "pressend",
    ({ lastPointer }: { lastPointer: Phaser.Input.Pointer }) => {
      if (!lastPointer.isDown) removeComponent(Selected, singletonEntity);
    }
  );

  input.on(Phaser.Input.Events.POINTER_UP, () => {
    removeComponent(Selected, singletonEntity);
  });

  const playDrawSequenceSound = (sequenceNum: number) => {
    const isReverse =
      Math.floor(
        sequenceNum / (NOTE_SEQUENCE.length * NOTE_SEQUENCE_NUM_OCTAVES)
      ) %
        2 ==
      1;
    const noteIndex = sequenceNum % NOTE_SEQUENCE.length;
    const note = !isReverse
      ? NOTE_SEQUENCE[noteIndex]
      : NOTE_SEQUENCE[NOTE_SEQUENCE.length - noteIndex - 1];

    const noteOctaveRegular =
      Math.floor(sequenceNum / NOTE_SEQUENCE.length) %
      NOTE_SEQUENCE_NUM_OCTAVES;

    const noteOctave = !isReverse
      ? noteOctaveRegular + NOTE_SEQUENCE_STARTING_OCTAVE
      : NOTE_SEQUENCE_STARTING_OCTAVE +
        NOTE_SEQUENCE_NUM_OCTAVES -
        noteOctaveRegular;
    sampler.triggerAttackRelease(`${note}${noteOctave}`, TAP_INTERVAL);
  };

  let seqNum = 1;
  defineComponentSystem(world, Drawing, (update) => {
    const { entity, value } = update;
    const color = value[0]?.value;
    if (color === undefined) {
      canvasManager.clearDraw(entity);
      return;
    }
    canvasManager.setDraw(entity, color);
    playDrawSequenceSound(seqNum);
    seqNum++;
  });

  defineComponentSystem(world, Selected, (update) => {
    const { value } = update;
    if (value[0]?.value === undefined) seqNum = 0;
    canvasManager.setHovered(value[0]?.value as Entity | undefined);
  });
};

export default createDrawSystem;
