export interface InventorySyncRequestInput {
  ID_INVENTARIO: string;
  DATA: string;
  DATA_INICIO_CONTAGEM: Date;
  DATA_FIM_CONTAGEM: string;
  CODIGO_EMPRESA: string;
  EMPRESA: string;
  CODIGO_ALMOXARIFADO: string;
  ALMOXARIFADO: string;
  SITUACAO: string;
}
export class InventorySyncRequestDto {
  sensattaId?: string;
  date?: Date;
  startInventoryDate?: Date;
  endInventoryDate?: string;
  companyCode?: string;
  companyName?: string;
  warehouseCode?: string;
  warehouse?: string;
  status?: string;

  constructor(data: InventorySyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.ID_INVENTARIO,
      date: data.DATA,
      startInventoryDate: data.DATA_INICIO_CONTAGEM,
      endInventoryDate: data.DATA_FIM_CONTAGEM,
      companyCode: data.CODIGO_EMPRESA,
      companyName: data.EMPRESA,
      warehouseCode: data.CODIGO_ALMOXARIFADO,
      warehouse: data.ALMOXARIFADO,
      status: data.SITUACAO,
    });
  }
}
