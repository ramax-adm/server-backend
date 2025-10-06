export interface CattlePurchaseFreightsSyncRequestInput {
  DATA_ABATE: string;
  DATA_RECEBIMENTO: string;
  DATA_FECHAMENTO_FRETE: string | null;
  ID_ORDEM_COMPRA_GADO: number;
  CODIGO_EMPRESA: number;
  NOME_EMPRESA: string;
  TIPO_FROTA: string;
  CAPACIDADE_UN: number;
  PLACA_CAMINHAO: string;
  CODIGO_TRANSPORTADORA: number;
  NOME_TRANSPORTADORA: string;
  CODIGO_FORNECEDOR: number;
  NOME_FORNECEDOR: string;
  CODIGO_ASSESSOR: number;
  NOME_ASSESSOR: string;
  CIDADE_ORIGEM: string;
  ID_PROPRIEDADE_RURAL: number;
  NOME_PROPRIEDADE_RURAL: string;
  KM_PROPRIEDADE: string | null;
  KM_NEGOCIADO: number;
  QUANTIDADE_CABECA: number;
  //CABECAS_NF: number;
  VALOR_FRETE_TABELA: number;
  VALOR_FRETE_NEGOCIADO: string | null;
  VALOR_PEDAGIO: string | null;
  VALOR_ASFALTO: string | null;
  VALOR_TERRA: string | null;
  VALOR_SAIDA: string | null;
  VALOR_ADICIONAL: string | null;
  VALOR_DESCONTO: string | null;
  //VALOR_NOTA_FRETE: number;
  NOTA_ENTRADA: number;
  NOTA_COMPLEMENTO: string | null;
  ESPECIE: string;
}
export class CattlePurchaseFreightsSyncRequestDto {
  slaughterDate: Date;
  freightClosingDate: Date | null;
  receiptDate: Date | null;
  purchaseCattleOrderId: string;
  companyCode: string;
  freightCompanyCode: string;
  freightCompanyName: string;
  supplierCode: string;
  supplierName: string;
  cattleAdvisorCode: string;
  cattleAdvisorName: string;
  freightTransportType: string;
  freightTransportCapacity: number;
  freightTransportPlate: string;
  originCity: string;
  feedlotId: string;
  feedlotName: string;
  feedlotKmDistance: number;
  negotiatedKmDistance: number;
  cattleQuantity: number;
  //nfCattleQuantity: number;
  referenceFreightTablePrice: number;
  negotiatedFreightPrice: number;
  tollPrice: number;
  roadPrice: number;
  earthPrice: number;
  outingPrice: number;
  additionalPrice: number;
  discountPrice: number;

  //nfFreightPrice: number;
  entryNf: string;
  complementNf: string;
  nfType: string;

  constructor(data: CattlePurchaseFreightsSyncRequestInput) {
    Object.assign(this, {
      slaughterDate: data.DATA_ABATE,
      freightClosingDate: data.DATA_FECHAMENTO_FRETE,
      receiptDate: data.DATA_RECEBIMENTO,
      purchaseCattleOrderId: data.ID_ORDEM_COMPRA_GADO?.toString(),
      companyCode: data.CODIGO_EMPRESA?.toString(),
      freightCompanyCode: data.CODIGO_TRANSPORTADORA?.toString(),
      freightCompanyName: data.NOME_TRANSPORTADORA?.toString(),
      supplierCode: data.CODIGO_FORNECEDOR?.toString(),
      supplierName: data.NOME_FORNECEDOR?.toString(),
      cattleAdvisorCode: data.CODIGO_ASSESSOR?.toString(),
      cattleAdvisorName: data.NOME_ASSESSOR?.toString(),
      freightTransportType: data.TIPO_FROTA?.toString(),
      freightTransportCapacity: data.CAPACIDADE_UN,
      freightTransportPlate: data.PLACA_CAMINHAO?.toString(),
      originCity: data.CIDADE_ORIGEM?.toString(),
      feedlotId: data.ID_PROPRIEDADE_RURAL?.toString(),
      feedlotName: data.NOME_PROPRIEDADE_RURAL?.toString(),
      feedlotKmDistance: Number(data.KM_PROPRIEDADE),
      negotiatedKmDistance: Number(data.KM_NEGOCIADO),
      cattleQuantity: Number(data.QUANTIDADE_CABECA),
      //nfCattleQuantity: Number(data.CABECAS_NF),
      referenceFreightTablePrice: Number(data.VALOR_FRETE_TABELA),
      negotiatedFreightPrice: Number(data.VALOR_FRETE_NEGOCIADO),
      tollPrice: Number(data.VALOR_PEDAGIO),
      roadPrice: Number(data.VALOR_ASFALTO),
      earthPrice: Number(data.VALOR_TERRA),
      outingPrice: Number(data.VALOR_SAIDA),
      additionalPrice: Number(data.VALOR_ADICIONAL),
      discountPrice: Number(data.VALOR_DESCONTO),

      //nfFreightPrice: Number(data.VALOR_NOTA_FRETE),
      entryNf: data.NOTA_ENTRADA?.toString(),
      complementNf: data.NOTA_COMPLEMENTO?.toString(),
      nfType: data.ESPECIE?.toString(),
    });
  }
}
