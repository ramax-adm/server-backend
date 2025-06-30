export interface StockBalanceSyncRequestInput {
  CODIGO_LINHA: string;
  DESCRICAO_LINHA: string;
  CODIGO_PRODUTO: string;
  DESCRICAO_PRODUTO: string;
  CODIGO_EMPRESA: string;
  NOME_EMPRESA: string;
  PESO_ESTOQUE: number;
  QUANTIDADE_ESTOQUE: number;
  PESO_RESERVADO_PRODUTO: number;
  QUANTIDADE_RESERVADA_PRODUTO: number;
  PESO_DISPONIVEL: number;
  QUANTIDADE_DISPONIVEL: number;
}
export class StockBalanceSyncRequestDto {
  productLineCode: string;
  productLineName: string;
  productCode: string;
  productName: string;
  companyCode: string;
  companyName: string;
  weightInKg: number;
  quantity: number;
  reservedWeightInKg: number;
  reservedQuantity: number;
  availableWeightInKg: number;
  availableQuantity: number;

  constructor(data: StockBalanceSyncRequestInput) {
    Object.assign(this, {
      productLineCode: data.CODIGO_LINHA,
      productLineName: data.DESCRICAO_LINHA,
      productCode: data.CODIGO_PRODUTO,
      productName: data.DESCRICAO_PRODUTO,
      companyCode: data.CODIGO_EMPRESA,
      companyName: data.NOME_EMPRESA,
      weightInKg: data.PESO_ESTOQUE,
      quantity: data.QUANTIDADE_ESTOQUE,
      reservedWeightInKg: data.PESO_RESERVADO_PRODUTO,
      reservedQuantity: data.QUANTIDADE_RESERVADA_PRODUTO,
      availableWeightInKg: data.PESO_DISPONIVEL,
      availableQuantity: data.QUANTIDADE_DISPONIVEL,
    });
  }
}
