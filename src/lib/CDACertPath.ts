import {
  Certificate,
  issueDeliveryAuthorization,
  issueGatewayCertificate,
} from '@relaycorp/relaynet-core';

import { NodeKeyPairSet } from './NodeKeyPairSet';
import { getTomorrow, reSerializeCertificate } from './utils';

export interface CDACertPath {
  readonly privateGateway: Certificate;
  readonly internetGateway: Certificate;
}

export async function generateCDACertificationPath(
  keyPairSet: NodeKeyPairSet,
): Promise<CDACertPath> {
  const tomorrow = getTomorrow();

  const privateGatewayCertificate = reSerializeCertificate(
    await issueGatewayCertificate({
      issuerPrivateKey: keyPairSet.privateGateway.privateKey,
      subjectPublicKey: keyPairSet.privateGateway.publicKey,
      validityEndDate: tomorrow,
    }),
  );
  const internetGatewayCertificate = reSerializeCertificate(
    await issueDeliveryAuthorization({
      issuerCertificate: privateGatewayCertificate,
      issuerPrivateKey: keyPairSet.privateGateway.privateKey,
      subjectPublicKey: keyPairSet.internetGateway.publicKey,
      validityEndDate: tomorrow,
    }),
  );
  return {
    privateGateway: privateGatewayCertificate,
    internetGateway: internetGatewayCertificate,
  };
}
