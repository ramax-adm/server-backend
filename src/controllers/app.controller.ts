import { Controller, Get, Inject } from '@nestjs/common';
import { OdbcService } from '../config/database/obdc/odbc.service';

@Controller()
export class AppController {
  constructor(
    @Inject('ODBC SERVICE')
    private readonly odbcService: OdbcService,
  ) {}

  @Get('sensatta')
  async testSensatta() {
    const response = await this.odbcService.query(`
SELECT 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO AS TIPO_MOVIMENTACAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO,
    COUNT(*) AS CAIXAS,
    SUM(LE.QUANTIDADE) AS QUANTIDADE,
    SUM(LE.PESO) AS PESO
    
FROM sigma_pcp.lote_entrada LE
JOIN SIGMA_MAT.ALMOXARIFADO AM ON LE.CODIGO_ALMOXARIFADO = AM.CODIGO_ALMOXARIFADO
JOIN SIGMA_MAT.TIPO_MOVIMENTACAO TM ON LE.TIPO_MOVIMENTO = TM.CODIGO_TIPO_MOVIMENTACAO
JOIN sigma_fis.empresa EMP ON AM.CODIGO_EMPRESA = EMP.codigo_empresa
JOIN SIGMA_VEN.PRODUTO P ON LE.SEQUENCIAL_PRODUTO = P.SEQUENCIAL_PRODUTO
JOIN SIGMA_VEN.LINHA L ON P.SEQUENCIAL_LINHA = L.SEQUENCIAL_LINHA
      

WHERE LE.EXPEDIDO = 0
  AND LE.CANCELADO = 0 
GROUP BY 
    LE.DATA_PRODUCAO,
    LE.DATA_ABATE,
    LE.DATA_IMPRESSA,
    LE.DATA_VALIDADE,
    TM.DESCRICAO,
    EMP.CODIGO_EMPRESA,
    L.CODIGO_LINHA,
    P.CODIGO_PRODUTO,
    LE.CODIGO_ALMOXARIFADO;
      `);

    return response;
  }
}
