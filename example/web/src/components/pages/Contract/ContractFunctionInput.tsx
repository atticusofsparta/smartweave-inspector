// section label of the function in question, eg "transfer", the label for each property in the function, eg "to", "amount", etc,
// and a button to submit the function.
import { Button, TextField } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';

import { useGlobalState } from '../../../services/state/contexts/GlobalState';
import {WarpFactory, defaultCacheOptions} from 'warp-contracts'
import { get } from 'lodash';

function ContractFunctionInput({
  functionName,
  functionProperties,
  contractAddress
}: {
  functionName: string;
  functionProperties: string[];
  contractAddress: string;
}) {
  const [{ walletAddress, arweave }, dispatchGlobalState] = useGlobalState();
  const [propertyValues, setPropertyValues] = useState<Record<string, any>>(
    () =>
      functionProperties.reduce((acc, prop) => ({ ...acc, [prop]: '' }), {}),
  );
  const [currentInput, setCurrentInput] = useState<string>('');
  const [modifiedValue, setModifiedValue] = useState<string>('');
  const [writingTransaction, setWritingTransaction] = useState<boolean>(false);
  const [deployedTxId, setDeployedTxId] = useState<string>('');

  useEffect(() => {
    getEvaluationOptions(contractAddress)
    if (modifiedValue) {
        setPropertyValues({...propertyValues, [currentInput]: modifiedValue})

    } 
  }, [modifiedValue]);

  function reset() {
    setPropertyValues(() =>
      functionProperties.reduce((acc, prop) => ({ ...acc, [prop]: '' }), {}),
    );
    setCurrentInput('');
    setModifiedValue('');
    setDeployedTxId('')
  }

  function handlePropertyChange(prop: string, value: any) {
    console.log(prop, value);
    setModifiedValue(value);
  }

  async function getEvaluationOptions(contractAddress: string) {
    try {
      const res = await arweave.api.get('/tx/'+contractAddress)
      const tags = res.data.tags.map((tag:any)=> ({name: atob(tag.name), value: atob(tag.value)}))
      const options = tags.find((tag:any)=> tag.name === "Contract-Manifest")?.value
      if (!options) {
        return
      }
      return JSON.parse(options).evaluationOptions
    } catch (error) {
      console.error(error);
    }
  }

  async function handleContractWrite() {
    try {
      setWritingTransaction(true);
      const evaluationOptions = await getEvaluationOptions(contractAddress)
      const warp = WarpFactory.forMainnet(defaultCacheOptions, true)
      const contract = warp.contract(contractAddress).connect('use_wallet').setEvaluationOptions({...evaluationOptions, waitForConfirmation:false} ?? {})
      const result = await contract.writeInteraction({
        function: functionName,
        ...propertyValues,
      })
      if (!result) {
        throw new Error("No result")
      }
      if (result.originalTxId) {
        setDeployedTxId(result.originalTxId)
      }

    } catch (error) {
      console.error(error);
    }finally {
        setWritingTransaction(false)
    }
  }

  if (!functionProperties.length) {
    return null;
  }

  return (
    <div
      className="flex-column align-start justify-center card"
      style={{
        width: '75%',
        gap: '20px',
        borderRadius: '5px',
        boxShadow: 'var(--shadow)',
        padding: '10px',
        border: 'silver 1px solid',
        display: 'flex',
      }}
    >
      <h2
        className="flex-row justify-center align-center"
        style={{
          fontWeight: 'bold',
          color: 'white',
          borderBottom: 'solid 2px black',
          width: '100%',
          display: 'flex',
        }}
      >
        {functionName}
      </h2>
      {functionProperties?.map((property, index) => (
        <div
          className="flex-column align-start justify-start"
          style={{ gap: '10px', display: 'flex', width: '100%' }}
          key={`${property}-${index}`}
        >
          <span
            className="flex-row"
            style={{
              fontWeight: 'bold',
              color: 'white',
              width: '100%',
              marginLeft: '20px',
            }}
          >
            {property}
          </span>
          <TextField.Root style={{ width: '100%' }}>
            <TextField.Input
              placeholder={`Enter a value for: ${property}`}
              onChange={(e) => handlePropertyChange(property, e.target.value)}
              value={
                currentInput === property
                  ? modifiedValue
                  : propertyValues[property]
              }
              maxLength={1000}
              radius="full"
              onFocus={() =>{
                setCurrentInput(property);
                setModifiedValue("");
            }}
            />
          </TextField.Root>
        </div>
      ))}
      <div
        className="flex flex-row justify-end"
        style={{ display: 'flex', width: '100%', gap:"15px" }}
      >{writingTransaction ? <div>Writing transaction...</div> :
        deployedTxId ? <div style={{color:"white"}}>Deployed transaction: <a className='link' href={`https://sonar.warp.cc/#/app/interaction/${deployedTxId}`} target="_blank" rel="noreferrer">{deployedTxId}</a></div> :
        <ReactJson
          src={propertyValues}
          theme={'ashes'}
          style={{ width: '100%' }}
          name={`${functionName} payload`}
          collapsed={Object.values(propertyValues).every((v) => !v.length)}
        />}
        <span style={{ display: 'flex', gap: '15px' }}>
          <Button
            variant="outline"
            onClick={() => reset()}
            style={{ color: 'white' }}
          >
            Reset
          </Button>
          <Button disabled={!walletAddress} onClick={()=> handleContractWrite()}>Write</Button>
        </span>
      </div>
    </div>
  );
}

export default ContractFunctionInput;
