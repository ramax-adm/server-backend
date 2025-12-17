export interface SensattaEntitySyncRequestInput {
  ID_ENTIDADE: string;
  CODIGO_ENTIDADE: string;
  NOME: Date;
  FANTASIA: string;
  E_MAIL: string;
  FONE: string;
  UF: string;
  CIDADE: string;
  CEP: string;
  BAIRRO: string;
  ENDERECO: string;
  RELACIONAMENTOS: string;
}
export class SensattaEntitySyncRequestDto {
  sensattaId: string;
  sensattaCode: string;
  name: string;
  fantasyName: string;
  email: string;
  phone: string;
  uf: string;
  city: string;
  zipcode: string;
  neighbourd: string;
  address: string;
  relations: string;

  constructor(data: SensattaEntitySyncRequestInput) {
    Object.assign(this, {
      sensattaId: data.ID_ENTIDADE,
      sensattaCode: data.CODIGO_ENTIDADE,
      name: data.NOME,
      fantasyName: data.FANTASIA,
      email: data.E_MAIL,
      phone: data.FONE,
      uf: data.UF,
      city: data.CIDADE,
      zipcode: data.CEP,
      neighbourd: data.BAIRRO,
      address: data.ENDERECO,
      relations: data.RELACIONAMENTOS,
    });
  }
}
