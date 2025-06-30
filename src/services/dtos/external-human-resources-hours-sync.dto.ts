export interface ExternalHumanResourcesHoursSyncRequestInput {
  companyCode: string;
  integrationSystem: string;
}
export class ExternalHumanResourcesHoursSyncRequestDto {
  companyCode: string;
  integrationSystem: string;

  constructor(data: ExternalHumanResourcesHoursSyncRequestInput) {
    Object.assign(this, {
      companyCode: data.companyCode,
      integrationSystem: data.integrationSystem,
    });
  }
}
