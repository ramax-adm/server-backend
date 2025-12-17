import { StringUtils } from 'src/utils/string.utils';

export interface InvoiceSyncRequestInput {
  TIPO_NOTA: string;
  TIPO_DOCUMENTO: string;
  SITUACAO: string;
  DATA_EMISSAO: Date;
  CODIGO_TIPO_CLIENTE: string;
  TIPO_CLIENTE: string;
  CODIGO_EMPRESA: string;
  OPERACAO: string;
  CATEGORIA_PEDIDO: string;
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
  nfDocumentType: string;
  nfId: string;
  clientTypeCode: string;
  clientTypeName: string;
  companyCode: string;
  cfopCode: string;
  cfopDescription: string;
  nfNumber: string;
  orderId: string; // sequencial pedido
  orderCategory: string;
  orderOperation: string;
  clientCode: string;
  clientName: string;
  productCode: string;
  productName: string;
  quantity: number;
  weightInKg: number;
  unitPrice: number;
  totalPrice: number;

  constructor(data: InvoiceSyncRequestInput) {
    Object.assign(this, {
      date: data.DATA_EMISSAO,
      nfSituation: data.SITUACAO,
      nfType: data.TIPO_NOTA,
      nfDocumentType: data.TIPO_DOCUMENTO,
      nfId: data.SEQUENCIAL_NOTA_SAIDA,
      clientTypeCode: data.CODIGO_TIPO_CLIENTE?.toString(),
      clientTypeName: data.TIPO_CLIENTE,
      companyCode: data.CODIGO_EMPRESA?.toString(),
      cfopCode: data.CODIGO_CFOP?.toString(),
      cfopDescription: data.DESC_CFOP?.trim(),
      nfNumber: data.NOTA_FISCAL,
      orderId: data.SEQUENCIAL_PEDIDO, // sequencial pedido
      orderCategory: data.CATEGORIA_PEDIDO,
      orderOperation: data.OPERACAO,
      clientCode: data.CODIGO_CLIENTE,
      clientName: data.RAZAO_SOCIAL?.trim(),
      productCode: data.CODIGO_PRODUTO,
      productName: data.PRODUTO?.trim(),
      quantity: data.QTDE_CAIXAS,
      weightInKg: data.PESO_LIQUIDO,
      unitPrice: data.VALOR_UNITARIO,
      totalPrice: data.VALOR_TOTAL,
    });
  }
}
