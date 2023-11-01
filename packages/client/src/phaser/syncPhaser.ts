import { createLazyGameObjectManager } from "@smallbraingames/small-phaser";

import { GameComponents } from "../game/gameManager";
import { LAZY_BUFFER, LAZY_THROTTLE, TILE_SIZE } from "./config";
import { Phaser } from "./createPhaser";
import createCanvasManager from "./managers/createCanvasManager";
import createCanvasSystem from "./systems/createCanvasSystem";
import createDrawSystem from "./systems/createDrawSystem";
import createSanityCheckSystem from "./systems/createSanityCheckSystem";

const syncPhaser = (phaser: Phaser, gameComponents: GameComponents) => {
  const { scene, camera } = phaser;
  const { getCoordEntity, getEntityCoord } = gameComponents;
  console.log("[Sync Phaser] Syncing Phaser to game components");
  const lazyGameObjectManager = createLazyGameObjectManager(
    camera,
    scene,
    { tileWidth: TILE_SIZE, tileHeight: TILE_SIZE },
    LAZY_BUFFER,
    LAZY_THROTTLE
  );
  const canvasManager = createCanvasManager(
    lazyGameObjectManager,
    getCoordEntity,
    getEntityCoord
  );
  createCanvasSystem(phaser, gameComponents, canvasManager);
  createDrawSystem(phaser, gameComponents, canvasManager);
  createSanityCheckSystem(gameComponents);
  lazyGameObjectManager.initialize();
};

export default syncPhaser;
