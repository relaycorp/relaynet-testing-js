import { generateRSAKeyPair } from '@relaycorp/relaynet-core';

export interface NodeKeyPairSet {
  readonly publicGateway: CryptoKeyPair;
  readonly privateGateway: CryptoKeyPair;
  readonly privateEndpoint: CryptoKeyPair;
  readonly pdaGrantee: CryptoKeyPair;
}

export async function generateNodeKeyPairSet(): Promise<NodeKeyPairSet> {
  return {
    pdaGrantee: await generateRSAKeyPair(),
    privateEndpoint: await generateRSAKeyPair(),
    privateGateway: await generateRSAKeyPair(),
    publicGateway: await generateRSAKeyPair(),
  };
}
