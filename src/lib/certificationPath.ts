import {
  Certificate,
  generateRSAKeyPair,
  issueDeliveryAuthorization,
  issueEndpointCertificate,
  issueGatewayCertificate,
} from '@relaycorp/relaynet-core';
import { NodeKeys } from './NodeKeys';

export interface CertificationPath {
  readonly pdaGrantee: NodeKeys;
  readonly privateEndpoint: NodeKeys;
  readonly privateGateway: NodeKeys;
  readonly publicGateway: NodeKeys;
}

/**
 * Generate a dummy certification path from a public gateway to a PDA grantee.
 */
export async function generateCertificationPath(): Promise<CertificationPath> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const publicGatewayKeyPair = await generateRSAKeyPair();
  const publicGatewayKeys: NodeKeys = {
    certificate: reSerializeCertificate(
      await issueGatewayCertificate({
        issuerPrivateKey: publicGatewayKeyPair.privateKey,
        subjectPublicKey: publicGatewayKeyPair.publicKey,
        validityEndDate: tomorrow,
      }),
    ),
    privateKey: publicGatewayKeyPair.privateKey,
  };

  const privateGatewayKeyPair = await generateRSAKeyPair();
  const privateGatewayKeys: NodeKeys = {
    certificate: reSerializeCertificate(
      await issueGatewayCertificate({
        issuerCertificate: publicGatewayKeys.certificate,
        issuerPrivateKey: publicGatewayKeys.privateKey,
        subjectPublicKey: privateGatewayKeyPair.publicKey,
        validityEndDate: tomorrow,
      }),
    ),
    privateKey: privateGatewayKeyPair.privateKey,
  };

  const privateEndpointKeyPair = await generateRSAKeyPair();
  const privateEndpointKeys: NodeKeys = {
    certificate: reSerializeCertificate(
      await issueEndpointCertificate({
        issuerCertificate: privateGatewayKeys.certificate,
        issuerPrivateKey: privateGatewayKeyPair.privateKey,
        subjectPublicKey: privateEndpointKeyPair.publicKey,
        validityEndDate: tomorrow,
      }),
    ),
    privateKey: privateEndpointKeyPair.privateKey,
  };

  const pdaGranteeKeyPair = await generateRSAKeyPair();
  const pdaGranteeKeys: NodeKeys = {
    certificate: reSerializeCertificate(
      await issueDeliveryAuthorization({
        issuerCertificate: privateEndpointKeys.certificate,
        issuerPrivateKey: privateEndpointKeys.privateKey,
        subjectPublicKey: pdaGranteeKeyPair.publicKey,
        validityEndDate: tomorrow,
      }),
    ),
    privateKey: pdaGranteeKeyPair.privateKey,
  };

  return {
    pdaGrantee: pdaGranteeKeys,
    privateEndpoint: privateEndpointKeys,
    privateGateway: privateGatewayKeys,
    publicGateway: publicGatewayKeys,
  };
}

function reSerializeCertificate(cert: Certificate): Certificate {
  // TODO: Raise bug in PKI.js project
  // PKI.js sometimes tries to use attributes that are only set *after* the certificate has been
  // deserialized, so you'd get a TypeError if you use a certificate you just created in memory.
  // For example, `extension.parsedValue` would be `undefined` in
  // https://github.com/PeculiarVentures/PKI.js/blob/9a39551aa9f1445406f96680318014c8d714e8e3/src/CertificateChainValidationEngine.js#L155
  return Certificate.deserialize(cert.serialize());
}
