export const ACCOUNT_PAYABLE_QUERY = `
SELECT 
  null as dt_base,
  tp.SEQUENCIAL_TITULO_PAGAR,
  tp.SEQUENCIAL_TITULO_PAGAR AS chave,
  tp.CODIGO_EMPRESA,
  tp.NUMERO_TITULO,
  tp.DATA_EMISSAO,
  tp.DATA_VENCIMENTO,
  tp.DATA_BAIXA AS DATA_LIQUIDACAO,
  DECODE(
    tp.SITUACAO_APROVACAO,
    'N', 'Não avaliado',
    'V', 'Vistado',
    'A', 'Aprovado',
    'R', 'Reprovado',
    'E', 'Pendente',
    'Desconhecido'  -- valor default (caso não se enquadre)
  ) AS situacao,
  tp.CODIGO_FORNECEDOR,
  TRIM(BOTH FROM REPLACE(REPLACE(f.NOME_FANTASIA, CHR(10), ' '), CHR(13), ' ')) AS fornecedor, 
  tp.CODIGO_TIPO_BAIXA, 
  tb.DESCRICAO AS tipo_baixa,
  cc.conta AS conta_contabil,
  cc.CLASSIFICACAO AS classificacao_contabil,
  cc.DESCRICAO AS nome_conta_contabil,
  ne.CODIGO_CLIENTE AS codigo_cliente,
  c.NOME_FANTAZIA AS cliente,
  tp.CODIGO_REPRESENTANTE,
  r.NOME_FANTASIA AS representante,
  tp.SEQUENCIAL_NOTA_ENTRADA,
  -- NF
  nfe.numero_documento AS NOTA_FISCAL,
  substr(nfe.natureza_operacao,1,4) AS codigo_cfop,
  substr(nfe.natureza_operacao,6,50) AS descricao_cfop,
  i.CIFRA AS moeda,
  tp.VALOR AS valor_bruto,
  tp.VALOR_PAGO,
  CASE WHEN tp.valor_pago = 0 then 0 else (tp.VALOR_PAGO - tp.VALOR) END AS acrescimo,
  tp.USUARIO_CRIACAO,
  (
    SELECT tpa.USUARIO
    FROM sigma_fin.TITULO_PAGAR_APROVACAO tpa
    WHERE tpa.SEQUENCIAL_TITULO_PAGAR = tp.SEQUENCIAL_TITULO_PAGAR
      AND tpa.TIPO = 'V'
      AND ROWNUM = 1
  ) AS usuario_visto,
  (
    SELECT tpa.USUARIO
    FROM sigma_fin.TITULO_PAGAR_APROVACAO tpa
    WHERE tpa.SEQUENCIAL_TITULO_PAGAR = tp.SEQUENCIAL_TITULO_PAGAR
      AND tpa.TIPO = 'A'
      AND ROWNUM = 1
  ) AS usuario_aprovacao,
    tp.USUARIO_BAIXA AS usuario_liquidacao,
TRIM(BOTH FROM REPLACE(REPLACE(tp.OBSERVACAO, CHR(10), ' '), CHR(13), ' ')) AS OBSERVACAO
FROM sigma_fin.TITULO_PAGAR tp
LEFT JOIN sigma_fin.INDICE i ON tp.CODIGO_INDICE = i.CODIGO_INDICE
LEFT JOIN sigma_mat.FORNECEDOR f ON f.CODIGO_FORNECEDOR = tp.CODIGO_FORNECEDOR
LEFT JOIN sigma_fin.CONTRATO ct ON ct.id_contrato = tp.id_contrato
LEFT JOIN sigma_fis.conta_contabil cc ON cc.codigo_conta_contabil = ct.codigo_conta_contabil 
LEFT JOIN sigma_mat.NOTA_ENTRADA ne ON ne.SEQUENCIAL_NOTA_ENTRADA = tp.SEQUENCIAL_NOTA_ENTRADA
LEFT JOIN sigma_fin.REPRESENTANTE r ON r.CODIGO_REPRESENTANTE = tp.CODIGO_REPRESENTANTE
LEFT JOIN sigma_fin.CLIENTE c ON c.CODIGO_CLIENTE = ne.CODIGO_CLIENTE
LEFT JOIN sigma_fin.TIPO_BAIXA tb ON tb.CODIGO_TIPO_BAIXA = tp.CODIGO_TIPO_BAIXA
LEFT JOIN sigma_nfe.NOTA_FISCAL nfe ON nfe.SEQUENCIAL_NOTA = ne.SEQUENCIAL_NOTA_ENTRADA AND nfe.TIPO_DOCUMENTO = 0 -- fat entrada
WHERE 1=1
--AND SUBSTR(nfe.natureza_operacao, 1, 4) IN (
--  '5101',
--  '5105',
--  '5118',
--  '6101',
--  '6105',
--  '6118',
--  '7101'
--)
--AND tp.SEQUENCIAL_TITULO_PAGAR = 40056
ORDER BY tp.DATA_EMISSAO DESC
`;
