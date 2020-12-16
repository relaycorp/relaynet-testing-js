import { Certificate } from '@relaycorp/relaynet-core';

export function reSerializeCertificate(cert: Certificate): Certificate {
  // TODO: Raise bug in PKI.js project
  // PKI.js sometimes tries to use attributes that are only set *after* the certificate has been
  // deserialized, so you'd get a TypeError if you use a certificate you just created in memory.
  // For example, `extension.parsedValue` would be `undefined` in
  // https://github.com/PeculiarVentures/PKI.js/blob/9a39551aa9f1445406f96680318014c8d714e8e3/src/CertificateChainValidationEngine.js#L155
  return Certificate.deserialize(cert.serialize());
}

export function getTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMilliseconds(0);
  return tomorrow;
}
