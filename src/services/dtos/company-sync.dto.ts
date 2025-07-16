export interface CompanySyncRequestInput {
  CODIGO_EMPRESA: string;
  NOME_FANTASIA: string;
  UF: string;
  CIDADE: string;
  ENDERECO: string;
  BAIRRO: string;
  CEP: string;
  FONE: string;
  E_MAIL: string;
  INSCRICAO_ESTADUAL: string;
}
export class CompanySyncRequestDto {
  sensattaCode: string;
  fantasyName: string;
  uf: string;
  city: string;
  name: string;
  address: string;
  neighbourd: string;
  zipcode: string;
  phone: string;
  email: string;
  stateSubscription: string;

  constructor(data: CompanySyncRequestInput) {
    Object.assign(this, {
      sensattaCode: data.CODIGO_EMPRESA.toString(),
      fantasyName: data.NOME_FANTASIA,
      uf: data.UF,
      city: data.CIDADE,
      name: 'NEW',
      address: data.ENDERECO,
      neighbourd: data.BAIRRO,
      zipcode: data.CEP,
      phone: data.FONE,
      email: data.E_MAIL,
      stateSubscription: data.INSCRICAO_ESTADUAL,
    });
  }
}
