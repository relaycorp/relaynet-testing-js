import {
  Certificate,
  issueDeliveryAuthorization,
  issueEndpointCertificate,
  issueGatewayCertificate,
} from '@relaycorp/relaynet-core';

import { NodeKeyPairSet } from './NodeKeyPairSet';
import { getTomorrow, reSerializeCertificate } from './utils';

/**
 * Certification path from a public gateway to a PDA.
 */
export interface PDACertPath {
  readonly publicGateway: Certificate;
  readonly privateGateway: Certificate;
  readonly privateEndpoint: Certificate;
  readonly pdaGrantee: Certificate;
}

/**
 * Generate a dummy certification path from a public gateway to a PDA grantee.
 */
export async function generatePDACertificationPath(
  keyPairSet: NodeKeyPairSet,
): Promise<PDACertPath> {
  const tomorrow = getTomorrow();

  const publicGatewayCertificate = reSerializeCertificate(
    await issueGatewayCertificate({
      issuerPrivateKey: keyPairSet.publicGateway.privateKey,
      subjectPublicKey: keyPairSet.publicGateway.publicKey,
      validityEndDate: tomorrow,
    }),
  );

  const privateGatewayCertificate = reSerializeCertificate(
    await issueGatewayCertificate({
      issuerCertificate: publicGatewayCertificate,
      issuerPrivateKey: keyPairSet.publicGateway.privateKey,
      subjectPublicKey: keyPairSet.privateGateway.publicKey,
      validityEndDate: tomorrow,
    }),
  );

  const privateEndpointCertificate = reSerializeCertificate(
    await issueEndpointCertificate({
      issuerCertificate: privateGatewayCertificate,
      issuerPrivateKey: keyPairSet.privateGateway.privateKey,
      subjectPublicKey: keyPairSet.privateEndpoint.publicKey,
      validityEndDate: tomorrow,
    }),
  );

  const pdaGranteeCertificate = reSerializeCertificate(
    await issueDeliveryAuthorization({
      issuerCertificate: privateEndpointCertificate,
      issuerPrivateKey: keyPairSet.privateEndpoint.privateKey,
      subjectPublicKey: keyPairSet.pdaGrantee.publicKey,
      validityEndDate: tomorrow,
    }),
  );

  return {
    pdaGrantee: pdaGranteeCertificate,
    privateEndpoint: privateEndpointCertificate,
    privateGateway: privateGatewayCertificate,
    publicGateway: publicGatewayCertificate,
  };
}
