
  // src/actions/read/balance.ts
  var balance = async (state, { input: { target } }) => {
    const balances = state.balances;
    if (typeof target !== "string") {
      throw new ContractError("Must specify target to get balance for");
    }
    if (typeof balances[target] !== "number") {
      throw new ContractError("Cannot get balance, target does not exist");
    }
    return {
      result: {
        target,
        balance: balances[target]
      }
    };
  };

  // src/constants.ts
  var MAX_DELEGATES = 1e3;
  var MAX_YEARS = 3;
  var MAX_NAME_LENGTH = 32;
  var MAX_NOTE_LENGTH = 256;
  var MAX_GATEWAY_LABEL_LENGTH = 16;
  var MAX_PORT_NUMBER = 65535;
  var TX_ID_LENGTH = 43;
  var SECONDS_IN_A_YEAR = 31536e3;
  var SECONDS_IN_GRACE_PERIOD = 1814400;
  var RESERVED_ATOMIC_TX_ID = "atomic";
  var NETWORK_JOIN_STATUS = "joined";
  var NETWORK_LEAVING_STATUS = "leaving";
  var NETWORK_HIDDEN_STATUS = "hidden";
  var MINIMUM_ALLOWED_NAME_LENGTH = 5;
  var ALLOWED_ACTIVE_TIERS = [1, 2, 3];
  var DEFAULT_ANNUAL_PERCENTAGE_FEE = 0.1;
  var DEFAULT_NON_CONTRACT_OWNER_MESSAGE = `Caller is not the owner of the ArNS!`;
  var DEFAULT_INVALID_ARNS_NAME_MESSAGE = "Invalid ArNS Record Name";
  var DEFAULT_ARNS_NAME_LENGTH_DISALLOWED_MESSAGE = `Names shorter than ${MINIMUM_ALLOWED_NAME_LENGTH} characters must be reserved in order to be purchased.`;
  var DEFAULT_NON_EXPIRED_ARNS_NAME_MESSAGE = "This name already exists in an active lease";
  var DEFAULT_ARNS_NAME_DOES_NOT_EXIST_MESSAGE = "Name does not exist in the ArNS Contract!";
  var DEFAULT_EXISTING_ANT_SOURCE_CODE_TX_MESSAGE = "This ANT Source Code Transaction ID is already allowed.";
  var DEFAULT_INSUFFICIENT_FUNDS_MESSAGE = "Insufficient funds for this transaction.";
  var DEFAULT_INVALID_TARGET_MESSAGE = "Invalid target specified";
  var DEFAULT_INVALID_QTY_MESSAGE = "Invalid quantity. Must be an integer and greater than 0.";
  var DEFAULT_INVALID_TIER_MESSAGE = "Invalid tier.";
  var DEFAULT_INVALID_ID_TIER_MESSAGE = "Invalid tier ID. Must be present in state before it can be used as a current tier.";
  var DEFAULT_INVALID_YEARS_MESSAGE = `Invalid number of years. Must be an integer and less than ${MAX_YEARS}`;
  var DEFAULT_TIERS = [
    {
      id: "a27dbfe4-6992-4276-91fb-5b97ae8c3ffa",
      fee: 100,
      settings: {
        maxUndernames: 100
      }
    },
    {
      id: "93685bbb-8246-4e7e-bef8-d2e7e6c5d44a",
      fee: 1e3,
      settings: {
        maxUndernames: 1e3
      }
    },
    {
      id: "b6c8ee18-2481-4c1b-886c-dbe6b606486a",
      fee: 1e4,
      settings: {
        maxUndernames: 1e4
      }
    }
  ];
  var DEFAULT_FEE_STRUCTURE = {
    "1": 421875e4,
    "2": 140625e4,
    "3": 46875e4,
    "4": 15625e4,
    "5": 625e5,
    "6": 25e6,
    "7": 1e7,
    "8": 5e6,
    "9": 1e6,
    "10": 5e5,
    "11": 45e4,
    "12": 4e5,
    "13": 35e4,
    "14": 3e5,
    "15": 25e4,
    "16": 2e5,
    "17": 175e3,
    "18": 15e4,
    "19": 125e3,
    "20": 1e5,
    "21": 75e3,
    "22": 5e4,
    "23": 25e4,
    "24": 12500,
    "25": 6750,
    "26": 3375,
    "27": 1e3,
    "28": 500,
    "29": 250,
    "30": 125,
    "31": 100,
    "32": 50
  };

  // src/actions/read/gateways.ts
  var getGateway = async (state, { input: { target } }) => {
    const gateways = state.gateways;
    if (!(target in gateways)) {
      throw new ContractError("This target does not have a registered gateway.");
    }
    const gatewayObj = gateways[target];
    return {
      result: gatewayObj
    };
  };
  var getGatewayTotalStake = async (state, { input: { target } }) => {
    const gateways = state.gateways;
    if (!(target in gateways)) {
      throw new ContractError("This target does not have a registered gateway.");
    }
    const gatewayTotalStake = gateways[target].operatorStake + gateways[target].delegatedStake;
    return {
      result: gatewayTotalStake
    };
  };
  var getGatewayRegistry = async (state) => {
    const gateways = state.gateways;
    return {
      result: gateways
    };
  };
  var getRankedGatewayRegistry = async (state) => {
    const gateways = state.gateways;
    const filteredGateways = {};
    Object.keys(gateways).forEach((address) => {
      if (gateways[address].status === NETWORK_JOIN_STATUS) {
        filteredGateways[address] = gateways[address];
      }
    });
    const rankedGateways = {};
    Object.keys(filteredGateways).sort((addressA, addressB) => {
      const gatewayA = filteredGateways[addressA];
      const gatewayB = filteredGateways[addressB];
      const totalStakeA = gatewayA.operatorStake + gatewayA.delegatedStake;
      const totalStakeB = gatewayB.operatorStake + gatewayB.delegatedStake;
      return totalStakeB - totalStakeA;
    }).forEach((address) => {
      rankedGateways[address] = filteredGateways[address];
    });
    return {
      result: rankedGateways
    };
  };

  // src/actions/read/record.ts
  var getRecord = async (state, { input: { name } }) => {
    const records = state.records;
    const allTiers = state.tiers.history;
    if (typeof name !== "string") {
      throw new ContractError("Must specify the ArNS Name");
    }
    if (!(name in records)) {
      throw new ContractError("This name does not exist");
    }
    const arnsName = records[name];
    const associatedTier = allTiers.find((t) => t.id === arnsName.tier);
    if (!associatedTier) {
      throw new ContractError("The name is associated with an invalid tier.");
    }
    return {
      result: {
        name,
        ...arnsName,
        tier: {
          ...associatedTier
        }
      }
    };
  };

  // src/actions/read/tiers.ts
  var getTier = async (state, { input: { tierNumber } }) => {
    const tiers = state.tiers;
    const currentTiers = tiers.current;
    const validTiers = tiers.history;
    if (!Number.isInteger(tierNumber) || !Object.keys(currentTiers).map((k) => +k).includes(tierNumber)) {
      throw new ContractError(
        `Invalid tier selected. Available options ${Object.keys(currentTiers)}`
      );
    }
    const selectedTiter = validTiers.find(
      (t) => t.id === currentTiers[tierNumber]
    );
    if (!selectedTiter) {
      throw new ContractError("Tier was not published to state. Try again.");
    }
    return {
      result: {
        ...selectedTiter
      }
    };
  };
  var getActiveTiers = async (state) => {
    const tiers = state.tiers;
    const current = tiers.current;
    const allTiers = tiers.history;
    const activeTiers = Object.entries(current).map(([tier, id]) => {
      const tierObj = allTiers.find((t) => t.id === id);
      return {
        tier,
        ...tierObj
      };
    });
    return {
      result: activeTiers
    };
  };

  // src/actions/write/addANTSourceCodeTx.ts
  var addANTSourceCodeTx = async (state, { caller, input: { contractTxId } }) => {
    const owner = state.owner;
    const approvedANTSourceCodeTxs = state.approvedANTSourceCodeTxs;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    const txIdPattern = new RegExp("^[a-zA-Z0-9_-]{43}$");
    const txIdres = txIdPattern.test(contractTxId);
    if (typeof contractTxId !== "string" || contractTxId.length !== TX_ID_LENGTH || !txIdres) {
      throw new ContractError("Invalid ANT Source Code Transaction ID");
    }
    if (approvedANTSourceCodeTxs.indexOf(contractTxId) > -1) {
      throw new ContractError(DEFAULT_EXISTING_ANT_SOURCE_CODE_TX_MESSAGE);
    } else {
      state.approvedANTSourceCodeTxs.push(contractTxId);
    }
    return { state };
  };

  // src/utilities.ts
  function calculateTotalRegistrationFee(name, state, tier, years) {
    const initialNamePurchaseFee = state.fees[name.length.toString()];
    return initialNamePurchaseFee + calculateAnnualRenewalFee(name, state, tier, years);
  }
  function calculateAnnualRenewalFee(name, state, tier, years) {
    const initialNamePurchaseFee = state.fees[name.length.toString()];
    const nameAnnualRegistrationFee = initialNamePurchaseFee * DEFAULT_ANNUAL_PERCENTAGE_FEE;
    const tierAnnualFee = tier.fee;
    return (nameAnnualRegistrationFee + tierAnnualFee) * years;
  }
  function isValidFQDN(fqdn) {
    const fqdnRegex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{1,6}$/;
    return fqdnRegex.test(fqdn);
  }
  function isValidArweaveBase64URL(base64URL) {
    const base64URLRegex = new RegExp("^[a-zA-Z0-9_-]{43}$");
    return base64URLRegex.test(base64URL);
  }

  // src/actions/write/buyRecord.ts
  var buyRecord = async (state, {
    caller,
    input: { name, contractTxId, years = 1, tierNumber = 1 }
  }) => {
    const balances = state.balances ?? {};
    const records = state.records ?? {};
    const reserved = state.reserved ?? {};
    const currentTiers = state.tiers?.current ?? DEFAULT_TIERS.reduce(
      (acc, tier, index) => ({
        ...acc,
        [index + 1]: tier.id
      }),
      {}
    );
    const allTiers = state.tiers?.history ?? DEFAULT_TIERS;
    const currentBlockTime = +SmartWeave.block.timestamp;
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (!Number.isInteger(years) || years > MAX_YEARS || years <= 0) {
      throw new ContractError(
        'Invalid value for "years". Must be an integer greater than zero and less than the max years'
      );
    }
    const activeTierNumbers = Object.keys(currentTiers).map((k) => +k);
    if (!Number.isInteger(tierNumber) || !activeTierNumbers.includes(tierNumber)) {
      throw new ContractError(
        `Invalid value for "tier". Must be ${Object.values(currentTiers).join(
          ","
        )}`
      );
    }
    const selectedTierID = currentTiers[tierNumber];
    const purchasedTier = allTiers.find((t) => t.id === selectedTierID) ?? DEFAULT_TIERS[0];
    if (!purchasedTier) {
      throw new ContractError("The tier purchased is not in the states history.");
    }
    const endTimestamp = currentBlockTime + SECONDS_IN_A_YEAR * years;
    const formattedName = name.toLowerCase();
    const namePattern = new RegExp("^[a-zA-Z0-9-]+$");
    const nameRes = namePattern.test(formattedName);
    if (formattedName.charAt(0) === "-" || // the name has a leading dash
    typeof formattedName !== "string" || formattedName.length > MAX_NAME_LENGTH || // the name is too long
    !nameRes || // the name does not match our regular expression
    formattedName === "") {
      throw new ContractError(DEFAULT_INVALID_ARNS_NAME_MESSAGE);
    }
    const totalFee = calculateTotalRegistrationFee(
      formattedName,
      state,
      purchasedTier,
      years
    );
    if (balances[caller] < totalFee) {
      throw new ContractError(
        `Caller balance not high enough to purchase this name for ${totalFee} token(s)!`
      );
    }
    if (typeof contractTxId !== "string") {
      throw new ContractError("ANT Smartweave Contract Address must be a string");
    } else if (contractTxId.toLowerCase() === RESERVED_ATOMIC_TX_ID) {
      contractTxId = SmartWeave.transaction.id;
    } else {
      const txIdPattern = new RegExp("^[a-zA-Z0-9_-]{43}$");
      const txIdres = txIdPattern.test(contractTxId);
      if (contractTxId.length !== TX_ID_LENGTH || !txIdres) {
        throw new ContractError("Invalid ANT Smartweave Contract Address");
      }
    }
    if (!records[formattedName]) {
      balances[caller] -= totalFee;
      records[formattedName] = {
        contractTxId,
        endTimestamp,
        tier: selectedTierID
      };
    } else if (records[formattedName].endTimestamp + SECONDS_IN_GRACE_PERIOD < currentBlockTime) {
      balances[caller] -= totalFee;
      records[formattedName] = {
        contractTxId,
        endTimestamp,
        tier: selectedTierID
      };
    } else {
      throw new ContractError(DEFAULT_NON_EXPIRED_ARNS_NAME_MESSAGE);
    }
    state.records = records;
    state.reserved = reserved;
    return { state };
  };

  // src/actions/write/createNewTier.ts
  var createNewTier = async (state, {
    caller,
    input: {
      newTier: { fee, settings }
    }
  }) => {
    const owner = state.owner;
    if (caller !== owner) {
      throw new ContractError(`Caller is not the owner of the ArNS!`);
    }
    if (!Number.isInteger(fee)) {
      throw new ContractError("Fee must be a valid number.");
    }
    const newTier = {
      id: SmartWeave.transaction.id,
      fee,
      settings
    };
    state.tiers.history.push(newTier);
    return { state };
  };

  // src/actions/write/evolve.ts
  var evolve = async (state, { caller, input: { value } }) => {
    const owner = state.owner;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    state.evolve = value.toString();
    return { state };
  };

  // src/actions/write/extendRecord.ts
  var extendRecord = async (state, { caller, input: { name, years } }) => {
    const balances = state.balances;
    const records = state.records;
    const currentBlockTime = +SmartWeave.block.timestamp;
    const allTiers = state.tiers.history;
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (!records[name]) {
      throw new ContractError(DEFAULT_ARNS_NAME_DOES_NOT_EXIST_MESSAGE);
    }
    if (!Number.isInteger(years) || years > MAX_YEARS) {
      throw new ContractError(DEFAULT_INVALID_YEARS_MESSAGE);
    }
    if (records[name].endTimestamp > currentBlockTime) {
      throw new ContractError(
        `This name cannot be extended until the grace period begins.`
      );
    }
    if (records[name].endTimestamp + SECONDS_IN_GRACE_PERIOD <= currentBlockTime) {
      throw new ContractError(
        `This name has expired and must repurchased before it can be extended.`
      );
    }
    const purchasedTier = allTiers.find((t) => t.id === records[name].tier);
    const totalExtensionAnnualFee = calculateAnnualRenewalFee(
      name,
      state,
      purchasedTier,
      years
    );
    if (balances[caller] < totalExtensionAnnualFee) {
      throw new ContractError(
        `Caller balance not high enough to extend this name lease for ${totalExtensionAnnualFee} token(s) for ${years}!`
      );
    }
    balances[caller] -= totalExtensionAnnualFee;
    records[name].endTimestamp += SECONDS_IN_A_YEAR * years;
    return { state };
  };

  // src/actions/write/finalizeLeave.ts
  var finalizeLeave = async (state, { caller, input: { target = caller } }) => {
    const gateways = state.gateways;
    const balances = state.balances;
    if (!(target in gateways)) {
      throw new ContractError("This target is not a registered gateway.");
    }
    if (gateways[target].status !== NETWORK_LEAVING_STATUS || gateways[target].end > +SmartWeave.block.height) {
      throw new ContractError("This Gateway can not leave the network yet");
    }
    balances[target] = gateways[target].vaults.reduce(
      (totalVaulted, vault) => totalVaulted + vault.balance,
      balances[target]
    );
    for (const delegate of Object.keys(gateways[target].delegates)) {
      const totalQtyDelegated = gateways[target].delegates[delegate].reduce(
        (totalQtyDelegated2, d) => totalQtyDelegated2 += d.balance,
        0
      );
      balances[delegate] = balances[delegate] ?? 0 + totalQtyDelegated;
    }
    delete gateways[target];
    state.balances = balances;
    state.gateways = gateways;
    return { state };
  };

  // src/actions/write/finalizeOperatorStakeDecrease.ts
  var finalizeOperatorStakeDecrease = async (state, { caller, input: { target = caller } }) => {
    const gateways = state.gateways;
    const balances = state.balances;
    if (!(target in gateways)) {
      throw new ContractError("This Gateway's wallet is not registered");
    }
    const vaults = gateways[caller].vaults;
    const remainingVaults = [];
    for (const vault of vaults) {
      if (vault.end !== 0 && vault.end <= +SmartWeave.block.height) {
        balances[target] = (balances[target] ?? 0) + vault.balance;
        gateways[target].operatorStake -= vault.balance;
        continue;
      }
      remainingVaults.push(vault);
    }
    gateways[caller].vaults = remainingVaults;
    state.balances = balances;
    state.gateways = gateways;
    return { state };
  };

  // src/actions/write/increaseOperatorStake.ts
  var increaseOperatorStake = async (state, { caller, input: { qty } }) => {
    const balances = state.balances;
    const gateways = state.gateways;
    const settings = state.settings;
    if (!(caller in gateways)) {
      throw new ContractError("This Gateway's wallet is not registered");
    }
    if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
      throw new ContractError(
        "This Gateway is in the process of leaving the network and cannot have its stake adjusted"
      );
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new ContractError("Quantity must be a positive integer.");
    }
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (balances[caller] < qty) {
      throw new ContractError(
        `Caller balance not high enough to stake ${qty} token(s)!`
      );
    }
    if (qty < settings.minDelegatedStakeAmount) {
      throw new ContractError(
        `Quantity must be greater than or equal to the minimum delegated stake amount ${settings.minDelegatedStakeAmount}.`
      );
    }
    state.balances[caller] -= qty;
    state.gateways[caller].operatorStake += qty;
    state.gateways[caller].vaults.push({
      balance: qty,
      start: +SmartWeave.block.height,
      end: 0
    });
    return { state };
  };

  // src/actions/write/initiateLeave.ts
  var initiateLeave = async (state, { caller }) => {
    const settings = state.settings;
    const gateways = state.gateways;
    if (!(caller in gateways)) {
      throw new ContractError("This target is not a registered gateway.");
    }
    if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
      throw new ContractError(
        "This Gateway is in the process of leaving the network"
      );
    }
    if (gateways[caller].start + settings.minGatewayJoinLength > +SmartWeave.block.height) {
      throw new ContractError("This Gateway has not been joined long enough");
    }
    const gatewayLeaveHeight = +SmartWeave.block.height + settings.gatewayLeaveLength;
    const vaults = gateways[caller].vaults;
    for (const vault of vaults) {
      if (vault.end === 0 || vault.end > gatewayLeaveHeight) {
        vault.end = gatewayLeaveHeight;
      }
    }
    gateways[caller].vaults = vaults;
    gateways[caller].end = gatewayLeaveHeight;
    gateways[caller].status = NETWORK_LEAVING_STATUS;
    state.gateways = gateways;
    return { state };
  };

  // src/actions/write/initiateOperatorStakeDecrease.ts
  var initiateOperatorStakeDecrease = async (state, { caller, input: { id } }) => {
    const settings = state.settings;
    const gateways = state.gateways;
    if (!(caller in gateways)) {
      throw new ContractError("This Gateway's wallet is not registered");
    }
    if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
      throw new ContractError(
        "This Gateway is in the process of leaving the network and cannot have its stake adjusted"
      );
    }
    if (typeof id !== "number" || id > gateways[caller].vaults.length || id < 0) {
      throw new ContractError("Invalid vault index provided");
    }
    if (gateways[caller].operatorStake - gateways[caller].vaults[id].balance < settings.minNetworkJoinStakeAmount) {
      throw new ContractError(
        "Not enough operator stake to maintain the minimum"
      );
    }
    if (gateways[caller].vaults[id].start + settings.minLockLength > +SmartWeave.block.height) {
      throw new ContractError("This vault has not been locked long enough");
    }
    if (gateways[caller].vaults[id].end === 0) {
      gateways[caller].vaults[id].end = +SmartWeave.block.height + settings.operatorStakeWithdrawLength;
    } else {
      throw new ContractError(
        `This vault is already being unlocked at ${gateways[caller].vaults[id].end}`
      );
    }
    state.gateways = gateways;
    return { state };
  };

  // src/actions/write/joinNetwork.ts
  var joinNetwork = async (state, {
    caller,
    input: {
      qty,
      label,
      fqdn,
      port,
      protocol,
      openDelegation = false,
      delegateAllowList = [],
      note
    }
  }) => {
    const balances = state.balances;
    const settings = state.settings;
    const gateways = state.gateways;
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new ContractError('Invalid value for "qty". Must be an integer');
    }
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (balances[caller] < qty) {
      throw new ContractError(DEFAULT_INSUFFICIENT_FUNDS_MESSAGE);
    }
    if (qty < settings.minNetworkJoinStakeAmount) {
      throw new ContractError(
        `Quantity must be greater than or equal to the minimum network join stake amount ${settings.minNetworkJoinStakeAmount}.`
      );
    }
    if (typeof label !== "string" || label.length > MAX_GATEWAY_LABEL_LENGTH) {
      throw new ContractError("Label format not recognized.");
    }
    if (!Number.isInteger(port) || port > MAX_PORT_NUMBER) {
      throw new ContractError("Invalid port number.");
    }
    if (!(protocol === "http" || protocol === "https")) {
      throw new ContractError("Invalid protocol, must be http or https.");
    }
    const isFQDN = isValidFQDN(fqdn);
    if (fqdn === void 0 || typeof fqdn !== "string" || !isFQDN) {
      throw new ContractError(
        "Please provide a fully qualified domain name to access this gateway"
      );
    }
    if (note && typeof note !== "string" && note > MAX_NOTE_LENGTH) {
      throw new ContractError("Invalid note.");
    }
    if (typeof openDelegation !== "boolean") {
      throw new ContractError("Open Delegation must be true or false.");
    }
    if (!Array.isArray(delegateAllowList)) {
      throw new ContractError(
        "Delegate allow list must contain an array of valid Arweave addresses."
      );
    }
    if (delegateAllowList.length > MAX_DELEGATES) {
      throw ContractError("Invalid number of delegates.");
    }
    for (let i = 0; i < delegateAllowList.length; i += 1) {
      if (!isValidArweaveBase64URL(delegateAllowList[i])) {
        throw new ContractError(
          `${delegateAllowList[i]} is an invalid Arweave address. Delegate allow list must contain valid arweave addresses.`
        );
      }
    }
    if (caller in gateways) {
      throw new ContractError("This Gateway's wallet is already registered");
    }
    state.balances[caller] -= qty;
    state.gateways[caller] = {
      operatorStake: qty,
      delegatedStake: 0,
      vaults: [
        {
          balance: qty,
          start: +SmartWeave.block.height,
          end: 0
        }
      ],
      delegates: {},
      settings: {
        label,
        fqdn,
        port,
        protocol,
        openDelegation,
        delegateAllowList,
        note
      },
      status: NETWORK_JOIN_STATUS,
      start: +SmartWeave.block.height,
      // TODO: timestamp vs. height
      end: 0
    };
    return { state };
  };

  // src/actions/write/mintTokens.ts
  var mintTokens = async (state, { caller, input: { qty } }) => {
    const balances = state.balances;
    const owner = state.owner;
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new ContractError(DEFAULT_INVALID_QTY_MESSAGE);
    }
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    balances[caller] ? balances[caller] += qty : balances[caller] = qty;
    return { state };
  };

  // src/actions/write/removeANTSourceCodeTx.ts
  var removeANTSourceCodeTx = async (state, { caller, input: { contractTxId } }) => {
    const owner = state.owner;
    const approvedANTSourceCodeTxs = state.approvedANTSourceCodeTxs;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    const txIdPattern = new RegExp("^[a-zA-Z0-9_-]{43}$");
    const txIdres = txIdPattern.test(contractTxId);
    if (typeof contractTxId !== "string" || contractTxId.length !== TX_ID_LENGTH || !txIdres) {
      throw new ContractError("Invalid ANT Source Code Transaction ID");
    }
    if (approvedANTSourceCodeTxs.indexOf(contractTxId) > -1) {
      state.approvedANTSourceCodeTxs.splice(
        approvedANTSourceCodeTxs.indexOf(contractTxId)
      );
    } else {
      throw new ContractError(
        "This ANT Source Code Transaction ID not in the list."
      );
    }
    return { state };
  };

  // src/actions/write/removeRecord.ts
  var removeRecord = async (state, { caller, input: { name } }) => {
    const owner = state.owner;
    const records = state.records;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    name = name.toLowerCase();
    if (name in records) {
      delete records[name];
    } else {
      throw new ContractError(DEFAULT_ARNS_NAME_DOES_NOT_EXIST_MESSAGE);
    }
    state.records = records;
    return { state };
  };

  // src/actions/write/setActiveTier.ts
  var setActiveTier = async (state, { caller, input: { tierNumber, tierId } }) => {
    const owner = state.owner;
    const history = state.tiers.history;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    if (!Number.isInteger(tierNumber) || !ALLOWED_ACTIVE_TIERS.includes(tierNumber)) {
      throw new ContractError(DEFAULT_INVALID_TIER_MESSAGE);
    }
    const existingTier = history.find((tier) => tier.id === tierId);
    if (!existingTier) {
      throw new ContractError(DEFAULT_INVALID_ID_TIER_MESSAGE);
    }
    state.tiers.current[tierNumber] = tierId;
    return { state };
  };

  // src/actions/write/setFees.ts
  var setFees = async (state, { caller, input: { fees } }) => {
    const owner = state.owner;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    if (Object.keys(fees).length !== MAX_NAME_LENGTH) {
      throw new ContractError(
        "Invalid number of fees being set. There must be fees set for all character lengths that can be purchased"
      );
    }
    for (let i = 1; i <= MAX_NAME_LENGTH; i++) {
      if (!Number.isInteger(fees[i.toString()]) || fees[i.toString()] <= 0) {
        throw new ContractError(
          "Invalid value for fee %s. Must be an integer greater than 0",
          i
        );
      }
    }
    state.fees = fees;
    return { state };
  };

  // src/actions/write/setName.ts
  var setName = async (state, { caller, input: { value } }) => {
    const owner = state.owner;
    if (caller !== owner) {
      throw new ContractError("Caller cannot change tiers");
    }
    if (typeof value === "string" && value.length <= 32) {
      state.name = value;
    } else {
      throw new ContractError("Name is invalid.");
    }
    return { state };
  };

  // src/actions/write/transferTokens.ts
  var transferTokens = async (state, { caller, input: { target, qty } }) => {
    const balances = state.balances;
    if (!Number.isInteger(qty)) {
      throw new ContractError('Invalid value for "qty". Must be an integer');
    }
    if (!target) {
      throw new ContractError("No target specified");
    }
    if (qty <= 0 || caller === target) {
      throw new ContractError(DEFAULT_INVALID_TARGET_MESSAGE);
    }
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (balances[caller] < qty) {
      throw new ContractError(DEFAULT_INSUFFICIENT_FUNDS_MESSAGE);
    }
    if (target in balances) {
      balances[target] += qty;
    } else {
      balances[target] = qty;
    }
    balances[caller] -= qty;
    state.balances = balances;
    return { state };
  };

  // src/actions/write/updateGatewaySettings.ts
  var updateGatewaySettings = async (state, {
    caller,
    input: {
      label,
      fqdn,
      port,
      protocol,
      openDelegation,
      delegateAllowList,
      note,
      status
    }
  }) => {
    const gateways = state.gateways;
    if (!(caller in gateways)) {
      throw new ContractError("This caller does not have a registered gateway.");
    }
    if (label) {
      if (typeof label !== "string" || label.length > MAX_GATEWAY_LABEL_LENGTH) {
        throw new ContractError("Label format not recognized.");
      } else {
        gateways[caller].settings.label = label;
      }
    }
    if (port) {
      if (!Number.isInteger(port) || port > MAX_PORT_NUMBER) {
        throw new ContractError("Invalid port number.");
      } else {
        gateways[caller].settings.port = port;
      }
    }
    if (protocol) {
      if (!(protocol === "http" || protocol === "https")) {
        throw new ContractError("Invalid protocol, must be http or https.");
      } else {
        gateways[caller].settings.protocol = protocol;
      }
    }
    if (fqdn) {
      const isFQDN = isValidFQDN(fqdn);
      if (typeof fqdn !== "string" || !isFQDN) {
        throw new ContractError(
          "Please provide a fully qualified domain name to access this gateway"
        );
      } else {
        gateways[caller].settings.fqdn = fqdn;
      }
    }
    if (note) {
      if (typeof note !== "string") {
        throw new ContractError("Note format not recognized.");
      }
      if (note.length > MAX_NOTE_LENGTH) {
        throw new ContractError("Note is too long.");
      } else {
        gateways[caller].settings.note = note;
      }
    }
    if (openDelegation !== void 0) {
      if (typeof openDelegation !== "boolean") {
        throw new ContractError("Open Delegation must be true or false.");
      } else {
        gateways[caller].settings.openDelegation = openDelegation;
      }
    }
    if (delegateAllowList) {
      if (!Array.isArray(delegateAllowList)) {
        throw new ContractError(
          "Delegate allow list must contain an array of valid Arweave addresses."
        );
      }
      for (let i = 0; i < delegateAllowList.length; i += 1) {
        if (!isValidArweaveBase64URL(delegateAllowList[i])) {
          throw new ContractError(
            `${delegateAllowList[i]} is an invalid Arweave address. Delegate allow list must contain valid arweave addresses.`
          );
        }
      }
      gateways[caller].settings.delegateAllowList = delegateAllowList;
    }
    if (status) {
      if (!(status === NETWORK_HIDDEN_STATUS || status === NETWORK_JOIN_STATUS)) {
        throw new ContractError(
          `Invalid gateway status, must be set to ${NETWORK_HIDDEN_STATUS} or ${NETWORK_JOIN_STATUS}`
        );
      } else {
        gateways[caller].status = status;
      }
    }
    state.gateways[caller] = gateways[caller];
    return { state };
  };

  // src/actions/write/updateState.ts
  var updateState = async (state, { caller }) => {
    const owner = state.owner;
    if (caller !== owner) {
      throw new ContractError(DEFAULT_NON_CONTRACT_OWNER_MESSAGE);
    }
    state = {
      ...state,
      fees: {
        ...DEFAULT_FEE_STRUCTURE
      },
      tiers: {
        history: DEFAULT_TIERS,
        current: DEFAULT_TIERS.reduce(
          (acc, tier, index) => ({
            ...acc,
            [index + 1]: tier.id
          }),
          {}
        )
      }
    };
    for (const key of Object.keys(state.records)) {
      if (state.records[key].contractTxId === void 0) {
        const endTimestamp = +SmartWeave.block.timestamp + SECONDS_IN_A_YEAR * 1;
        state.records[key] = {
          contractTxId: state.records[key].toString(),
          endTimestamp,
          tier: state.tiers.current[1]
        };
      }
    }
    return { state };
  };

  // src/actions/write/upgradeTier.ts
  var upgradeTier = async (state, { caller, input: { name, tierNumber } }) => {
    const balances = state.balances;
    const records = state.records;
    const currentTiers = state.tiers.current;
    const allTiers = state.tiers.history;
    const currentBlockTime = +SmartWeave.block.timestamp;
    if (!balances[caller] || balances[caller] == void 0 || balances[caller] == null || isNaN(balances[caller])) {
      throw new ContractError(`Caller balance is not defined!`);
    }
    if (!records[name]) {
      throw new ContractError(DEFAULT_ARNS_NAME_DOES_NOT_EXIST_MESSAGE);
    }
    const currentNameTier = allTiers.find((t) => t.id === records[name].tier);
    const allowedTierNumbers = Object.keys(currentTiers).map((t) => +t);
    const currentTierNumber = +Object.keys(currentTiers).find(
      (tier) => currentTiers[tier] === currentNameTier.id
    );
    if (!Number.isInteger(tierNumber) || !allowedTierNumbers.includes(tierNumber) || tierNumber <= currentTierNumber) {
      throw new ContractError(DEFAULT_INVALID_TIER_MESSAGE);
    }
    const selectedUpgradeTier = allTiers.find(
      (t) => t.id === currentTiers[tierNumber]
    );
    if (!selectedUpgradeTier) {
      throw new ContractError(
        "The tier associated with the provided tier number does not exist. Try again."
      );
    }
    if (currentNameTier.id === selectedUpgradeTier.id) {
      throw new ContractError("Cannot upgrade to the same tier.");
    }
    if (records[name].endTimestamp + SECONDS_IN_GRACE_PERIOD < currentBlockTime) {
      throw new ContractError(
        `This name's lease has expired.  It must be purchased first before being extended.`
      );
    }
    const previousTierFee = currentNameTier.fee;
    const newTierFee = selectedUpgradeTier.fee;
    const tierFeeDifference = newTierFee - previousTierFee;
    const amountOfSecondsLeft = records[name].endTimestamp - currentBlockTime;
    const amountOfYearsLeft = amountOfSecondsLeft / SECONDS_IN_A_YEAR;
    const totalTierFeeUpgrade = tierFeeDifference * amountOfYearsLeft;
    if (balances[caller] < totalTierFeeUpgrade) {
      throw new ContractError(
        `Caller balance not high enough to extend this name lease for ${totalTierFeeUpgrade} token(s)!`
      );
    }
    balances[caller] -= totalTierFeeUpgrade;
    records[name].tier = selectedUpgradeTier.id;
    return { state };
  };

  // src/contract.ts
  async function handle(state, action) {
    const input = action.input;
    switch (input.function) {
      case "transfer":
        return await transferTokens(state, action);
      case "mint":
        return await mintTokens(state, action);
      case "setFees":
        return await setFees(state, action);
      case "buyRecord":
        return await buyRecord(state, action);
      case "extendRecord":
        return await extendRecord(state, action);
      case "removeRecord":
        return await removeRecord(state, action);
      case "setActiveTier":
        return await setActiveTier(state, action);
      case "evolve":
        return await evolve(state, action);
      case "updateState":
        return await updateState(state, action);
      case "setName":
        return await setName(state, action);
      case "addANTSourceCodeTx":
        return await addANTSourceCodeTx(state, action);
      case "removeANTSourceCodeTx":
        return await removeANTSourceCodeTx(state, action);
      case "balance":
        return await balance(state, action);
      case "record":
        return await getRecord(state, action);
      case "tier":
        return await getTier(state, action);
      case "activeTiers":
        return await getActiveTiers(state);
      case "gateway":
        return await getGateway(state, action);
      case "gatewayTotalStake":
        return await getGatewayTotalStake(state, action);
      case "gatewayRegistry":
        return await getGatewayRegistry(state);
      case "rankedGatewayRegistry":
        return await getRankedGatewayRegistry(state);
      case "upgradeTier":
        return await upgradeTier(state, action);
      case "createNewTier":
        return await createNewTier(state, action);
      case "joinNetwork":
        return await joinNetwork(state, action);
      case "initiateLeave":
        return await initiateLeave(state, action);
      case "finalizeLeave":
        return await finalizeLeave(state, action);
      case "increaseOperatorStake":
        return await increaseOperatorStake(state, action);
      case "initiateOperatorStakeDecrease":
        return await initiateOperatorStakeDecrease(state, action);
      case "finalizeOperatorStakeDecrease":
        return await finalizeOperatorStakeDecrease(state, action);
      case "updateGatewaySettings":
        return await updateGatewaySettings(state, action);
      default:
        throw new ContractError(
          `No function supplied or function not recognized: "${input.function}"`
        );
    }
  }

