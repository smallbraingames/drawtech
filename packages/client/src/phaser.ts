import gameManager from "./game/gameManager";
import createPhaser from "./phaser/createPhaser";
import syncPhaser from "./phaser/syncPhaser";

const { gameComponents } = gameManager;

createPhaser("phaser", "main").then((phaser) =>
  syncPhaser(phaser, gameComponents)
);
