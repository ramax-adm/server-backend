export interface ClientSyncRequestInput {
  CODIGO_CLIENTE: string;
  RAZAO_SOCIAL: Date;
  NOME_FANTAZIA: string;
  INSCRICAO_ESTADUAL: string;
  E_MAIL: string;
  FONE: string;
  UF: string;
  CIDADE: string;
  CEP: string;
  BAIRRO: string;
  ENDERECO: string;
}
export class ClientSyncRequestDto {
  sensattaCode: string;
  name: string;
  fantasyName: string;
  stateSubscription: string;
  email: string;
  phone: string;
  uf: string;
  city: string;
  zipcode: string;
  neighbourd: string;
  address: string;

  constructor(data: ClientSyncRequestInput) {
    Object.assign(this, {
      sensattaCode: data.CODIGO_CLIENTE,
      name: data.RAZAO_SOCIAL,
      fantasyName: data.NOME_FANTAZIA,
      stateSubscription: data.INSCRICAO_ESTADUAL,
      email: data.E_MAIL,
      phone: data.FONE,
      uf: data.UF,
      city: data.CIDADE,
      zipcode: data.CEP,
      neighbourd: data.BAIRRO,
      address: data.ENDERECO,
    });
  }
}
