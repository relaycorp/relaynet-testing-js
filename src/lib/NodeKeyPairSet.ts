import { generateECDHKeyPair, generateRSAKeyPair } from '@relaycorp/relaynet-core';

export interface NodeKeyPairSet {
  readonly publicGateway: CryptoKeyPair;
  readonly privateGateway: CryptoKeyPair;
  readonly privateEndpoint: CryptoKeyPair;
  readonly pdaGrantee: CryptoKeyPair;
}

export async function generateIdentityKeyPairSet(): Promise<NodeKeyPairSet> {
  return {
    pdaGrantee: await generateRSAKeyPair(),
    privateEndpoint: await generateRSAKeyPair(),
    privateGateway: await generateRSAKeyPair(),
    publicGateway: await generateRSAKeyPair(),
  };
}

export async function generateSessionKeyPairSet(): Promise<NodeKeyPairSet> {
  return {
    pdaGrantee: await generateECDHKeyPair(),
    privateEndpoint: await generateECDHKeyPair(),
    privateGateway: await generateECDHKeyPair(),
    publicGateway: await generateECDHKeyPair(),
  };
}
