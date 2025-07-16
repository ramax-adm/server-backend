import { StringUtils } from 'src/utils/string.utils';

export interface ProductInvoiceSyncRequestInput {
  TIPO_NOTA: string;
  DATA_EMISSAO: Date;
  CODIGO_TIPO_CLIENTE: string;
  TIPO_CLIENTE: string;
  CODIGO_EMPRESA: string;
  CODIGO_CFOP: string;
  DESC_CFOP: string;
  NOTA_FISCAL: string;
  SEQUENCIAL_PEDIDO: string;
  CODIGO_CLIENTE: string;
  RAZAO_SOCIAL: string;
  CODIGO_PRODUTO: string;
  PRODUTO: string;
  QTDE_CAIXAS: number;
  PESO_LIQUIDO: number;
  VALOR_TOTAL: string;
  VALOR_UNITARIO: string;
}
export class ProductInvoiceSyncRequestDto {
  date: Date;
  nfType: string;
  clientTypeCode: string;
  clientTypeName: string;
  companyCode: string;
  cfopCode: string;
  cfopDescription: string;
  nfNumber: string;
  requestId: string; // sequencial pedido
  clientCode: string;
  clientName: string;
  productCode: string;
  productName: string;
  boxAmount: number;
  weightInKg: number;
  unitPrice: number;
  totalPrice: number;

  constructor(data: ProductInvoiceSyncRequestInput) {
    Object.assign(this, {
      date: data.DATA_EMISSAO,
      nfType: data.TIPO_NOTA,
      clientTypeCode: data.CODIGO_TIPO_CLIENTE?.toString(),
      clientTypeName: data.TIPO_CLIENTE,
      companyCode: data.CODIGO_EMPRESA?.toString(),
      cfopCode: data.CODIGO_CFOP?.toString(),
      cfopDescription: StringUtils.normalize(data.DESC_CFOP),
      nfNumber: data.NOTA_FISCAL,
      requestId: data.SEQUENCIAL_PEDIDO, // sequencial pedido
      clientCode: data.CODIGO_CLIENTE,
      clientName: data.RAZAO_SOCIAL,
      productCode: data.CODIGO_PRODUTO,
      productName: StringUtils.normalize(data.PRODUTO),
      boxAmount: data.QTDE_CAIXAS,
      weightInKg: data.PESO_LIQUIDO,
      unitPrice: data.VALOR_UNITARIO,
      totalPrice: data.VALOR_TOTAL,
    });
  }
}
