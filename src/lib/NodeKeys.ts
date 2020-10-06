import { Certificate } from '@relaycorp/relaynet-core';

export interface NodeKeys {
  readonly privateKey: CryptoKey;
  readonly certificate: Certificate;
}
