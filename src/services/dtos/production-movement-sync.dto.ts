import { StringUtils } from 'src/utils/string.utils';

export interface ProductionMovementSyncRequestInput {
  CODIGO_EMPRESA: string;
  DATA_MOVIMENTACAO: Date;
  TIPO_PRODUCAO: string;
  ESPECIE_MOVIMENTO: string;
  ORDEM_COMPRA: string;
  CODIGO_PRODUTO: string;
  DESCRICAO: string;
  QUARTEIO: string;
  PECAS: number;
  PESO: number;
  QTDE_CAIXAS: number;
}
export class ProductionMovementSyncRequestDto {
  companyCode: string;
  date: Date;
  movementType: string;
  operationType: string;
  purchaseCattleOrderId: string;
  productCode: string;
  productName: string;
  productQuarter: string;
  weightInKg: number;
  quantity: number;
  boxQuantity: number;

  constructor(data: ProductionMovementSyncRequestInput) {
    const purchaseCattleOrderId =
      data.ORDEM_COMPRA.toString() == '0' ? null : data.ORDEM_COMPRA.toString();
    Object.assign(this, {
      companyCode: data.CODIGO_EMPRESA.toString(),
      date: data.DATA_MOVIMENTACAO,
      movementType: data.TIPO_PRODUCAO.toString(),
      operationType: data.ESPECIE_MOVIMENTO.toString(),
      purchaseCattleOrderId,
      productCode: data.CODIGO_PRODUTO.toString(),
      productName: StringUtils.normalize(data.DESCRICAO),
      productQuarter: data.QUARTEIO.toString(),
      weightInKg: data.PESO,
      quantity: data.PECAS,
      boxQuantity: data.QTDE_CAIXAS,
    });
  }
}
