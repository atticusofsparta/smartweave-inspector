import { useEffect, useState } from 'react';
import { Dna } from 'react-loader-spinner';

import { useGlobalState } from '../../../services/state/contexts/GlobalState';
import { deployedContractQuery } from '../../../utils/gql';
import ContractCard from '../../cards/ContractCard';

function Home() {
  const [{ arweave, walletAddress }] = useGlobalState();
  const [deployedContracts, setDeployedContracts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (walletAddress) {
      getDeployedContracts(walletAddress);
    }
  }, [walletAddress]);

  async function getDeployedContracts(address: string) {
    try {
      setLoading(true);
      const res = await fetch(
        `http://dev.arns.app/v1/wallet/${address}/contracts`,
      );

      const { contractTxIds } = await res.json();

      setDeployedContracts(contractTxIds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="page flex flex-column justify-center"
      style={{ padding: '20px 5%' }}
    >
      <h1>
        Welcome to the{' '}
        <span style={{ color: 'var(--tomato-9)' }}>SmartWeave</span> inspector
      </h1>
      <h2 style={{ color: 'var(--yellow-8)' }}>Deployed contracts:</h2>
      <p style={{ color: 'var(--yellow-8)' }}>
        Click on the ID to interact with the contract!
      </p>
      <div
        className="flex-row flex justify-center"
        style={{
          display: 'flex',
          width: '100%',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {loading ? (
          <div
            className="flex flex-row"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Dna
              visible={true}
              height="280"
              width="280"
              ariaLabel="dna-loading"
              wrapperStyle={{ alignItems: 'center' }}
              wrapperClass="dna-wrapper"
            />
          </div>
        ) : deployedContracts.length ? (
          deployedContracts.map((contractId) => (
            <ContractCard id={contractId} />
          ))
        ) : (
          <div className="flex flex-row" style={{ color: 'white' }}>
            No contracts found for {walletAddress ?? 'this wallet'}.{' '}
            {!walletAddress
              ? 'Please connect your wallet to see your deployed contracts.'
              : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
