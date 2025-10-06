export interface ReturnOccurrenceSyncRequestInput {
  DATA_DEVOLUCAO: Date;
  DATA_FATURAMENTO: Date;
  BO: string;
  CODIGO_EMPRESA: string;
  EMPRESA: string;
  CODIGO_CLIENTE: string;
  CLIENTE: string;
  CODIGO_REPRESENTANTE: string;
  REPRESENTANTE: string;
  TIPO_DEVOLUCAO: string;
  MOTIVO_DEVOLUCAO: string;
  OBSERVACAO: string;
  CODIGO_PRODUTO: string;
  DESCRICAO: string;
  NF_FATURAMENTO_ITEM_PEDIDO: string;
  SEQUENCIAL_PEDIDO: string;
  SEQUENCIAL_ITEM_PEDIDO: string;
  NF_FATURAMENTO: string;
  QUANTIDADE_FATURAMENTO: number;
  PESO_FATURAMENTO_KG: number;
  VALOR_UN_FATURAMENTO: number;
  VALOR_TOTAL_FATURAMENTO: number;
  SEQUENCIAL_NOTA_ENTRADA: string;
  NF_DEVOLUCAO: number;
  QUANTIDADE_DEVOLVIDA: number;
  PESO_DEVOLVIDA_KG: number;
  VALOR_UN_DEVOLUCAO: number;
  VALOR_TOTAL_DEVOLUCAO: number;
}

export class ReturnOccurrenceSyncRequestDto {
  date: Date;
  invoiceDate: Date;
  occurrenceNumber: string;
  companyCode: string;
  companyName: string;
  clientCode: string;
  clientName: string;
  salesRepresentativeCode: string;
  salesRepresentativeName: string;
  occurrenceCause: string;
  returnType: string;
  observation: string;
  productCode: string;
  productName: string;
  invoiceNf: string;
  invoiceQuantity: number;
  invoiceWeightInKg: number;
  invoiceUnitValue: number;
  invoiceValue: number;
  returnNf: string;
  returnQuantity: number;
  returnWeightInKg: number;
  returnUnitValue: number;
  returnValue: number;

  constructor(data: ReturnOccurrenceSyncRequestInput) {
    Object.assign(this, {
      date: data.DATA_DEVOLUCAO,
      invoiceDate: data.DATA_FATURAMENTO,
      occurrenceNumber: data.BO,
      companyCode: data.CODIGO_EMPRESA,
      companyName: data.EMPRESA,
      clientCode: data.CODIGO_CLIENTE,
      clientName: data.CLIENTE,
      salesRepresentativeCode: data.CODIGO_REPRESENTANTE,
      salesRepresentativeName: data.REPRESENTANTE,
      occurrenceCause: data.MOTIVO_DEVOLUCAO,
      returnType: data.TIPO_DEVOLUCAO,
      observation: data.OBSERVACAO,
      productCode: data.CODIGO_PRODUTO,
      productName: data.DESCRICAO,
      invoiceNf: data.NF_FATURAMENTO,
      invoiceQuantity: data.QUANTIDADE_FATURAMENTO,
      invoiceWeightInKg: data.PESO_FATURAMENTO_KG,
      invoiceUnitValue: data.VALOR_UN_FATURAMENTO,
      invoiceValue: data.VALOR_TOTAL_FATURAMENTO,
      returnNf: data.NF_DEVOLUCAO,
      returnQuantity: data.QUANTIDADE_DEVOLVIDA,
      returnWeightInKg: data.PESO_DEVOLVIDA_KG,
      returnUnitValue: data.VALOR_UN_DEVOLUCAO,
      returnValue: data.VALOR_TOTAL_DEVOLUCAO,
    });
  }
}
