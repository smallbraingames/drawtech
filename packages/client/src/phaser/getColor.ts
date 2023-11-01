import Phaser from "phaser";

import palette from "../../public/assets/palette.json";

const colors = palette.map((line) => {
  return Phaser.Display.Color.HexStringToColor(line).color;
});

const getColor = (color: number): number => {
  return colors[color];
};

export default getColor;
