import { StringUtils } from 'src/utils/string.utils';

export interface ProductSyncRequestInput {
  SEQUENCIAL_PRODUTO: string;
  CODIGO_PRODUTO: string;
  DESCRICAO: string;
  SEQUENCIAL_LINHA: string;
  CODIGO_UNIDADE_MEDIDA: string;
  TIPO_CLASSIFICACAO: string;
}
export class ProductSyncRequestDto {
  sensattaId: string;
  sensattaCode: string;
  name: string;
  productLineId: string;
  unitCode: string;
  classificationType: string;

  constructor(data: ProductSyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.SEQUENCIAL_PRODUTO,
      sensattaCode: data.CODIGO_PRODUTO,
      name: StringUtils.normalize(data.DESCRICAO),
      productLineId: data.SEQUENCIAL_LINHA,
      unitCode: data.CODIGO_UNIDADE_MEDIDA,
      classificationType: data.TIPO_CLASSIFICACAO,
    });
  }
}
