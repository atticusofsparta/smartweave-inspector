import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGlobalState } from '../../../services/state/contexts/GlobalState';
import SWInspector from '../../../utils/inspector';
import ContractFunctionInput from './ContractFunctionInput';

function Contract() {
  const [{ arweave }] = useGlobalState();
  const { address } = useParams();
  const [contractSource, setContractSource] = useState<string>('');
  const [contractFunctions, setContractFunctions] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      getContractSource(address);
    }
  }, [address]);

  async function getContractSource(id: string) {
    try {
      const data = await arweave.transactions.get(id);
      const tags = data.tags.map((tag: any) => ({
        name: atob(tag.name),
        value: atob(tag.value),
      }));
      const contractSrcId = tags.find(
        (tag: any) => tag.name === 'Contract-Src',
      )?.value;
      if (!contractSrcId) {
        return;
      }
      const contractCode = await arweave.transactions.getData(contractSrcId, {
        decode: true,
        string: true,
      });
      setContractSource(contractCode.toString());
      const inspector = new SWInspector(contractCode.toString());
      const contractFunctions = await inspector.getContractFunctions();
      setContractFunctions(contractFunctions);
      console.log(contractFunctions);
      console.log(await inspector.generateAST());
      console.log(inspector.source);
    } catch (error) {
      console.error(error);
    }
  }

  if (!contractFunctions || !address) {
    return (
      <div className="page flex align-center">
        <h1>Fetching contract info, please wait</h1>
      </div>
    );
  }

  return (
    <div className="page flex" style={{ padding: '20px 5%' }}>
      <h1>Contract Interface</h1>
      <div
        className="flex flex-column align-center"
        style={{ width: '100%', gap: '30px' }}
      >
        {contractFunctions.map((func) => (
          <ContractFunctionInput
            functionName={Object.keys(func).at(-1) as string}
            functionProperties={Object.values(func)[0] as string[]}
            contractAddress={address}
            key={func}
          />
        ))}
      </div>
    </div>
  );
}

export default Contract;
