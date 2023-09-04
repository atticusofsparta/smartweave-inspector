import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import type { Action } from '../reducers/GlobalStateReducer';
import { ArweaveWalletConnector } from '../../../types/arweave';
import Arweave from 'arweave';

export type GlobalState = {
  walletAddress?: string;
  wallet?: ArweaveWalletConnector;
  rpcUrl?: string;
  arweave: Arweave
};

const initialState: GlobalState = {
  walletAddress: undefined,
  wallet: undefined,
  arweave:Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  })
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<Action>]>([
  initialState,
  () => initialState,
]);

export const useGlobalState = (): [GlobalState, Dispatch<Action>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, Action>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function GlobalStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(reducer, initialState);
  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
