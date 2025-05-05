import { DateUtils } from 'src/utils/date.utils';

export interface IncomingBatchesSyncRequestInput {
  DATA_PRODUCAO: string;
  DATA_ABATE: string;
  DATA_IMPRESSA: string;
  DATA_VALIDADE: string;
  TIPO_MOVIMENTACAO: string;
  CODIGO_EMPRESA: string;
  CODIGO_LINHA: string;
  CODIGO_PRODUTO: string;
  CODIGO_ALMOXARIFADO: string;
  CAIXAS: string;
  QUANTIDADE: string;
  PESO: string;
}
export class IncomingBatchesSyncRequestDto {
  productionDate: Date;
  slaughterDate: Date;
  printDate: Date;
  dueDate: Date;
  movementType: string;
  companyCode: string;
  productLineCode: string;
  productCode: string;
  warehouseCode: string;
  boxAmount: number;
  quantity: number;
  weightInKg: number;

  constructor(data: IncomingBatchesSyncRequestInput) {
    Object.assign(this, {
      productionDate: data.DATA_PRODUCAO,
      dueDate: data.DATA_VALIDADE,
      slaughterDate: data.DATA_ABATE,
      printDate: data.DATA_IMPRESSA,
      movementType: data.TIPO_MOVIMENTACAO,
      companyCode: data.CODIGO_EMPRESA,
      productLineCode: data.CODIGO_LINHA,
      productCode: data.CODIGO_PRODUTO,
      warehouseCode: data.CODIGO_ALMOXARIFADO,
      boxAmount: data.CAIXAS,
      quantity: data.QUANTIDADE,
      weightInKg: data.PESO,
    });
  }
}
