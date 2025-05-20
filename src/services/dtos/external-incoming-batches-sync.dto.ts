export interface ExternalIncomingBatchSyncRequestInput {
  companyCode: string;
  integrationSystem: string;
}
export class ExternalIncomingBatchSyncRequestDto {
  companyCode: string;
  integrationSystem: string;

  constructor(data: ExternalIncomingBatchSyncRequestInput) {
    Object.assign(this, {
      companyCode: data.companyCode,
      integrationSystem: data.integrationSystem,
    });
  }
}
