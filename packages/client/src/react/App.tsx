import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import getNetworkConfig from "../network/getNetworkConfig";
import LoginGate from "./LoginGate";
import NonPWAInfo from "./NonPWAInfo";
import { useIsPWA } from "./context/PWAContext";

const chain = getNetworkConfig().chain;
const configureChainsConfig = configureChains([chain], [publicProvider()]);

const App = () => {
  const isPWA = useIsPWA();

  if (!isPWA) {
    return <NonPWAInfo />;
  } else {
    return (
      <PrivyProvider
        appId={import.meta.env.VITE_PRIVY_APP_ID}
        config={{
          supportedChains: [chain],
        }}
      >
        <PrivyWagmiConnector wagmiChainsConfig={configureChainsConfig}>
          <LoginGate />
        </PrivyWagmiConnector>
      </PrivyProvider>
    );
  }
};

export default App;
