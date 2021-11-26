import { Certificate, CertificateStore } from '@relaycorp/relaynet-core';
import { MockStoredCertificateData } from './MockStoredCertificateData';

export class MockCertificateStore extends CertificateStore {
  public dataByPrivateAddress: {
    // tslint:disable-next-line:readonly-array readonly-keyword
    [privateAddress: string]: MockStoredCertificateData[];
  } = {};

  public clear(): void {
    // tslint:disable-next-line:no-object-mutation
    this.dataByPrivateAddress = {};
  }

  public async forceSave(certificate: Certificate): Promise<void> {
    await this.saveData(
      await certificate.calculateSubjectPrivateAddress(),
      certificate.serialize(),
      certificate.expiryDate,
    );
  }

  public async deleteExpired(): Promise<void> {
    throw new Error('Not implemented');
  }

  protected async retrieveAllSerializations(
    subjectPrivateAddress: string,
  ): Promise<readonly ArrayBuffer[]> {
    const certificateData = this.dataByPrivateAddress[subjectPrivateAddress];
    if (!certificateData) {
      return [];
    }
    return certificateData.map((d) => d.certificateSerialized);
  }

  protected async retrieveLatestSerialization(
    subjectPrivateAddress: string,
  ): Promise<ArrayBuffer | null> {
    const certificateData = this.dataByPrivateAddress[subjectPrivateAddress] ?? [];
    if (certificateData.length === 0) {
      return null;
    }
    const dataSorted = certificateData.sort(
      (a, b) => a.expiryDate.getDate() - b.expiryDate.getDate(),
    );
    return dataSorted[0].certificateSerialized;
  }

  protected async saveData(
    subjectPrivateAddress: string,
    subjectCertificateSerialized: ArrayBuffer,
    subjectCertificateExpiryDate: Date,
  ): Promise<void> {
    const mockData: MockStoredCertificateData = {
      certificateSerialized: subjectCertificateSerialized,
      expiryDate: subjectCertificateExpiryDate,
    };
    const originalCertificateData = this.dataByPrivateAddress[subjectPrivateAddress] ?? [];
    // tslint:disable-next-line:no-object-mutation
    this.dataByPrivateAddress[subjectPrivateAddress] = [...originalCertificateData, mockData];
  }
}
