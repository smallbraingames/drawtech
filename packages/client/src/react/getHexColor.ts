import getColor from "../phaser/getColor";

const getHexColor = (color: number): string => {
  const { r, g, b } = Phaser.Display.Color.ColorToRGBA(getColor(color));
  const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};
export default getHexColor;
