import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";
import { getBuilderDataSuffix } from "@/lib/builder";

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  baseAccount({ appName: "Game Development Sim" }),
  ...(wcId
    ? [
        walletConnect({
          projectId: wcId,
          showQrModal: true,
        }),
      ]
    : []),
];

const dataSuffix = getBuilderDataSuffix();

export const wagmiConfig = createConfig({
  chains: [base, mainnet],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ...(dataSuffix ? { dataSuffix } : {}),
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
