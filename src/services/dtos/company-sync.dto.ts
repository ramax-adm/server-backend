export interface CompanySyncRequestInput {
  CODIGO_EMPRESA: string;
  NOME_FANTASIA: string;
  UF: string;
  CIDADE: string;
}
export class CompanySyncRequestDto {
  sensattaCode: string;
  fantasyName: string;
  uf: string;
  city: string;
  name: string;

  constructor(data: CompanySyncRequestInput) {
    Object.assign(this, {
      sensattaCode: data.CODIGO_EMPRESA.toString(),
      fantasyName: data.NOME_FANTASIA,
      uf: data.UF,
      city: data.CIDADE,
      name: 'NEW',
    });
  }
}
