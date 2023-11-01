import { ReactNode, createContext, useContext } from "react";

const PWAContext = createContext<boolean>(false);

type Props = {
  children: ReactNode;
  value: boolean;
};

export const PWAProvider = ({ children, value }: Props) => {
  const currentValue = useContext(PWAContext);
  if (currentValue)
    throw new Error("[PWA Provider] Provider can only be used once");
  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const useIsPWA = () => {
  const value = useContext(PWAContext);
  if (value === undefined)
    throw new Error("[Use Is PWA] Must be used within a PWAProvider");
  return value;
};
