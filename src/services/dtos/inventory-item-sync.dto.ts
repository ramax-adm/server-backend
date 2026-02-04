export interface InventoryItemSyncRequestInput {
  ID_INVENTARIO: string;
  ID_LOTE_ENTRADA: string;
  NUMERO_CAIXA: string;
  DATA_PRODUCAO: Date;
  DATA_VALIDADE: Date;
  SEQUENCIAL_PRODUTO: string;
  CODIGO_PRODUTO: string;
  PRODUTO: string;
  CODIGO_SIF: string;
  PESO: string;
  TARA_CAIXA: string;
  USUARIO_CRIACAO: string;
}
export class InventoryItemSyncRequestDto {
  inventoryId?: string;
  incomingBatchId?: string;
  boxNumber?: string;
  productionDate?: string;
  dueDate?: Date;
  productId?: string;
  productCode?: string;
  productName?: string;
  sifCode?: string;
  weightInKg?: number;
  tareWeightInKg?: number;
  sensattaCreatedBy?: string;

  constructor(data: InventoryItemSyncRequestInput) {
    Object.assign(this, {
      inventoryId: data.ID_INVENTARIO,
      incomingBatchId: data.ID_LOTE_ENTRADA,
      boxNumber: data.NUMERO_CAIXA,
      productionDate: data.DATA_PRODUCAO,
      dueDate: data.DATA_VALIDADE,
      productId: data.SEQUENCIAL_PRODUTO,
      productCode: data.CODIGO_PRODUTO,
      productName: data.PRODUTO,
      sifCode: data.CODIGO_SIF,
      weightInKg: data.PESO,
      tareWeightInKg: data.TARA_CAIXA,
      sensattaCreatedBy: data.USUARIO_CRIACAO,
    });
  }
}
