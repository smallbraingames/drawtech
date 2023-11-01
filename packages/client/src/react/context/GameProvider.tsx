import { createContext, ReactNode, useContext } from "react";
import { GameApi, GameComponents } from "../../game/gameManager";

const GameContext = createContext<
  { gameComponents: GameComponents; api: GameApi } | undefined
>(undefined);

type Props = {
  children: ReactNode;
  gameComponents: GameComponents;
  api: GameApi;
};

export const GameProvider = ({ children, gameComponents, api }: Props) => {
  const currentValue = useContext(GameContext);
  if (currentValue)
    throw new Error(
      "[Game Components Provider] Provider can only be used once"
    );
  return (
    <GameContext.Provider value={{ gameComponents, api }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameComponents = () => {
  const value = useContext(GameContext);
  if (!value)
    throw new Error(
      "[Use Game Components] Must be used within a GameComponentsProvider"
    );
  return value.gameComponents;
};

export const useGameApi = () => {
  const value = useContext(GameContext);
  if (!value)
    throw new Error(
      "[Use Game Api] Must be used within a GameComponentsProvider"
    );
  return value.api;
};
