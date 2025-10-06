import { StringUtils } from 'src/utils/string.utils';

export interface InvoiceSyncRequestInput {
  TIPO_NOTA: string;
  SITUACAO: string;
  DATA_EMISSAO: Date;
  CODIGO_TIPO_CLIENTE: string;
  TIPO_CLIENTE: string;
  CODIGO_EMPRESA: string;
  CODIGO_CFOP: string;
  DESC_CFOP: string;
  NOTA_FISCAL: string;
  SEQUENCIAL_PEDIDO: string;
  SEQUENCIAL_NOTA_SAIDA: string;
  CODIGO_CLIENTE: string;
  RAZAO_SOCIAL: string;
  CODIGO_PRODUTO: string;
  PRODUTO: string;
  QTDE_CAIXAS: number;
  PESO_LIQUIDO: number;
  VALOR_TOTAL: string;
  VALOR_UNITARIO: string;
}
export class InvoiceSyncRequestDto {
  date: Date;
  nfSituation: string;
  nfType: string;
  nfId: string;
  clientTypeCode: string;
  clientTypeName: string;
  companyCode: string;
  cfopCode: string;
  cfopDescription: string;
  nfNumber: string;
  orderId: string; // sequencial pedido
  clientCode: string;
  clientName: string;
  productCode: string;
  productName: string;
  boxAmount: number;
  weightInKg: number;
  unitPrice: number;
  totalPrice: number;

  constructor(data: InvoiceSyncRequestInput) {
    Object.assign(this, {
      date: data.DATA_EMISSAO,
      nfSituation: data.SITUACAO,
      nfType: data.TIPO_NOTA,
      nfId: data.SEQUENCIAL_NOTA_SAIDA,
      clientTypeCode: data.CODIGO_TIPO_CLIENTE?.toString(),
      clientTypeName: data.TIPO_CLIENTE,
      companyCode: data.CODIGO_EMPRESA?.toString(),
      cfopCode: data.CODIGO_CFOP?.toString(),
      cfopDescription: data.DESC_CFOP?.trim(),
      nfNumber: data.NOTA_FISCAL,
      orderId: data.SEQUENCIAL_PEDIDO, // sequencial pedido
      clientCode: data.CODIGO_CLIENTE,
      clientName: data.RAZAO_SOCIAL?.trim(),
      productCode: data.CODIGO_PRODUTO,
      productName: data.PRODUTO?.trim(),
      boxAmount: data.QTDE_CAIXAS,
      weightInKg: data.PESO_LIQUIDO,
      unitPrice: data.VALOR_UNITARIO,
      totalPrice: data.VALOR_TOTAL,
    });
  }
}
