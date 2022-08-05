import { generateECDHKeyPair, generateRSAKeyPair } from '@relaycorp/relaynet-core';

export interface NodeKeyPairSet {
  readonly internetGateway: CryptoKeyPair;
  readonly privateGateway: CryptoKeyPair;
  readonly privateEndpoint: CryptoKeyPair;
  readonly pdaGrantee: CryptoKeyPair;
}

export async function generateIdentityKeyPairSet(): Promise<NodeKeyPairSet> {
  return {
    pdaGrantee: await generateRSAKeyPair(),
    privateEndpoint: await generateRSAKeyPair(),
    privateGateway: await generateRSAKeyPair(),
    internetGateway: await generateRSAKeyPair(),
  };
}

export async function generateSessionKeyPairSet(): Promise<NodeKeyPairSet> {
  return {
    pdaGrantee: await generateECDHKeyPair(),
    privateEndpoint: await generateECDHKeyPair(),
    privateGateway: await generateECDHKeyPair(),
    internetGateway: await generateECDHKeyPair(),
  };
}
