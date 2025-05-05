export interface WarehouseSyncRequestInput {
  CODIGO_ALMOXARIFADO: number;
  CODIGO_EMPRESA: number;
  NOME: string;
}
export class WarehouseSyncRequestDto {
  sensattaCode: string;
  companyCode: string;
  name: string;
  isActive: boolean;

  constructor(data: WarehouseSyncRequestInput) {
    Object.assign(this, {
      sensattaCode: data.CODIGO_ALMOXARIFADO.toString(),
      companyCode: data.CODIGO_EMPRESA.toString(),
      name: data.NOME,
      isActive: false,
    });
  }
}
