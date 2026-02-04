export interface InventoryBalanceSyncRequestInput {
  ID_INVENTARIO: string;
  CODIGO_PRODUTO: string;
  PRODUTO: string;
  ID_INVENTARIO_PRODUTO: string;
  QTD_SALDO_ANTERIOR: number;
  PESO_SALDO_ANTERIOR: number;
  QTD_ESTOQUE_FISICO: number;
  PESO_ESTOQUE_FISICO: number;
}
export class InventoryBalanceSyncRequestDto {
  inventoryId?: string;
  productCode?: string;
  productName?: string;
  previousQuantity?: number;
  previousWeightInKg?: number;
  inventoryQuantity?: number;
  inventoryWeightInKg?: number;

  constructor(data: InventoryBalanceSyncRequestInput) {
    Object.assign(this, {
      inventoryId: data.ID_INVENTARIO,
      productCode: data.CODIGO_PRODUTO,
      productName: data.PRODUTO,
      previousQuantity: data.QTD_SALDO_ANTERIOR,
      previousWeightInKg: data.PESO_SALDO_ANTERIOR,
      inventoryQuantity: data.QTD_ESTOQUE_FISICO,
      inventoryWeightInKg: data.PESO_ESTOQUE_FISICO,
    });
  }
}
