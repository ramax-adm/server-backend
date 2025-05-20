export interface AccountGroupSyncRequestInput {
  CODIGO_GRUPO_EMPENHO: string;
  GRUPO_EMPENHO: string;
  TIPO: string;
}
export class AccountGroupSyncRequestDto {
  sensattaCode: string;
  name: string;
  type: string;

  constructor(data: AccountGroupSyncRequestInput) {
    Object.assign(this, {
      sensattaCode: data.CODIGO_GRUPO_EMPENHO.toString(),
      name: data.GRUPO_EMPENHO,
      type: data.TIPO,
    });
  }
}
