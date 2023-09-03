import SWInspector from "../../src";
import * as fs from 'fs'
import path from 'path'


async function main() {
    const filePath = path.resolve('./example/contracts/registry.js');
    const contractSource = fs.readFileSync(filePath, 'utf8');
    const inspectorGadget = new SWInspector(contractSource);

    const functions = await inspectorGadget.getContractFunctions();
    console.log(functions);
}

main();

// test all functions with inferred values and return results