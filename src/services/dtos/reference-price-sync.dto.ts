/**
 *  SEQUENCIAL_ITEM_PRECO: 'sensattaId',
              SEQUENCIAL_PRODUTO: 'productId',
              SEQUENCIAL_TABELA_PRECO: 'mainPriceTableId',
              CODIGO_EMPRESA: 'companyCode',
              NUMERO_TABELA: 'mainTableNumber',
              DESCRICAO: 'mainDescription',
              PRECO: 'price',
 */

export interface ReferencePriceSyncRequestInput {
  SEQUENCIAL_ITEM_PRECO: string;
  SEQUENCIAL_PRODUTO: string;
  SEQUENCIAL_TABELA_PRECO: string;
  CODIGO_EMPRESA: string;
  NUMERO_TABELA: number;
  DESCRICAO: string;
  PRECO: number;
}
export class ReferencePriceSyncRequestDto {
  sensattaId: string;
  productId: string;
  mainPriceTableId: string;
  companyCode: string;
  mainTableNumber: string;
  mainDescription: string;
  price: number;

  constructor(data: ReferencePriceSyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.SEQUENCIAL_ITEM_PRECO,
      productId: data.SEQUENCIAL_PRODUTO,
      mainPriceTableId: data.SEQUENCIAL_TABELA_PRECO,
      companyCode: data.CODIGO_EMPRESA,
      mainTableNumber: data.NUMERO_TABELA.toString(),
      mainDescription: data.DESCRICAO,
      price: data.PRECO,
    });
  }
}
