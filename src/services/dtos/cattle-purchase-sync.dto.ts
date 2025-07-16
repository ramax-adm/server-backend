export interface CattlePurchaseSyncRequestInput {
  DATA_ABATE: string;
  ID_ORDEM_COMPRA_GADO: string;
  CODIGO_PECUARISTA: string;
  PECUARISTA: string;
  CODIGO_EMPRESA: string;
  RAZAO_SOCIAL_EMPRESA: string;
  CODIGO_ASSESSOR: string;
  NOME_ASSESSOR: string;
  QUANTIDADE_CABECAS: number;
  CLASSIFICACAO_GADO: string;
  //PESO: string;
  TIPO_PESAGEM: string;
  ARROBA_CABECA: number;
  PRAZO: number;
  VALOR_FRETE: number;
  VALOR_COMPRA: number;
  COMISSAO: number;
  VALOR_TOTAL: number;
  FUNRURAL: number;
  PESAGEM_BALANCA: number;
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
  weighingType: string;
  cattleWeightInArroba: number;
  balanceWeightInKg: number;
  paymentTerm: number;
  freightPrice: number;
  funruralPrice: number;
  purchasePrice: number;
  purchaseLiquidPrice: number;
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
      weighingType: data.TIPO_PESAGEM,
      cattleWeightInArroba: data.ARROBA_CABECA,
      balanceWeightInKg: data.PESAGEM_BALANCA,
      paymentTerm: data.PRAZO,
      freightPrice: data.VALOR_FRETE,
      funruralPrice: data.FUNRURAL,
      purchasePrice: data.VALOR_COMPRA,
      purchaseLiquidPrice: data.VALOR_COMPRA - data.FUNRURAL,
      commissionPrice: data.COMISSAO,
      totalValue: data.VALOR_TOTAL,
    });
  }
}
