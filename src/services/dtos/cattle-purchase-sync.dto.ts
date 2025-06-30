export interface CattlePurchaseSyncRequestInput {
  DATA_ABATE: string;
  ID_ORDEM_COMPRA_GADO: string;
  CODIGO_PECUARISTA: string;
  PECUARISTA: string;
  CODIGO_EMPRESA: string;
  RAZAO_SOCIAL_EMPRESA: string;
  CODIGO_ASSESSOR: string;
  NOME_ASSESSOR: string;
  QUANTIDADE_CABECAS: string;
  CLASSIFICACAO_GADO: string;
  //PESO: string;
  ARROBA_CABECA: string;
  PRAZO: string;
  VALOR_FRETE: string;
  VALOR_COMPRA: string;
  COMISSAO: string;
  VALOR_TOTAL: string;
}
export class CattlePurchaseSyncRequestDto {
  slaughterDate: Date;
  purchaseCattleOrderId: string;
  cattleOwnerCode: string;
  cattleOwnerName: string;
  companyCode: string;
  companyName: string;
  cattleAdvisorCode: string;
  cattleAdvisorName: string;
  cattleQuantity: number;
  cattleClassification: string;
  //weight: string;
  cattleWeightInArroba: number;
  paymentTerm: number;
  freightPrice: number;
  purchasePrice: number;
  commissionPrice: number;
  totalValue: number;

  constructor(data: CattlePurchaseSyncRequestInput) {
    Object.assign(this, {
      slaughterDate: data.DATA_ABATE,
      purchaseCattleOrderId: data.ID_ORDEM_COMPRA_GADO?.toString(),
      cattleOwnerCode: data.CODIGO_PECUARISTA?.toString(),
      cattleOwnerName: data.PECUARISTA,
      companyCode: data.CODIGO_EMPRESA?.toString(),
      companyName: data.RAZAO_SOCIAL_EMPRESA,
      cattleAdvisorCode: data.CODIGO_ASSESSOR?.toString(),
      cattleAdvisorName: data.NOME_ASSESSOR,
      cattleQuantity: data.QUANTIDADE_CABECAS,
      cattleClassification: data.CLASSIFICACAO_GADO,
      //weight: data.//PESO,
      cattleWeightInArroba: data.ARROBA_CABECA,
      paymentTerm: data.PRAZO,
      freightPrice: data.VALOR_FRETE,
      purchasePrice: data.VALOR_COMPRA,
      commissionPrice: data.COMISSAO,
      totalValue: data.VALOR_TOTAL,
    });
  }
}
