export const TEMP_BALANCETE_QUERY = `
/*==============================================================================
   BALANCETE MÊS A MÊS (apenas o balancete)
   &data1 e &data2 em DD/MM/YYYY
==============================================================================*/
WITH params AS (
  SELECT TO_DATE(:data1,'YYYY-MM-DD') d1,
         TO_DATE(:data2,'YYYY-MM-DD') d2
  FROM dual
),
meses AS (  -- gera uma linha por mês no intervalo
  SELECT
    ADD_MONTHS(TRUNC(d1,'MM'), LEVEL-1)                                  AS month_start,
    LEAST(LAST_DAY(ADD_MONTHS(TRUNC(d1,'MM'), LEVEL-1)), d2)             AS month_end,
    ADD_MONTHS(TRUNC(d1,'MM'), LEVEL-1) - 1                              AS periodo_sdi,  -- saldo anterior (dia anterior)
    LEAST(LAST_DAY(ADD_MONTHS(TRUNC(d1,'MM'), LEVEL-1)), d2)             AS periodo_sdf   -- saldo final do mês
  FROM params
  CONNECT BY ADD_MONTHS(TRUNC(d1,'MM'), LEVEL-1) <= TRUNC(d2,'MM')
),
/* ------------------------- SALDO ANTERIOR por mês ------------------------- */
SD AS (
  SELECT
    m.month_start,
    m.month_end,
    m.periodo_sdi,
    /* chave padronizada igual à de MOV */
    e.classificacao
    || o.codigo_objeto_custo
    || (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
             WHEN i.id_filial = 20 THEN 6
             WHEN i.id_filial = 19 THEN 2
             WHEN i.id_filial = 22 THEN 17
             WHEN i.id_filial = 21 THEN 13
             ELSE 0 END)
    || i.codigo_analitico                                           AS chv,

    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END)                                               AS codigo_empresa,
    i.codigo_analitico                                              AS CODIGO_ANALITICO,
    entidade.nome                                                   AS razao,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END)                                               AS ID_FILIAL,
    o.classificacao                                                 AS o_clas,
    o.codigo_objeto_custo                                           AS ocst,
    o.descricao                                                     AS cst_desc,
    o.id_grupo_rateio, o.tipo_custo,
    e.tipo_classificacao                                            AS clas,
    e.natureza_custo                                                AS cst,
    e.conta,
    e.descricao,
    e.classificacao,
    SUM(CASE WHEN i.tipo = 'C' THEN i.valor * -1 ELSE i.valor END)  AS saldo
  FROM meses m
  JOIN sigma_fis.lancamento_contabil      c ON c.data < m.month_start
  JOIN sigma_fis.item_lancamento_contabil i ON i.id_lancamento_contabil = c.id_lancamento_contabil
  JOIN sigma_fis.conta_contabil           e ON e.codigo_conta_contabil  = i.codigo_conta_contabil
  LEFT JOIN sigma_ger.objeto_custo        o ON o.codigo_objeto_custo    = i.codigo_objeto_custo
  LEFT JOIN sigma_ven.entidade   entidade   ON entidade.codigo_entidade = i.codigo_analitico
  GROUP BY
    m.month_start, m.month_end, m.periodo_sdi,
    e.classificacao||o.codigo_objeto_custo
      ||(CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
               WHEN i.id_filial = 20 THEN 6
               WHEN i.id_filial = 19 THEN 2
               WHEN i.id_filial = 22 THEN 17
               WHEN i.id_filial = 21 THEN 13
               ELSE 0 END)
      ||i.codigo_analitico,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END),
    i.codigo_analitico, entidade.nome,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END),
    o.classificacao, o.codigo_objeto_custo, o.descricao, o.id_grupo_rateio, o.tipo_custo,
    e.tipo_classificacao, e.natureza_custo, e.conta, e.descricao, e.classificacao
),
/* --------------------------- MOVIMENTO do mês ----------------------------- */
MOV AS (
  SELECT
    m.month_start,
    m.month_end,
    m.periodo_sdf,
    /* chave padronizada igual à de SD */
    e.classificacao
    || o.codigo_objeto_custo
    || (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
             WHEN i.id_filial = 20 THEN 6
             WHEN i.id_filial = 19 THEN 2
             WHEN i.id_filial = 22 THEN 17
             WHEN i.id_filial = 21 THEN 13
             ELSE 0 END)
    || i.codigo_analitico                                           AS chv,

    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END)                                               AS codigo_empresa,
    i.codigo_analitico                                              AS CODIGO_ANALITICO,
    entidade.nome                                                   AS razao,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END)                                               AS ID_FILIAL,
    o.classificacao                                                 AS o_clas,
    o.codigo_objeto_custo                                           AS ocst,
    o.descricao                                                     AS cst_desc,
    o.id_grupo_rateio, o.tipo_custo,
    e.tipo_classificacao                                            AS clas,
    e.natureza_custo                                                AS cst,
    e.conta,
    e.descricao,
    e.classificacao,
    SUM(CASE WHEN i.tipo = 'C' THEN 0         ELSE i.valor END)      AS debito,
    SUM(CASE WHEN i.tipo = 'C' THEN i.valor*-1 ELSE 0       END)     AS credito,
    SUM(CASE WHEN i.tipo = 'C' THEN i.valor*-1 ELSE i.valor END)     AS valor
  FROM meses m
  JOIN sigma_fis.lancamento_contabil      c
    ON c.data BETWEEN m.month_start AND m.month_end
  JOIN sigma_fis.item_lancamento_contabil i ON i.id_lancamento_contabil = c.id_lancamento_contabil
  JOIN sigma_fis.conta_contabil           e ON e.codigo_conta_contabil  = i.codigo_conta_contabil
  LEFT JOIN sigma_ger.objeto_custo        o ON o.codigo_objeto_custo    = i.codigo_objeto_custo
  LEFT JOIN sigma_ven.entidade   entidade   ON entidade.codigo_entidade = i.codigo_analitico
  WHERE c.origem <> 9
  GROUP BY
    m.month_start, m.month_end, m.periodo_sdf,
    e.classificacao||o.codigo_objeto_custo
      ||(CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
               WHEN i.id_filial = 20 THEN 6
               WHEN i.id_filial = 19 THEN 2
               WHEN i.id_filial = 22 THEN 17
               WHEN i.id_filial = 21 THEN 13
               ELSE 0 END)
      ||i.codigo_analitico,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END),
    i.codigo_analitico, entidade.nome,
    (CASE WHEN i.id_filial IS NULL THEN e.codigo_empresa
          WHEN i.id_filial = 20 THEN 6
          WHEN i.id_filial = 19 THEN 2
          WHEN i.id_filial = 22 THEN 17
          WHEN i.id_filial = 21 THEN 13
          ELSE 0 END),
    o.classificacao, o.codigo_objeto_custo, o.descricao, o.id_grupo_rateio, o.tipo_custo,
    e.tipo_classificacao, e.natureza_custo, e.conta, e.descricao, e.classificacao
)
/* ------------------------------ SELECT FINAL ------------------------------ */
SELECT
  NVL(sd.codigo_empresa, mov.codigo_empresa)                            AS emp,
  SUBSTR(NVL(sd.classificacao, mov.classificacao), 1,  1)               AS AGL1,
  SUBSTR(NVL(sd.classificacao, mov.classificacao), 1,  4)               AS AGL2,
  SUBSTR(NVL(sd.classificacao, mov.classificacao), 1,  7)               AS AGL3,
  SUBSTR(NVL(sd.classificacao, mov.classificacao), 1, 10)               AS AGL4,
  NVL(sd.classificacao, mov.classificacao)                               AS CLASSIFICACAO,
  NVL(sd.conta,         mov.conta)                                       AS CONTA,
  NVL(sd.descricao,     mov.descricao)                                   AS DESCRICAO,
  NVL(sd.clas,          mov.clas)                                        AS CLAS,
  NVL(sd.cst,           mov.cst)                                         AS CST,
  NVL(sd.id_filial,     mov.id_filial)                                   AS F,
  NVL(sd.codigo_analitico, mov.codigo_analitico)                         AS ENTIDADE,
  NVL(sd.razao,         mov.razao)                                       AS RAZAO,
  NVL(sd.o_clas,        mov.o_clas)                                      AS o_clas,
  NVL(sd.ocst,          mov.ocst)                                        AS o_cst,
  NVL(sd.cst_desc,      mov.cst_desc)                                    AS o_desc,
  NVL(sd.id_grupo_rateio, mov.id_grupo_rateio)                           AS gr,
  NVL(sd.tipo_custo,      mov.tipo_custo)                                AS tp,

  NVL(sd.saldo, 0)                                                       AS SALDO_SDI,
  /* sempre preenche a data inicial (se não houver SD, usa início do mês de MOV - 1) */
  NVL(sd.periodo_sdi, mov.month_start - 1)                               AS DATA_SDI,

  NVL(mov.debito, 0)                                                     AS DEBITO,
  NVL(mov.credito, 0)                                                    AS CREDITO,
  NVL(mov.valor, 0)                                                      AS MOVIMENTO,

  /* sempre preenche a data final do mês (se não houver MOV, usa o month_end do SD) */
  NVL(mov.periodo_sdf, sd.month_end)                                     AS DATA_SDF,

  NVL(sd.saldo,0) + NVL(mov.valor,0)                                     AS SDF,

  bs.SUBSTR_CLASS,
  bs.SUBSTR_DESCRICAO,
  bs.DESCRICAO_CLASS,
  bs.class,
  bs.CLASSIFICACAO_SIMPLES
FROM sd
FULL OUTER JOIN mov
  ON mov.chv = sd.chv
 AND mov.month_start = sd.month_start    -- alinha o mesmo mês
LEFT JOIN ramax.PLANO_CONTAS_SIMPLES bs
  ON NVL(sd.classificacao, mov.classificacao) = bs.classificacao
WHERE NOT NVL(sd.codigo_empresa, mov.codigo_empresa) IN (5,8)
ORDER BY
  /* ordena por período (início), depois por conta */
  NVL(sd.periodo_sdi, mov.month_start - 1),
  NVL(mov.periodo_sdf, sd.month_end),
  NVL(sd.classificacao, mov.classificacao)
`;

// 1° QUERY
// export const TEMP_BALANCETE_QUERY = `
// -----------------------BALANCETE-------------
//       SELECT
//       NVL(SD.codigo_empresa, MOV.codigo_empresa) as emp,
//       SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 1) AS AGL1,
//       SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 4) AS AGL2,
//       SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 7) AS AGL3,
//       SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 10) AS AGL4,
//        NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO) CLASSIFICACAO,
//        NVL(SD.CONTA, MOV.CONTA) CONTA,
//        NVL(SD.DESCRICAO, MOV.DESCRICAO) DESCRICAO,
//        NVL(SD.clas,MOV.clas) CLAS,
//        NVL(SD.cst,MOV.cst) CST,
//        NVL(SD.ID_FILIAL,MOV.ID_FILIAL) F,
//        NVL(sd.CODIGO_ANALITICO ,MOV.CODIGO_ANALITICO) entidade,
//        --NVL(SD.dac,MOV.DAC)DAC,
//        NVL(SD.razao,MOV.RAZAO) RAZAO,
//        nvl(sd.o_clas,mov.o_clas)o_clas,
//        nvl(sd.ocst,mov.ocst)o_cst,
//        nvl(sd.cst_desc,mov.cst_desc)o_desc,
//        nvl(sd.id_grupo_rateio,mov.id_grupo_rateio) gr,
//        nvl(sd.tipo_custo,mov.tipo_custo) tp,
//        NVL(SD.SALDO,0)SALDO_SDI,
//        TO_DATE(:data1,'YYYY-MM-DD')-1 as Data_SDI,
//        NVL(MOV.DEBITO,0) DEBITO,
//        NVL(MOV.CREDITO,0)CREDITO,
//        NVL(MOV.VALOR,0) MOVIMENTO,
//        TO_DATE(:data2, 'YYYY-MM-DD') as Data_SDF,
//        NVL(SD.SALDO,0)+ NVL(MOV.VALOR,0) SDF
//        ,BS.SUBSTR_CLASS,
//        BS.SUBSTR_DESCRICAO,
//        BS.DESCRICAO_CLASS,
//        bs.class,
//        BS.CLASSIFICACAO_SIMPLES

// FROM
// -------------------------saldo anterior

//        (select TO_DATE(:data1,'YYYY-MM-DD')-1 as Data_base,ant.chv
//         ,ant.CODIGO_ANALITICO
//         --,ant.ORIGEM_ANALITICA dac
//         ,ant.NOME razao
//         ,ant.id_filial
//         ,ant.o_clas,ant.ocst, ant.cst_desc, ant.id_grupo_rateio, ant.tipo_custo
//         ,ant.clas
//         ,ant.cst
//         ,ant.conta
//         ,ant.classificacao
//         ,ant.descricao
//         ,ant.SALDO
//         ,ant.codigo_empresa
//         from
//         (
//                       select case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end codigo_empresa ,
//                              i.codigo_analitico,
//                              --i.origem_analitica,
//                              entidade.nome,
//                              e.classificacao||o.codigo_objeto_custo||e.codigo_empresa||i.codigo_analitico chv,
//                              case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ID_FILIAL,
//                              o.classificacao o_clas,o.codigo_objeto_custo ocst, o.descricao cst_desc,o.id_grupo_rateio, o.tipo_custo,
//                              e.tipo_classificacao clas,
//                              e.natureza_custo cst,
//                              E.conta,
//                              e.descricao,
//                              e.classificacao,
//                              SUM(case when i.tipo = 'C' THEN i.valor * -1 ELSE I.VALOR END) SALDO
//                         from sigma_fis.lancamento_contabil      c,
//                              sigma_fis.item_lancamento_contabil i,
//                              sigma_fis.conta_contabil           e,
//                              sigma_ger.objeto_custo             o,
//                              sigma_ven.entidade                 entidade
//                        where i.codigo_conta_contabil = e.codigo_conta_contabil
//                          and c.id_lancamento_contabil = i.id_lancamento_contabil
//                          and o.codigo_objeto_custo(+) = i.codigo_objeto_custo
//                          and entidade.codigo_entidade(+) = i.codigo_analitico
//                          --and not e.codigo_empresa in (8,5)
//                          --and e.conta = 329
//                          AND c.data < TO_DATE(:data1,'YYYY-MM-DD')
//                          GROUP BY i.codigo_analitico,
//                              --i.origem_analitica,
//                              entidade.nome,
//                              e.classificacao||o.codigo_objeto_custo||e.codigo_empresa||i.codigo_analitico,
//                              case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end,
//                              o.classificacao ,o.codigo_objeto_custo , o.descricao ,o.id_grupo_rateio, o.tipo_custo,
//                              e.tipo_classificacao ,
//                              e.natureza_custo ,
//                              E.conta,
//                              e.classificacao,
//                              e.descricao,
//                              e.codigo_empresa
//         ) ant
//       WHERE ANT.SALDO <> 0) SD

// FULL OUTER JOIN

// ----------------------------atual---------

//         (select TO_DATE(:data2, 'YYYY-MM-DD') as Data_base, ctb.chv
//         ,ctb.CODIGO_ANALITICO
//         --,ctb.ORIGEM_ANALITICA dac
//         ,ctb.NOME razao
//         ,CTB.ID_FILIAL
//         ,ctb.o_clas,ctb.ocst, ctb.cst_desc, ctb.id_grupo_rateio, ctb.tipo_custo
//         ,CTB.clas
//         ,CTB.cst
//         ,ctb.conta
//         ,ctb.classificacao
//         ,ctb.descricao
//         ,ctb.debito
//         ,ctb.credito
//         ,ctb.VALOR
//         ,ctb.codigo_empresa
//         from
//         (
//                       select case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end codigo_empresa,
//                              i.codigo_analitico,
//                              --i.origem_analitica,
//                              entidade.nome,
//                              e.classificacao||o.codigo_objeto_custo||case when I.ID_FILIAL iS null then 0 else I.ID_FILIAL end||i.codigo_analitico chv,
//                              case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ID_FILIAL,
//                              o.classificacao o_clas,o.codigo_objeto_custo ocst, o.descricao cst_desc,o.id_grupo_rateio, o.tipo_custo,
//                              e.tipo_classificacao clas,
//                              e.natureza_custo cst,
//                              E.Conta,
//                              e.descricao,
//                              e.classificacao,
//                              SUM(case when i.tipo = 'C' THEN 0 ELSE I.VALOR END)debito,
//                              SUM(case  when i.tipo = 'C' THEN i.valor * -1 ELSE 0 END) credito,
//                              SUM(case when i.tipo = 'C' THEN i.valor * -1 ELSE I.VALOR END) VALOR
//                         from sigma_fis.lancamento_contabil      c,
//                              sigma_fis.item_lancamento_contabil i,
//                              sigma_fis.conta_contabil           e,
//                              sigma_ger.objeto_custo             o,
//                              sigma_ven.entidade                 entidade
//                        where i.codigo_conta_contabil = e.codigo_conta_contabil
//                          and c.id_lancamento_contabil = i.id_lancamento_contabil
//                          and o.codigo_objeto_custo(+) = i.codigo_objeto_custo
//                          and entidade.codigo_entidade(+) = i.codigo_analitico
//                          AND c.data BETWEEN TO_DATE(:data1,'YYYY-MM-DD') AND TO_DATE(:data2,'YYYY-MM-DD')
//                          --and e.codigo_empresa in (8,5)
//                          --and e.conta = 329
//                          and not c.origem = 9
//                          GROUP BY i.codigo_analitico,
//                              --i.origem_analitica,
//                              entidade.nome,
//                              e.classificacao||o.codigo_objeto_custo||case when I.ID_FILIAL iS null then 0 else I.ID_FILIAL end||i.codigo_analitico ,
//                              case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ,
//                              o.classificacao ,o.codigo_objeto_custo , o.descricao ,o.id_grupo_rateio, o.tipo_custo,
//                              e.tipo_classificacao ,
//                              e.natureza_custo ,
//                              E.conta,
//                              e.classificacao,
//                              e.descricao,
//                              e.codigo_empresa
//         ) ctb
//         --where ctb.valor <> 0
//         --and ctb.classificacao like '3%'--between '3.02.01.01.00001' and  '3.02.01.03.999999'
//         )MOV

// ON MOV.chv = SD.chv
// LEFT JOIN ramax.PLANO_CONTAS_SIMPLES BS ON  NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO) = BS.CLASSIFICACAO
// --left join sigma_fis.filial filial on filial.id_filial =
// where not NVL(SD.codigo_empresa, MOV.codigo_empresa) in (5,8)
// --where

// UNION

// -----------------------------------ENTRADA DE GADO---------------------------------------------------------------
// SELECT
// null,'Gado', null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,
//   null,  null,  null,  compra.cabeca - dev.cabeca,  0.3,  'CABEÇAS',  null,  0.3,  'CABEÇAS'
//   FROM
// (select 1 G , nvl(sum(v.total_item),0) COMPRA_GADO, nvl(sum(v.quantidade),0) cabeca
//                  from sigma_fis.v_nota_entrada_pis_cofins v
//                  where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
//                  AND V.cod_sit <> '02' AND V.ncm LIKE '01%' AND NOT V.CFOP IN (1925,2925,1949,2949,1201,1202,2201,2202) and v.codigo_empresa <> 5)COMPRA,
// (select 1 g,NVL(sum(v.total_item),0) DEV,NVL(sum(v.quantidade),0) cabeca
//       from sigma_fis.v_nota_saida_pis_cofins v
//       where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
//       AND V.cod_sit <> '02'  AND V.ncm LIKE '01%'  and v.codigo_empresa <> 5 AND V.CFOP IN (5201,6201,5202,6202)) DEV   WHERE COMPRA.G = DEV.G
// UNION
// -----------------------------------------FATURAMENTO---------------------------------------------------------------
// select
// null,'Fat', null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,
// null,  null,  null,  S.VALOR-E.VALOR,0.3,  'KG',  null,  0.3,  'KG'

//                       from
//                         (select 3 s,sum(valor) valor
//                                   from
//                                 ( select SUM(V.quantidade) VALOR
//                                 from sigma_fis.v_nota_saida_ICMS v, sigma_ven.categoria_pedido c
//                                 where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
//                                 and c.sequencial_categoria_pedido = v.categoria and c.operacao ='V'
//                                 and v.cod_sit <> '02' )

//                                 )s,
//                         (select 3 e,nvl(sum(v.quantidade),2) valor
//                         from sigma_fis.v_nota_entrada_icms v
//                         where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
//                         and v.cod_sit <> '02' --and v.codigo_empresa = &emp
//                         and v.cfop in (1201,1202,2201,2202,1411,2411) ) e

//                       WHERE E.E=S.S
// `;
