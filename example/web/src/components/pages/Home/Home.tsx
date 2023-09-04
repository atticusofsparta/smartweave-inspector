import { useEffect, useState } from "react";
import { useGlobalState } from "../../../services/state/contexts/GlobalState";
import { deployedContractQuery } from "../../../utils/gql";



function Home() {

  const [{arweave, walletAddress}] = useGlobalState()
  const [deployedContracts, setDeployedContracts] = useState<string[]>([])

  useEffect(()=>{
if (walletAddress) {
  getDeployedContracts(walletAddress)
}
  },[walletAddress])

  async function getDeployedContracts(address:string) {
 
    const res = await arweave.api.post('/graphql', deployedContractQuery(address))
    const contractIds = res.data.data.transactions.edges.map((e:any)=> e.node.id)
    setDeployedContracts(contractIds)

  }


  return (
    <div className="page flex flex-column justify-center" style={{padding:"20px 5%"}}>
      <h1>
        Welcome to the <span style={{color:"var(--tomato-9)"}}>SmartWeave</span> inspector
      </h1>
      <h2 style={{color:"var(--yellow-8)"}}>Deployed contracts:</h2>
      <div className="flex-column flex justify-center" style={{display:"flex", width:"100%"}}>
        {
          deployedContracts.map((contractId)=> <div className="flex-row" style={{
            display:"flex",
            height:"75px",
            padding:"10px",
            background:"rgb(255,255,255, 0.5)",
            borderRadius:"10px",
            border:"1px solid silver",
            boxShadow:"var(--shadow)",
          }}>{contractId}</div>)
        }

      </div>
    </div>
  );
}

export default Home;
