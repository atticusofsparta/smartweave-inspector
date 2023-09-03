
    // src/contracts/actions/read/balance.ts
    var balance = async (state, { input: { target } }) => {
      const ticker = state.ticker;
      const owner = state.owner;
      if (typeof target !== "string") {
        throw new ContractError("Must specify target to get balance for");
      }
      return {
        result: { target, ticker, balance: target === owner ? 1 : 0 }
      };
    };
  
    // src/contracts/actions/write/removeRecord.ts
    var removeRecord = async (state, { caller, input: { subDomain } }) => {
      const owner = state.owner;
      const records = state.records;
      const controller = state.controller;
      if (caller !== owner && caller !== controller) {
        throw new ContractError(`Caller is not the token owner or controller!`);
      }
      if (subDomain in records) {
        delete records[subDomain];
      } else {
        throw new ContractError(`SubDomain does not exist in this ANT!`);
      }
      return { state };
    };
  
    // src/contracts/actions/write/setName.ts
    var setName = async (state, { caller, input: { name } }) => {
      const owner = state.owner;
      const controller = state.controller;
      if (caller !== owner && caller !== controller) {
        throw new ContractError(`Caller is not the token owner or controller!`);
      }
      if (typeof name !== "string" || name === "") {
        throw new ContractError("Invalid ANT name");
      }
      state.name = name;
      return { state };
    };
  
    // src/contracts/actions/write/setTicker.ts
    var setTicker = async (state, { caller, input: { ticker } }) => {
      const owner = state.owner;
      const controller = state.controller;
      if (caller !== owner && caller !== controller) {
        throw new ContractError(`Caller is not the token owner or controller!`);
      }
      if (typeof ticker !== "string" && ticker === "") {
        throw new ContractError("Invalid ANT ticker");
      }
      state.ticker = ticker;
      return { state };
    };
  
    // src/constants.ts
    var MIN_TTL_LENGTH = 900;
    var MAX_TTL_LENGTH = 2592e3;
    var MAX_NAME_LENGTH = 20;
    var TX_ID_LENGTH = 43;
  
    // src/contracts/actions/write/setRecord.ts
    var setRecord = async (state, { caller, input: { subDomain, transactionId, ttlSeconds } }) => {
      const owner = state.owner;
      const controller = state.controller;
      if (caller !== owner && caller !== controller) {
        throw new ContractError(`Caller is not the token owner!`);
      }
      const namePattern = new RegExp("^[a-zA-Z0-9_-]+$");
      const nameRes = namePattern.test(subDomain);
      if (typeof subDomain !== "string" || subDomain.length > MAX_NAME_LENGTH || !nameRes && subDomain !== "@" || subDomain === "www") {
        throw new ContractError("Invalid ArNS Record Subdomain");
      }
      const pattern = new RegExp("^[a-zA-Z0-9_-]{43}$");
      const res = pattern.test(transactionId);
      if (typeof transactionId !== "string" || transactionId.length !== TX_ID_LENGTH || !res) {
        throw new ContractError("Invalid Arweave Transaction ID");
      }
      if (ttlSeconds === void 0) {
        ttlSeconds = MIN_TTL_LENGTH;
      }
      if (!Number.isInteger(ttlSeconds) || ttlSeconds < MIN_TTL_LENGTH || ttlSeconds > MAX_TTL_LENGTH) {
        throw new ContractError('Invalid value for "ttlSeconds". Must be an integer');
      }
      state.records[subDomain] = {
        transactionId,
        ttlSeconds
      };
      return { state };
    };
  
    // src/contracts/actions/write/transferTokens.ts
    var transferTokens = async (state, { caller, input: { target } }) => {
      const owner = state.owner;
      const balances = state.balances;
      if (!target) {
        throw new ContractError("No target specified");
      }
      if (caller === target) {
        throw new ContractError("Invalid token transfer");
      }
      if (caller !== owner) {
        throw new ContractError(`Caller is not the token owner!`);
      }
      if (balances[caller] < 1) {
        throw new ContractError(`Caller does not have a token balance!`);
      }
      state.owner = target;
      delete balances[caller];
      balances[target] = 1;
      return { state };
    };
  
    // src/contracts/actions/write/setController.ts
    var setController = async (state, { caller, input: { target } }) => {
      const owner = state.owner;
      const balances = state.balances;
      if (!target) {
        throw new ContractError("No target specified");
      }
      if (caller !== owner) {
        throw new ContractError(`Caller is not the token owner!`);
      }
      if (balances[caller] < 1) {
        throw new ContractError(`Caller does not have a token balance!`);
      }
      state.controller = target;
      return { state };
    };
  
    // src/contracts/contract.ts
   export async function handle(state, action) {
      const input = action.input;
      switch (input.function) {
        case "transfer":
          return await transferTokens(state, action);
        case "setRecord":
          return await setRecord(state, action);
        case "setName":
          return await setName(state, action);
        case "setTicker":
          return await setTicker(state, action);
        case "setController":
          return await setController(state, action);
        case "removeRecord":
          return await removeRecord(state, action);
        case "balance":
          return await balance(state, action);
        default:
          throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
      }
    }

  