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
  readonly internetGateway: Certificate;
  readonly privateGateway: Certificate;
  readonly privateEndpoint: Certificate;
  readonly pdaGrantee: Certificate;
}

/**
 * Generate a dummy certification path from a public gateway to a PDA grantee.
 */
export async function generatePDACertificationPath(
  keyPairSet: NodeKeyPairSet,
  expiryDate?: Date,
): Promise<PDACertPath> {
  const validityEndDate = expiryDate ?? getTomorrow();

  const internetGatewayCertificate = reSerializeCertificate(
    await issueGatewayCertificate({
      issuerPrivateKey: keyPairSet.internetGateway.privateKey,
      subjectPublicKey: keyPairSet.internetGateway.publicKey,
      validityEndDate,
    }),
  );

  const privateGatewayCertificate = reSerializeCertificate(
    await issueGatewayCertificate({
      issuerCertificate: internetGatewayCertificate,
      issuerPrivateKey: keyPairSet.internetGateway.privateKey,
      subjectPublicKey: keyPairSet.privateGateway.publicKey,
      validityEndDate,
    }),
  );

  const privateEndpointCertificate = reSerializeCertificate(
    await issueEndpointCertificate({
      issuerCertificate: privateGatewayCertificate,
      issuerPrivateKey: keyPairSet.privateGateway.privateKey,
      subjectPublicKey: keyPairSet.privateEndpoint.publicKey,
      validityEndDate,
    }),
  );

  const pdaGranteeCertificate = reSerializeCertificate(
    await issueDeliveryAuthorization({
      issuerCertificate: privateEndpointCertificate,
      issuerPrivateKey: keyPairSet.privateEndpoint.privateKey,
      subjectPublicKey: keyPairSet.pdaGrantee.publicKey,
      validityEndDate,
    }),
  );

  return {
    pdaGrantee: pdaGranteeCertificate,
    privateEndpoint: privateEndpointCertificate,
    privateGateway: privateGatewayCertificate,
    internetGateway: internetGatewayCertificate,
  };
}
