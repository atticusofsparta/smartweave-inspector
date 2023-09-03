import { Button } from '@radix-ui/themes';

import { useGlobalState } from '../../services/state/contexts/GlobalState';
import { ArConnectWalletConnector } from '../../services/wallets/ArconnectWalletConnector';

function Connect() {
  const [{walletAddress, wallet}, dispatchGlobalState] = useGlobalState();

  async function handleConnect(e: any) {
    e.preventDefault();
    if (window.arweaveWallet) {
      const newWallet = new ArConnectWalletConnector()
      await newWallet.connect()
      const address = await newWallet.getWalletAddress()
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: address.toString(),
      });
      dispatchGlobalState({
        type: 'setWallet',
        payload: newWallet,
      })
    }

  }

  async function handleDisconnect (e:any) {
    e.preventDefault();
    await wallet?.disconnect()
    dispatchGlobalState({
      type: 'setWalletAddress',
      payload: undefined,
    });
    dispatchGlobalState({
      type: 'setWallet',
      payload: undefined,
    })
  }

  return <Button onClick={(e)=> !walletAddress ? handleConnect(e) : handleDisconnect(e)} style={walletAddress ? {background: "transparent", color:"white", border:"white 1px solid" } : {}}>{walletAddress ? "Disconnect" : "Connect"}</Button>;
}

export default Connect;
