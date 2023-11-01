import {
  getComponentEntities,
  getComponentValueStrict,
} from "@latticexyz/recs";

import { GameComponents } from "./gameManager";
import { Unit } from "./unit";

const getMove = (gameComponents: GameComponents): Unit[] => {
  const { getEntityCoord, Drawing } = gameComponents;
  const entites = getComponentEntities(Drawing);
  return [...entites].map((entity) => {
    const coord = getEntityCoord(entity);
    return { coord, color: getComponentValueStrict(Drawing, entity).value };
  });
};

export default getMove;
