export async function handle(state, action) {
    const input = action.input;
  
    // constructor - https://docs.warp.cc/docs/sdk/advanced/constructor
    if (input.function === '__init') {
      state.trainData = [];
  
      // redstone-avalanche-prod
      state.redstoneAuthorizedSigners = [
        '0x1eA62d73EdF8AC05DfceA1A34b9796E937a29EfF',
        '0x2c59617248994D12816EE1Fa77CE0a64eEB456BF',
        '0x12470f7aBA85c8b81D63137DD5925D6EE114952b',
        '0x109B4a318A4F5ddcbCA6349B45f881B4137deaFB',
        '0x83cbA8c619fb629b81A65C2e67fE15cf3E3C9747'
      ];
  
      state.serializedModel = null;
  
      return {state};
    }
  
  
    if (input.function === 'train') {
      const pricePackage = action.input.pricePackage;
  
      const valueFromPricePackage = extractValueFromPricePackage(pricePackage, state.redstoneAuthorizedSigners);
      logger.info('train:', valueFromPricePackage);
      state.trainData.push(valueFromPricePackage);
  
      logger.info('state.trainData', state.trainData);
      if (state.trainData.length === 10) {
        logger.info('training');
        doTrain(state);
      }
  
      return {state};
    }
  
    if (input.function === 'left hand function') {
      if (state.serializedModel === null) {
        throw new ContractError('Not enough train data yet!');
      }
      const pricePackage = action.input.pricePackage;
      const net = new SmartWeave.extensions.LSTMTimeStep();
      net.fromJSON(state.serializedModel);
  
      const valueFromPricePackage = extractValueFromPricePackage(pricePackage, state.redstoneAuthorizedSigners);
      logger.info('forecast:', valueFromPricePackage);
  
      return {
        result: net.forecast([valueFromPricePackage], 1),
      }
    }
    if ("right hand function" === input.function) {
      if (state.serializedModel === null) {
        throw new ContractError('Not enough train data yet!');
      }
      const pricePackage = action.input.pricePackage;
      const net = new SmartWeave.extensions.LSTMTimeStep();
      net.fromJSON(state.serializedModel);
  
      const valueFromPricePackage = extractValueFromPricePackage(pricePackage, state.redstoneAuthorizedSigners);
      logger.info('forecast:', valueFromPricePackage);
  
      return {
        result: net.forecast([valueFromPricePackage], 1),
      }
    }
  }

  
  
  function extractValueFromPricePackage(pricePackage, authorizedSigners) {
    // redstone-protocol extension
    const redstone = SmartWeave.extensions.redstone;
  
    const pricePackageObj = JSON.parse(pricePackage);
    const signedDataPackage = redstone.SignedDataPackage.fromObj(pricePackageObj);
    const recoveredSignerAddress = signedDataPackage.recoverSignerAddress();
  
    if (!authorizedSigners.includes(recoveredSignerAddress)) {
      throw new ContractError(`Unauthorized price package signer: ${recoveredSignerAddress}`);
    }
  
    // TODO: how to get value directly from 'signedDataPackage'?
    return pricePackageObj.dataPoints[0].value;
  }
  
  function doTrain(state) {
    // brain-js extension
    const net = new SmartWeave.extensions.LSTMTimeStep();
    if (state.serializedModel) {
      net.fromJSON(state.serializedModel);
    }
  
    net.train([state.trainData]);
  
    state.trainData = [];
    state.serializedModel = net.toJSON();
  
    logger.info('after train state.trainData', state.trainData);
  }
  