export const ACCOUNT_RECEIVABLE_QUERY = `
-- QUERY OK
WITH
  params AS (
    SELECT TO_DATE(:data_base,'YYYY-MM-DD') AS dt_base FROM dual
  ),
  -- última data de crédito no banco por título
  rt AS (
    SELECT
      rtt.sequencial_titulo_receber,
      MAX(m.data) AS data
    FROM sigma_fin.recebimento_titulo rtt
    LEFT JOIN sigma_fin.movimento_bancario m
      ON m.sequencial_movimento_bancario = rtt.sequencial_movimento_bancario
    GROUP BY rtt.sequencial_titulo_receber
  ),
  base AS (
    SELECT
      tr.sequencial_titulo_receber,
      et.codigo_especie AS especie_titulo,
      tr.codigo_empresa,
      tr.codigo_cliente,
      c.razao_social AS cliente,
      r.codigo_representante,
      r.razao_social AS representante,
      tr.sequencial_titulo_receber AS chave,
      tr.numero_titulo,
      tr.sequencial_especie_titulo,
      tr.data_emissao,
      tr.data_vencimento,
      tr.data_baixa,
      tr.data_baixa_perda,
      decode(c.tipo_pessoa,'J','Juridica','F','Fisica','E','Empresa',c.tipo_pessoa) as tipo_pessoa,
      i.cifra AS moeda,
      tr.valor,
      rt.data AS data_cred_cta,
      ns.sequencial_nota_saida,
      nf.numero_documento AS nota_saida,
      substr(nf.natureza_operacao,1,4) AS codigo_cfop,
      substr(nf.natureza_operacao,6,50) AS descricao_cfop,
      ec.id_especie_cobranca,
      ec.descricao AS especie_cobranca,
      tr.origem,      
      tr.usuario_criacao,
      tr.usuario_aprovacao,
      tr.observacao,
      cc.conta AS conta_contabil,
      cc.CLASSIFICACAO AS classificacao_contabil,
      cc.DESCRICAO AS nome_conta_contabil,
      
      /* Valor em aberto na data-base replicando a lógica "validada" */
      CASE
	      -- data e data_baixa > dt_base
        WHEN rt.data > (SELECT dt_base FROM params) AND tr.data_baixa > (SELECT dt_base FROM params)
        THEN sigma_fin.pkg_titulo_receber.valor_aberto(
               tr.sequencial_titulo_receber,
               (SELECT dt_base FROM params)
             )
        WHEN rt.data > tr.data_baixa
        THEN sigma_fin.pkg_titulo_receber.valor_aberto(
               tr.sequencial_titulo_receber,
               CAST(rt.data - (rt.data - NVL(tr.data_baixa, (SELECT dt_base FROM params) + 1)) - 1 AS DATE)
             )
        ELSE sigma_fin.pkg_titulo_receber.valor_aberto(
               tr.sequencial_titulo_receber,
               (SELECT dt_base FROM params)
             )
      END AS valor_aberto,

      /* Dias para bucketização: positivo => a vencer; negativo => vencido */
      (TRUNC(tr.data_vencimento) - (SELECT dt_base FROM params)) AS dias_diff

    FROM sigma_fin.titulo_receber tr
    JOIN sigma_fin.cliente c
      ON c.codigo_cliente = tr.codigo_cliente
    LEFT JOIN sigma_fin.representante r 
      ON r.codigo_representante = tr.codigo_representante
    LEFT JOIN rt
      ON rt.sequencial_titulo_receber = tr.sequencial_titulo_receber
    LEFT JOIN sigma_fin.INDICE i ON tr.CODIGO_INDICE = i.CODIGO_INDICE
    LEFT JOIN sigma_fin.RELACIONAMENTO_TITULO_RECEBER rtr on rtr.SEQUENCIAL_TITULO_RECEBER = tr.SEQUENCIAL_TITULO_RECEBER
    LEFT JOIN sigma_mat.nota_saida ns ON ns.SEQUENCIAL_NOTA_SAIDA = rtr.SEQUENCIAL_NOTA_SAIDA 
    LEFT JOIN sigma_nfe.NOTA_FISCAL nf ON nf.SEQUENCIAL_NOTA = ns.SEQUENCIAL_NOTA_SAIDA AND nf.TIPO_DOCUMENTO = 1 -- fat saida 
    LEFT JOIN sigma_ger.EMPENHO e ON e.CODIGO_EMPENHO = tr.CODIGO_EMPENHO 
    LEFT JOIN sigma_fis.CONTA_CONTABIL cc ON cc.codigo_conta_contabil = e.CODIGO_CONTA_CONTABIL 
    LEFT JOIN sigma_fin.especie_titulo et ON et.SEQUENCIAL_ESPECIE_TITULO = tr.SEQUENCIAL_ESPECIE_TITULO
    LEFT JOIN sigma_fin.ESPECIE_COBRANCA ec ON ec.ID_ESPECIE_COBRANCA = tr.ID_ESPECIE_COBRANCA
    
    WHERE 1=1 
    /*tr.codigo_empresa = 3
      AND tr.data_emissao BETWEEN DATE '2020-01-01' AND (SELECT dt_base FROM params)*/
      /* Mantemos títulos não perdidos antes da base */
      AND (tr.data_baixa_perda > (SELECT dt_base FROM params) OR tr.data_baixa_perda IS NULL)
  )
SELECT
  (SELECT dt_base from params) AS dt_base,
  b.sequencial_titulo_receber,
  b.especie_titulo,
  b.origem,
  b.chave,
  b.codigo_empresa,
  b.numero_titulo,
  b.data_emissao,
  b.data_vencimento,
  b.data_baixa,
  b.data_baixa_perda,
  CASE WHEN b.dias_diff >= 0 THEN 'A VENCER' ELSE 'VENCIDO' END AS situacao,
  b.codigo_cliente,
  b.cliente,
  b.codigo_representante,
  b.representante,
  b.id_especie_cobranca,
  b.especie_cobranca,
  b.sequencial_nota_saida,
  b.nota_saida,
  b.codigo_cfop,
  b.descricao_cfop,
  b.conta_contabil,
  b.classificacao_contabil,
  b.nome_conta_contabil,
  b.tipo_pessoa,
  b.moeda,
  b.valor,
  b.valor_aberto,
  b.usuario_criacao,
  b.usuario_aprovacao,
  b.observacao

  /* Situação geral do vencimento na data-base */

  /* Buckets A VENCER */
  --CASE WHEN b.dias_diff BETWEEN 0   AND 30  THEN b.valor_aberto ELSE 0 END AS A_VENCER_0_30,
  --CASE WHEN b.dias_diff BETWEEN 31  AND 60  THEN b.valor_aberto ELSE 0 END AS A_VENCER_31_60,
  --CASE WHEN b.dias_diff BETWEEN 61  AND 90  THEN b.valor_aberto ELSE 0 END AS A_VENCER_61_90,
  --CASE WHEN b.dias_diff BETWEEN 91  AND 180 THEN b.valor_aberto ELSE 0 END AS A_VENCER_91_180,
  --CASE WHEN b.dias_diff BETWEEN 181 AND 360 THEN b.valor_aberto ELSE 0 END AS A_VENCER_181_360,
  --CASE WHEN b.dias_diff > 360                     THEN b.valor_aberto ELSE 0 END AS A_VENCER_MAIOR_360,

  /* Buckets VENCIDOS (dias_diff negativo) */
  --CASE WHEN b.dias_diff BETWEEN -30  AND -1   THEN b.valor_aberto ELSE 0 END AS VENCIDOS_0_30,
  --CASE WHEN b.dias_diff BETWEEN -60  AND -31  THEN b.valor_aberto ELSE 0 END AS VENCIDOS_31_60,
  --CASE WHEN b.dias_diff BETWEEN -90  AND -61  THEN b.valor_aberto ELSE 0 END AS VENCIDOS_61_90,
  --CASE WHEN b.dias_diff BETWEEN -180 AND -91  THEN b.valor_aberto ELSE 0 END AS VENCIDOS_91_180,
  --CASE WHEN b.dias_diff BETWEEN -360 AND -181 THEN b.valor_aberto ELSE 0 END AS VENCIDOS_181_360,
  --CASE WHEN b.dias_diff < -360                  THEN b.valor_aberto ELSE 0 END AS VENCIDOS_MAIOR_360

FROM base b
/* Traz apenas títulos com valor aberto positivo na data-base (já com a regra robusta) */
--WHERE b.valor_aberto > 0
  /* Replicando os três cenários do validador:
--     1) sem baixa
--     2) baixa > base
--     3) baixa < base com crédito > base */
--  AND (
--       b.data_baixa IS NULL
--       OR b.data_baixa > (SELECT dt_base FROM params)
--       OR (b.data_baixa < (SELECT dt_base FROM params) AND b.data_cred_cta > (SELECT dt_base FROM params))
--      )
ORDER BY b.codigo_cliente, b.data_vencimento, b.numero_titulo
`;
