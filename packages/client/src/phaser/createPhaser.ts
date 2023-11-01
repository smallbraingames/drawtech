import {
  createPhaserGame,
  createPhaserScene,
  resizePhaserGame,
} from "@smallbraingames/small-phaser";
import GesturesPlugin from "phaser3-rex-plugins/plugins/gestures-plugin.js";

import sampler from "../game/sampler";
import { MAX_ZOOM, MIN_ZOOM } from "./config";
import createCamera from "./createCamera";

export type Phaser = Awaited<ReturnType<typeof createPhaser>>;

const createPhaser = async (parentId: string, sceneKey: string) => {
  console.log("[Create Phaser] Creating Phaser scene");

  const sceneConfig = createPhaserScene({
    key: "main",
  });

  const pixelRatio = window.devicePixelRatio;
  const width = window.innerWidth * pixelRatio;
  const height = window.innerHeight * pixelRatio;
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    backgroundColor: "#e7e5e4",
    width,
    height,
    roundPixels: true,
    parent: parentId,
    scale: {
      mode: Phaser.Scale.NONE,
      zoom: 1 / pixelRatio,
    },
    plugins: {
      scene: [
        {
          key: "rexGestures",
          plugin: GesturesPlugin,
          mapping: "rexGestures",
        },
      ],
    },
    input: {
      smoothFactor: 1,
    },
    audio: {
      context: sampler.context.rawContext as AudioContext,
    },
    scene: [sceneConfig],
  };

  const phaserGame = await createPhaserGame(config);
  console.log("[Create Phaser] Phaser game created");
  resizePhaserGame(phaserGame.game);
  const scene = phaserGame.scenes[sceneKey];
  const camera = createCamera(scene.cameras.main, MIN_ZOOM, MAX_ZOOM);
  camera.phaserCamera.setScroll(-width / 2, -height / 2);
  return { scene, camera };
};

export default createPhaser;
