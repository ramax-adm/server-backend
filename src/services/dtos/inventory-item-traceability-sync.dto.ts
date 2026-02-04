export interface InventoryItemTraceabilitySyncRequestInput {
  ID_INVENTARIO: string;
  DATA_OPERACAO: Date;
  ID_LOTE_ENTRADA: string;
  NUMERO_CAIXA: string;
  PESO: string;
  TARA_CAIXA: string;
  OPERACAO: Date;
  STATUS: string;
  LINHA_1: string;
  LINHA_2: string;
  LINHA_3: string;
  LINHA_4: string;
  LINHA_5: string;
  LINHA_6: string;
}
export class InventoryItemTraceabilitySyncRequestDto {
  inventoryId?: string;
  date: Date;
  incomingBatchId?: string;
  boxNumber?: string;
  weightInKg?: number;
  tareWeightInKg?: number;
  operation?: string;
  status?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  line6?: string;

  constructor(data: InventoryItemTraceabilitySyncRequestInput) {
    Object.assign(this, {
      inventoryId: data.ID_INVENTARIO,
      date: data.DATA_OPERACAO,
      incomingBatchId: data.ID_LOTE_ENTRADA,
      boxNumber: data.NUMERO_CAIXA,
      weightInKg: data.PESO,
      tareWeightInKg: data.TARA_CAIXA,
      operation: data.OPERACAO,
      status: data.STATUS,
      line1: data.LINHA_1,
      line2: data.LINHA_2,
      line3: data.LINHA_3,
      line4: data.LINHA_4,
      line5: data.LINHA_5,
      line6: data.LINHA_6,
    });
  }
}
