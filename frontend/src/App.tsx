import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import VotingApp from './VotingApp';

// Import wallet adapter CSS - this styles the wallet connection button
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const App: FC = () => {
  // Set network to devnet where your program is deployed
  const network = WalletAdapterNetwork.Devnet;

  // This creates the connection URL to Solana devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure which wallets users can connect with
  // We're using Phantom - the most popular Solana wallet
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    // ConnectionProvider connects your app to Solana blockchain
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider manages wallet connections */}
      <WalletProvider wallets={wallets} autoConnect>
        {/* WalletModalProvider gives users a nice UI to select wallets */}
        <WalletModalProvider>
          {/* Your actual voting application */}
          <VotingApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
