export interface ProductLineSyncRequestInput {
  SEQUENCIAL_LINHA: string;
  CODIGO_LINHA: string;
  DESCRICAO: string;
  SIGLA: string;
}
export class ProductLineSyncRequestDto {
  sensattaId: string;
  sensattaCode: string;
  name: string;
  acronym: string;

  constructor(data: ProductLineSyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.SEQUENCIAL_LINHA.toString(),
      sensattaCode: data.CODIGO_LINHA.toString(),
      name: data.DESCRICAO,
      acronym: data.SIGLA,
    });
  }
}
