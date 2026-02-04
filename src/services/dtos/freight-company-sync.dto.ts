export interface FreightCompanySyncRequestInput {
  SEQUENCIAL_TRANSPORTADORA: string;
  CODIGO_ENTIDADE: string;
  NOME: string;
  RAZAO_SOCIAL: string;
  CPF_CNPJ: Date;
  INSCRICAO_ESTADUAL: string;
  CEP: string;
  BAIRRO: string;
  ENDERECO: string;
  CIDADE: string;
  UF: string;
  E_MAIL: string;
}
export class FreightCompanySyncRequestDto {
  sensattaId?: string;
  sensattaCode?: string;
  name?: string;
  fantasyName?: string;
  cnpj?: string;
  stateSubscription?: string;
  zipcode?: string;
  neighborhood?: string;
  address?: string;
  city?: string;
  email?: string;
  uf?: string;

  constructor(data: FreightCompanySyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.SEQUENCIAL_TRANSPORTADORA,
      sensattaCode: data.CODIGO_ENTIDADE,
      name: data.RAZAO_SOCIAL,
      fantasyName: data.NOME,
      cnpj: data.CPF_CNPJ,
      stateSubscription: data.INSCRICAO_ESTADUAL,
      zipcode: data.CEP,
      neighborhood: data.BAIRRO,
      address: data.ENDERECO,
      city: data.CIDADE,
      email: data.E_MAIL,
      uf: data.UF,
    });
  }
}
