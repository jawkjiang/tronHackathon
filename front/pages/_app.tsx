import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider,createConfig } from 'wagmi';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider,lightTheme } from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { tokenPocketWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { type Chain } from 'viem';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [tokenPocketWallet],
    },
  ],
  {
    appName: 'METANA Demo',
    projectId: 'b5d29a1bace1df5035eae390ca5d89d6',
  }
);

//TODO，tron网络
export const shastaTestnet = {
  id: 2494104990,
  name: 'Shasta Testnet',
  network: 'shasta',
  nativeCurrency: {
    name: 'TRON',
    symbol: 'TRX',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://api.shasta.trongrid.io/jsonrpc'],
    },
    public: {
      http: ['https://api.shasta.trongrid.io/jsonrpc'],
    },
  },
  testnet: true,
} as const satisfies Chain;


const config = createConfig({
  connectors,
  chains: [
    shastaTestnet,
    // mainnet,
  ],
  ssr: true
});


const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps<{ session: Session}>) {
  console.log('pageProps:::',pageProps)
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider 
          theme={lightTheme({
            accentColor: '#F6BE44',
          })}
          locale="en-US"
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
