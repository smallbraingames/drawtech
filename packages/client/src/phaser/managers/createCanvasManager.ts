import { Entity } from "@latticexyz/recs";
import {
  LazyGameObjectManager,
  awaitTween,
  getCenterPixelCoord,
  removeTweens,
} from "@smallbraingames/small-phaser";
import Phaser from "phaser";

import {
  ACTIVE_TILE_ANIMATION_DURATION,
  ACTIVE_TILE_ANIMATION_INTERVAL,
  ACTIVE_TILE_FLASH_ALPHA,
  ACTIVE_TILE_SCALE_FACTOR,
  EMPTY_TILE_COLOR,
} from "../../game/config";
import ControlState from "../../game/controlState";
import Coord from "../../game/coord";
import { GameComponents } from "../../game/gameManager";
import getCoordsIterator from "../../game/getCoordsIterator";
import { TILE_SIZE } from "../config";
import getColor from "../getColor";
import getPriceHexColor from "../getPriceColor";

const GENERATOR_KEY = "canvas";
const EMPTY_COORD_FLAG = -1;
const EMPTY_COORD_TILE_SIZE = TILE_SIZE;

export type CanvasManager = ReturnType<typeof createCanvasManager>;

const getPriceColor = (
  priceWei: number,
  minPriceWei: number,
  maxPriceWei: number
): number => {
  return Phaser.Display.Color.HexStringToColor(
    getPriceHexColor(priceWei, minPriceWei, maxPriceWei)
  ).color;
};

const createCanvasManager = (
  lazyGameObjectManager: LazyGameObjectManager,
  getCoordEntity: GameComponents["getCoordEntity"],
  getEntityCoord: GameComponents["getEntityCoord"]
) => {
  const canvas = new Map<Entity, number>();
  const draw = new Map<Entity, number>();
  let minPrice = Number.MAX_VALUE;
  let maxPrice = 0;
  const prices = new Map<Entity, number>();
  let controlState: ControlState = ControlState.DRAW;
  let canvasDim = 0;
  let hovered: Entity | undefined;
  let drawFlashInterval: NodeJS.Timeout | undefined;

  const setDraw = (coordEntity: Entity, color: number) => {
    const wasDrawing = _isDrawing();
    draw.set(coordEntity, color);
    _setCoord(coordEntity);
    if (!wasDrawing) lazyGameObjectManager.refresh();
    if (!drawFlashInterval) {
      drawFlashInterval = setInterval(
        _flashDrawUnits,
        ACTIVE_TILE_ANIMATION_INTERVAL
      );
    }
    const gameObject = lazyGameObjectManager.getGameObject(
      getEntityCoord(coordEntity),
      {
        generatorKey: GENERATOR_KEY,
        gameObjectKey: coordEntity,
      }
    );
    gameObject && _beat(gameObject.gameObject as Phaser.GameObjects.Rectangle);
  };

  const setHovered = (coordEntity: Entity | undefined) => {
    const prevEntity = hovered;
    if (prevEntity === coordEntity) return;
    hovered = coordEntity;
    if (controlState === ControlState.DRAW) return;
    if (prevEntity !== undefined) {
      const gameObject: Phaser.GameObjects.Rectangle | undefined =
        lazyGameObjectManager.getGameObject(getEntityCoord(prevEntity), {
          generatorKey: GENERATOR_KEY,
          gameObjectKey: prevEntity,
        })?.gameObject as Phaser.GameObjects.Rectangle | undefined;
      gameObject?.setDepth(0);
      if (gameObject) {
        removeTweens(gameObject).then(() => {
          awaitTween({
            targets: gameObject,
            scaleX: 1,
            scaleY: 1,
            yoyo: false,
            duration: ACTIVE_TILE_ANIMATION_DURATION / 2,
            ease: Phaser.Math.Easing.Sine.InOut,
          }).then(() => {
            gameObject?.setScale(1);
          });
        });
      }
    }
    if (coordEntity !== undefined) {
      const gameObject: Phaser.GameObjects.Rectangle | undefined =
        lazyGameObjectManager.getGameObject(getEntityCoord(coordEntity), {
          generatorKey: GENERATOR_KEY,
          gameObjectKey: coordEntity,
        })?.gameObject as Phaser.GameObjects.Rectangle | undefined;
      gameObject?.setDepth(2);
      gameObject &&
        awaitTween({
          targets: gameObject,
          scaleX: ACTIVE_TILE_SCALE_FACTOR * 2,
          scaleY: ACTIVE_TILE_SCALE_FACTOR * 2,
          yoyo: false,
          duration: ACTIVE_TILE_ANIMATION_DURATION / 2,
          ease: Phaser.Math.Easing.Sine.InOut,
        });
    }
  };

  const clearDraw = (coordEntity: Entity) => {
    const wasDrawing = _isDrawing();
    draw.delete(coordEntity);
    lazyGameObjectManager.refreshCoord(getEntityCoord(coordEntity));
    if (wasDrawing && !_isDrawing()) {
      lazyGameObjectManager.refresh();
      if (!drawFlashInterval) return;
      clearInterval(drawFlashInterval);
      drawFlashInterval = undefined;
    }
  };

  const setCanvas = (coordEntity: Entity, color: number) => {
    canvas.set(coordEntity, color);
    _setCoord(coordEntity);
  };

  const setControlState = (_controlState: ControlState) => {
    controlState = _controlState;
    lazyGameObjectManager.refresh();
  };

  const setPrice = (coordEntity: Entity, price: number) => {
    prices.set(coordEntity, price);
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);
    _setCoord(coordEntity);
  };

  const _setCoord = (coordEntity: Entity) => {
    const coord = getEntityCoord(coordEntity);
    const gameObjectInfo = {
      generatorKey: GENERATOR_KEY,
      gameObjectKey: coordEntity,
    };
    if (
      !lazyGameObjectManager.hasInfo(coord, {
        generatorKey: GENERATOR_KEY,
        gameObjectKey: coordEntity,
      })
    ) {
      console.warn("[Canvas Manager] Has no info at coord", coordEntity);
      lazyGameObjectManager.addGameObject(coord, gameObjectInfo);
    } else {
      lazyGameObjectManager.refreshCoord(coord);
    }
  };

  const setCanvasDim = (_canvasDim: number) => {
    canvasDim = _canvasDim;
    for (const coord of getCoordsIterator(canvasDim)()) {
      const coordEntity = getCoordEntity(coord);
      const isEmptyCoord = !canvas.has(coordEntity);
      if (isEmptyCoord) {
        lazyGameObjectManager.addGameObject(coord, {
          generatorKey: GENERATOR_KEY,
          gameObjectKey: coordEntity,
        });
      }
    }
  };

  const _isDrawing = () => {
    return draw.size > 0;
  };

  const _flashIfNotAnimating = async (
    gameObject: Phaser.GameObjects.Rectangle
  ) => {
    const tweenManager = gameObject.scene.tweens;
    for (const tween of tweenManager.tweens) {
      if (tween.hasTarget(gameObject)) {
        return;
      }
    }
    await awaitTween({
      targets: gameObject,
      alpha: ACTIVE_TILE_FLASH_ALPHA,
      duration: ACTIVE_TILE_ANIMATION_DURATION,
      ease: Phaser.Math.Easing.Sine.InOut,
      yoyo: true,
    });
    gameObject.setAlpha(1);
  };

  const _beat = async (gameObject: Phaser.GameObjects.Rectangle) => {
    await awaitTween({
      targets: gameObject,
      scaleX: ACTIVE_TILE_SCALE_FACTOR,
      scaleY: ACTIVE_TILE_SCALE_FACTOR,
      yoyo: true,
      duration: ACTIVE_TILE_ANIMATION_DURATION / 3,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
    gameObject.setScale(1);
  };

  const _flashDrawUnits = () => {
    for (const coordEntity of draw.keys()) {
      const gameObject = lazyGameObjectManager.getGameObject(
        getEntityCoord(coordEntity),
        {
          generatorKey: GENERATOR_KEY,
          gameObjectKey: coordEntity,
        }
      );
      if (gameObject)
        _flashIfNotAnimating(
          gameObject.gameObject as Phaser.GameObjects.Rectangle
        );
    }
  };

  const generateUnit = (
    coord: Coord,
    group: Phaser.GameObjects.Group,
    key: string
  ) => {
    const entity = key as Entity;
    const drawEntity = draw.get(entity);
    const info = drawEntity ?? canvas.get(entity) ?? EMPTY_COORD_FLAG;
    const pixelCoord = getCenterPixelCoord(coord, TILE_SIZE, TILE_SIZE);
    const gameObject: Phaser.GameObjects.Rectangle = group.get(
      pixelCoord.x,
      pixelCoord.y
    );
    let color = getColor(info === EMPTY_COORD_FLAG ? EMPTY_TILE_COLOR : info);
    if (controlState === ControlState.PRICE) {
      const price = prices.get(entity);
      if (price !== undefined) {
        color = getPriceColor(price, minPrice, maxPrice);
      }
    }
    const size = info === EMPTY_COORD_FLAG ? EMPTY_COORD_TILE_SIZE : TILE_SIZE;
    const depth = drawEntity !== undefined ? 1 : 0;

    gameObject.width = size;
    gameObject.height = size;
    return gameObject
      .setOrigin()
      .setPosition(pixelCoord.x, pixelCoord.y)
      .setFillStyle(color)
      .setDepth(depth)
      .setAlpha(1)
      .setActive(true)
      .setVisible(true);
  };

  lazyGameObjectManager.registerGameObjectGenerator(
    GENERATOR_KEY,
    generateUnit,
    Phaser.GameObjects.Rectangle
  );

  return {
    clearDraw,
    setCanvasDim,
    setCanvas,
    setDraw,
    setPrice,
    setControlState,
    setHovered,
  };
};

export default createCanvasManager;
