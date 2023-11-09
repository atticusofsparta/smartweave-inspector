import { useEffect, useState } from 'react';
import Identicon from 'react-identicons';
import ReactJson from 'react-json-view';
import { Triangle } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import { WarpFactory, defaultCacheOptions } from 'warp-contracts';

import { useGlobalState } from '../../services/state/contexts/GlobalState';

function ContractCard({ id }: { id: string }) {
  const [{ arweave }] = useGlobalState();
  const [manifest, setManifest] = useState<any>(null);
  const [contractState, setContractState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    load(id);
  }, []);

  async function load(id: string) {
    try {
      setLoading(true);
      const res = await fetch(`http://dev.arns.app/v1/contract/${id}`);
      const { state } = await res.json();
      setContractState(state);
      const contractManifest = await getEvaluationOptions(id);
      setManifest(contractManifest);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function getEvaluationOptions(contractAddress: string) {
    try {
      const res = await arweave.api.get('/tx/' + contractAddress);
      const tags = res.data.tags.map((tag: any) => ({
        name: atob(tag.name),
        value: atob(tag.value),
      }));
      const options = tags.find(
        (tag: any) => tag.name === 'Contract-Manifest',
      )?.value;
      if (!options) {
        return;
      }
      return JSON.parse(options).evaluationOptions;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      className="flex flex-column"
      style={{
        background: '#1f1f1f',
        padding: '10px',
        borderRadius: '8px',
        width: '500px',
        boxShadow: 'var(--shadow)',
        color: 'white',
        gap: '15px',
      }}
    >
      <div
        className="flex flex-row"
        style={{
          minHeight: '80px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <Triangle
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="triangle-loading"
            wrapperStyle={{}}
            wrapperClassName=""
            visible={true}
          />
        ) : (
          <ReactJson
            src={contractState}
            theme={'chalk'}
            style={{ width: '100%' }}
            shouldCollapse={(field) =>
              field.name !== ('root' || 'name' || 'ticker' || 'owner')
            }
          />
        )}
      </div>
      <div className="flex flex-row" style={{ gap: '20px' }}>
        <Identicon string={id} size={40} />
        <div className="flex flex-column">
          <span>
            {contractState?.name ??
              contractState?.nickname ??
              contractState?.ticker ??
              'Contract'}
          </span>
          <Link style={{ color: 'gold' }} to={`/contract/${id}`}>
            {id}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ContractCard;
