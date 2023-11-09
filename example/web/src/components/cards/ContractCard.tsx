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
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const warp = WarpFactory.forMainnet(defaultCacheOptions, true);

  useEffect(() => {
    load(id);
  }, []);

  async function load(id: string) {
    try {
      setLoading(true);
      const contract = await warp.contract(id);
      const res = await contract
        .setEvaluationOptions({ maxInteractionEvaluationTimeSeconds: 1 })
        .readState();

      setState(res.cachedValue.state);
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
          <ReactJson src={manifest} theme={'chalk'} style={{ width: '100%' }} />
        )}
      </div>
      <div className="flex flex-row" style={{ gap: '20px' }}>
        <Identicon string={id} size={40} />
        <div className="flex flex-column">
          <span>
            {state?.name ?? state?.nickname ?? state?.ticker ?? 'Contract'}
          </span>
          <Link to={`/contract/${id}`}>{id}</Link>
        </div>
      </div>
    </div>
  );
}

export default ContractCard;
