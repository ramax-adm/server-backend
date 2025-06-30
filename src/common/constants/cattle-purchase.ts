export const CATTLE_PURCHASE_QUERY = /**sql */ `
SELECT --SEXO
        DATA_ABATE
       ,ID_ORDEM_COMPRA_GADO
       ,CODIGO_PECUARISTA
       ,PECUARISTA
       ,CODIGO_EMPRESA
       ,RAZAO_SOCIAL_EMPRESA
       ,CODIGO_ASSESSOR
       ,NOME_ASSESSOR
       ,QUANTIDADE QUANTIDADE_CABECAS
       ,CLASSIFICACAO  CLASSIFICACAO_GADO
       ,PESO
       ,ROUND(ARROBA_CABECA,2) ARROBA_CABECA
       ,PRAZO
       ,VALOR_FRETE
       ,VALOR_COMPRA_BRUTO VALOR_COMPRA
       ,COMISSAO
       ,TOTAL VALOR_TOTAL            
       
  FROM(
SELECT /*PRG# 8296*/
       trim(user),
       SEXO,
       ID_ORDEM_COMPRA_GADO,
       ID_ACERTO,
       DATA_ABATE,
       CODIGO_FORNECEDOR CODIGO_PECUARISTA,
       PECUARISTA,
       CIDADE,
       CODIGO_EMPRESA,
       RAZAO_SOCIAL RAZAO_SOCIAL_EMPRESA,
       UF,
       RASTREADO,
       PRAZO,
       CLASSIFICACAO,
       QUANTIDADE,
       PESO,
       ARROBA_CABECA,
       VALOR_UNITARIO,
       CASE WHEN (ARROBA_CABECA*QUANTIDADE) = 0 THEN 0 ELSE DECODE(QUANTIDADE,0,0,(VALOR_COMPRA_BRUTO/(ARROBA_CABECA*QUANTIDADE)))END PRECO_VIVO,
       VALOR_COMPRA,
       KM_NEGOCIADO,
       VALOR_FRETE,
       CODIGO_ASSESSOR,
       NOME_ASSESSOR,
       nvl(COMISSAO,0) COMISSAO,
       COMISSAO_VALOR_PAGO,
       COMISSAO_CABECA,
       TOTAL_COMISSAO,
       VALOR_DIF_POR_SEXO,
       METODO_CALCULO,
       (VALOR_COMPRA + VALOR_FRETE + nvl(COMISSAO,0) ) TOTAL,
       ROUND(DECODE( QUANTIDADE, 0,0, (VALOR_COMPRA + VALOR_FRETE + nvl(COMISSAO,0) ) / QUANTIDADE),2) VALOR_CABECA,
       ROUND(DECODE(DECODE( peso_morto,0,TOTAL_PESO_MORTO, PESO),0,0,((VALOR_COMPRA + VALOR_FRETE + nvl(COMISSAO,0) ) / (PESO / DECODE(UNIDADE_COMPRA,'A',15,1)))),2) VALOR_ARROBA,
       ROUND(DECODE(TOTAL_PESO_MORTO,0,0,((VALOR_COMPRA + VALOR_FRETE + nvl(COMISSAO,0) ) / (TOTAL_PESO_MORTO / DECODE(UNIDADE_COMPRA,'A',15,1)))),2) VALOR_ARROBA_MORTO ,
       ROUND(DECODE(DECODE( peso_morto,0,TOTAL_PESO_MORTO, PESO),0,0,((VALOR_COMPRA + VALOR_FRETE + nvl(COMISSAO,0) ) / PESO  )),2) VALOR_KG,    
       VALOR_COMPRA_BRUTO,
       VALOR_ICMS ,
       TOTAL_PESO_MORTO ,
       VALOR_COMPRA_MORTO ,
       PESO TOTAL_PESO,
       DESCRICAO_MOEDA,
       UNIDADE_COMPRA
FROM (
SELECT X.*,
       CASE WHEN X.METODO_CALCULO = 'P' THEN
            X.COMISSAO_VALOR_PAGO
       WHEN X.METODO_CALCULO = 'F' THEN
            X.COMISSAO_VALOR_PAGO
       WHEN X.METODO_CALCULO in ('V','K') AND X.VALOR_DIF_POR_SEXO = 0 THEN
            X.COMISSAO_CABECA
       WHEN X.METODO_CALCULO in ('V','K') AND X.VALOR_DIF_POR_SEXO = 1 THEN
            ROUND((X.TOTAL_COMISSAO * (X.COMISSAO_VALOR_PAGO / SUM(X.COMISSAO_VALOR_PAGO) OVER(PARTITION BY X.ID_ACERTO))),2)
       END COMISSAO
 FROM (
SELECT XY.*,
       CASE WHEN(xy.valor_compra = 0)THEN
                 0
            ELSE
                 ROUND((XY.TOTAL_COMISSAO) * (XY.VALOR_COMPRA / SUM(XY.VALOR_COMPRA) OVER(PARTITION BY XY.ID_ACERTO)),2) END COMISSAO_VALOR_PAGO,
       ROUND(((XY.TOTAL_COMISSAO / SUM(XY.QUANTIDADE) OVER(PARTITION BY XY.ID_ACERTO)) * XY.QUANTIDADE),2) COMISSAO_CABECA
 FROM (
  SELECT tmp.*
        ,round(((tmp.valor_compra_bruto * tmp.aliquota_icms)/100),2) Valor_icms
        ,tmp.valor_compra_bruto valor_compra
        ,tmp.valor_compra_bruto_morto  valor_compra_morto
    FROM (
SELECT TMP1.*,
       DECODE(TMP1.TOTAL_PESO_MORTO,0, 0, ((TMP1.TOTAL_PESO_MORTO / DECODE(UNIDADE_COMPRA,'A',15,1)) * TMP1.VALOR_UNITARIO) ) VALOR_COMPRA_BRUTO_MORTO
  FROM (
SELECT DECODE( EG.SEXO ,'F','F�MEA','M','MACHO') SEXO,
       OC.ID_ORDEM_COMPRA_GADO,
       A.ID_ACERTO,
       LA.DATA DATA_ABATE,
       F.CODIGO_FORNECEDOR,
       F.RAZAO_SOCIAL PECUARISTA,
       CID.DESCRICAO CIDADE,
       EM.CODIGO_EMPRESA,
       EM.RAZAO_SOCIAL,
       EST.UF,
       DECODE(LA.RASTREADO,0,'N','S') RASTREADO,

        (SELECT MAX(NVL(F.DIAS,0))
          FROM SIGMA_PEC.FORMA_PAGAMENTO_ORDEM_COMPRA P,
               SIGMA_MAT.FORMA_PAGAMENTO F
         WHERE P.CODIGO_FORMA_PAGAMENTO = F.CODIGO_FORMA_PAGAMENTO(+)
           AND P.ID_ORDEM_COMPRA_GADO = OC.ID_ORDEM_COMPRA_GADO) PRAZO,

       DECODE(C.SIGLA,'N',CP.DESCRICAO,EG.DESCRICAO||' ('||TRIM(C.DESCRICAO)||')') CLASSIFICACAO,
       LAP.QUANTIDADE QUANTIDADE,
       LAP.PESO_LIQUIDO PESO,
       (LAP.PESO_LIQUIDO / LAP.QUANTIDADE / DECODE(UNIDADE_COMPRA,'A',15,1)) ARROBA_CABECA,
       LAP.VALOR_UNITARIO,
       oc.peso_morto ,

       round((DECODE(LAP.PESO_LIQUIDO,0,0,
             decode(oc.peso_morto,1,DECODE(LAP.PESO_LIQUIDO,0, 0, ((LAP.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * round(LAP.VALOR_UNITARIO,2))),
                      (lap.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * round(lap.valor_unitario,2)))),2)  VALOR_COMPRA_BRUTO,

      SUM(round((DECODE(LAP.PESO_LIQUIDO,0,0,decode(oc.peso_morto,1,DECODE(LAP.PESO_LIQUIDO,0, 0, ((LAP.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * LAP.VALOR_UNITARIO)),(lap.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * lap.valor_unitario))),2)) over(PARTITION BY oc.id_ordem_compra_gado) valor_compra_total_oc,

      CASE WHEN (SUM(round((DECODE(LAP.PESO_LIQUIDO,0,0,decode(oc.peso_morto,1,DECODE(LAP.PESO_LIQUIDO,0, 0, ((LAP.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * LAP.VALOR_UNITARIO)),(lap.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * lap.valor_unitario))),2)) over(PARTITION BY oc.id_ordem_compra_gado)) = 0 THEN 0
        ELSE  round((DECODE(LAP.PESO_LIQUIDO,0,0,decode(oc.peso_morto,1,DECODE(LAP.PESO_LIQUIDO,0, 0, ((LAP.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * LAP.VALOR_UNITARIO)),(lap.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * lap.valor_unitario))),2) /
              SUM(round((DECODE(LAP.PESO_LIQUIDO,0,0,decode(oc.peso_morto,1,DECODE(LAP.PESO_LIQUIDO,0, 0, ((LAP.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * LAP.VALOR_UNITARIO)),(lap.PESO_LIQUIDO / DECODE(UNIDADE_COMPRA,'A',15,1)) * lap.valor_unitario))),2)) over(PARTITION BY oc.id_ordem_compra_gado)
      END aliquota_rateio_oc,

      (SELECT NVL(R.KM_NEGOCIADO,0) + NVL(R.KM_NEGOCIADO_TERRA,0)
          FROM SIGMA_PEC.RECEBIMENTO_GADO R
         WHERE R.ID_ORDEM_COMPRA_GADO = OC.ID_ORDEM_COMPRA_GADO
           AND R.ID_PROPRIEDADE_RURAL = A.ID_PROPRIEDADE_RURAL
           AND ROWNUM = 1) KM_NEGOCIADO,

       ROUND(NVL(((SELECT (SELECT NVL(SUM(DECODE(EC.OPERACAO,
                                                          'C',
                                                          CC.VALOR,
                                                          0)) -
                                               SUM(DECODE(EC.OPERACAO,
                                                          'D',
                                                          CC.VALOR,
                                                          0)),
                                               0)
                                      FROM SIGMA_VEN.CONTA_CORRENTE_ENTIDADE CC,
                                           SIGMA_FIN.ESPECIE_COMISSAO        EC,
                                           SIGMA_PEC.RECEBIMENTO_GADO        R
                                     WHERE CC.ID_TIPO_ENTIDADE = 7
                                       AND CC.SEQUENCIAL_ESPECIE_COMISSAO =
                                           EC.SEQUENCIAL_ESPECIE_COMISSAO
                                       AND CC.DOCUMENTO =
                                           TO_CHAR(R.ID_RECEBIMENTO_GADO)
                                       AND CC.SEQUENCIAL_NOTA_SAIDA IS NULL
                                       AND CC.TIPO = 'FG'
                                       AND R.ID_ORDEM_COMPRA_GADO =
                                           OC.ID_ORDEM_COMPRA_GADO) /

                          (SELECT SUM(LP.QUANTIDADE) QUANT
                             FROM SIGMA_PEC.LOTE_ABATE L,
                                  SIGMA_PEC.LOTE_ABATE_PRECO LP
                            WHERE L.ID_LOTE_ABATE = LP.ID_LOTE_ABATE
                              and decode(o.peso_morto,1,'M','V') = lp.tipo_peso
                              AND L.ID_ORDEM_COMPRA_GADO = O.ID_ORDEM_COMPRA_GADO)
                     FROM SIGMA_PEC.ORDEM_COMPRA_GADO O
                    WHERE O.ID_ORDEM_COMPRA_GADO  = OC.ID_ORDEM_COMPRA_GADO)) * (LAP.QUANTIDADE),0),2) VALOR_FRETE,

       ASSESSOR.CODIGO_ENTIDADE CODIGO_ASSESSOR,
       ASSESSOR.NOME NOME_ASSESSOR,
       ANF.ALIQUOTA_ICMS,
       TC.METODO_CALCULO,
       TC.TIPO_VALOR_PERCENTUAL,
       NVL((SELECT SUM(DECODE(EC.OPERACAO,'C',CC.VALOR,0)) - SUM (
            CASE WHEN(EC.OPERACAO ='D') AND (CC.ORIGEM <> 'E') THEN
                       CC.VALOR
                 ELSE 0
            END) VALOR_COMISSAO

              FROM SIGMA_VEN.CONTA_CORRENTE_ENTIDADE CC,
                   SIGMA_FIN.ESPECIE_COMISSAO EC,
                   SIGMA_PEC.ACERTO A
             WHERE CC.ID_ACERTO = A.ID_ACERTO
               AND A.CANCELADO = 0
               AND A.ID_ORDEM_COMPRA_GADO = OC.ID_ORDEM_COMPRA_GADO
               AND CC.SEQUENCIAL_ESPECIE_COMISSAO = EC.SEQUENCIAL_ESPECIE_COMISSAO
               AND CC.ID_TIPO_ENTIDADE = 10)   ,0) TOTAL_COMISSAO,

       CASE WHEN ((OC.PESO_MORTO = 1) AND (TC.VALOR_CABECA_FEMEA_MORTO <> TC.VALOR_CABECA_MACHO_MORTO)) OR
                 ((OC.PESO_MORTO = 0) AND (TC.VALOR_CABECA_FEMEA_VIVO  <> TC.VALOR_CABECA_MACHO_VIVO)) THEN 1
            ELSE 0
       END VALOR_DIF_POR_SEXO,

           (SELECT SUM(LP1.PESO_LIQUIDO)
              FROM SIGMA_PEC.LOTE_ABATE_PRECO LP1 ,
                   SIGMA_PEC.CLASSIFICACAO_PESAGEM CP1
             WHERE LP1.ID_LOTE_ABATE             = LA.ID_LOTE_ABATE
               AND LP1.ID_CLASSIFICACAO_PESAGEM  = CP1.ID_CLASSIFICACAO_PESAGEM
               AND CP1.ID_ESPECIE_GADO           = EG.ID_ESPECIE_GADO
               AND LP1.TIPO_PESO                 = 'M' ) TOTAL_PESO_MORTO  ,
       OC.aliquota_funrural ,
       OC.FUNRURAL_LIVRE,
       ID.DESCRICAO DESCRICAO_MOEDA,
       PAR.UNIDADE_COMPRA

  FROM SIGMA_PEC.ORDEM_COMPRA_GADO OC,
       SIGMA_PEC.ACERTO A,
       SIGMA_PEC.ACERTO_NOTA_FISCAL ANF,
       SIGMA_PEC.ACERTO_LOTE AL,
       SIGMA_PEC.LOTE_ABATE LA,
       SIGMA_PEC.LOTE_ABATE_PRECO LAP,
       SIGMA_PEC.CLASSIFICACAO_PESAGEM CP,
       SIGMA_PEC.TIPIFICACAO_GADO C,
       SIGMA_PEC.ESPECIE_GADO EG,
       SIGMA_PEC.PROPRIEDADE_RURAL P,
       SIGMA_FIN.CEP,
       SIGMA_FIN.CIDADE CID,
       SIGMA_MAT.ESTADO EST,
       SIGMA_MAT.NOTA_ENTRADA NE,
       SIGMA_MAT.FORNECEDOR F,
       SIGMA_VEN.ENTIDADE ASSESSOR,
       SIGMA_PEC.ASSESSOR_PECUARIO AP,
       SIGMA_PEC.TIPO_COMISSAO TC,
       SIGMA_FIS.EMPRESA EM,
       SIGMA_FIN.INDICE ID,
       SIGMA_PEC.PARAMETRO_ORDEM_COMPRA_GADO PAR

    WHERE PAR.CODIGO_EMPRESA = OC.CODIGO_EMPRESA
      AND EST.UF = CID.UF
      AND CID.CODIGO = CEP.CODIGO_CIDADE
      AND CEP.CEP = P.CEP
      AND TC.ID_TIPO_COMISSAO(+) = AP.ID_TIPO_COMISSAO
      AND ASSESSOR.ID_ENTIDADE(+) = AP.ID_ENTIDADE
      AND AP.ID_ENTIDADE(+) = OC.ID_ENTIDADE_ACESSOR
      AND NE.CODIGO_FORNECEDOR = F.CODIGO_FORNECEDOR
      AND P.ID_PROPRIEDADE_RURAL = A.ID_PROPRIEDADE_RURAL
      AND EG.ID_ESPECIE_GADO = CP.ID_ESPECIE_GADO
      AND C.ID_TIPIFICACAO_GADO(+) = LAP.ID_TIPIFICACAO_GADO
      AND CP.ID_CLASSIFICACAO_PESAGEM = LAP.ID_CLASSIFICACAO_PESAGEM
      AND LAP.ID_LOTE_ABATE = LA.ID_LOTE_ABATE
      AND LA.ID_LOTE_ABATE = AL.ID_LOTE_ABATE
      AND AL.ID_ACERTO = A.ID_ACERTO
      AND A.ID_ORDEM_COMPRA_GADO = OC.ID_ORDEM_COMPRA_GADO
      AND A.CANCELADO = 0
      AND NE.TIPO IS NULL
      AND A.ID_ACERTO = ANF.ID_ACERTO
      AND NE.SEQUENCIAL_NOTA_ENTRADA = ANF.SEQUENCIAL_NOTA_ENTRADA     
      AND OC.CODIGO_EMPRESA = EM.CODIGO_EMPRESA
      AND decode(oc.peso_morto,1,'M','V') = lap.tipo_peso
      --Filtros
       AND LA.DATA >= to_date($1)
      --AND OC.CODIGO_EMPRESA = $2
      AND anf.id_acerto_nota_fiscal = (SELECT MIN(anf1.id_acerto_nota_fiscal)
                                         FROM sigma_pec.acerto_nota_fiscal anf1
                                        WHERE anf1.id_acerto = anf.id_acerto
                                          and anf1.sequencial_nota_entrada is not null)
      AND OC.CODIGO_INDICE = ID.CODIGO_INDICE
)TMP1
)tmp
) XY
) X
   ORDER BY  X.SEXO,
             X.DATA_ABATE,
             X.PECUARISTA
)
)T
`;
