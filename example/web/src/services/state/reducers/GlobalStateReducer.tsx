import { ArweaveWalletConnector } from '../../../types/arweave';
import { GlobalState } from '../contexts/GlobalState';

export type Action = { type: 'setWalletAddress'; payload: string | undefined } | 
{ type: 'setWallet'; payload?: ArweaveWalletConnector }

export const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'setWalletAddress':
      return {
        ...state,
        walletAddress: action.payload,
      };

    case 'setWallet':
      return {
        ...state,
        wallet: action.payload,
      };
    default:
      return state;
  }
};
