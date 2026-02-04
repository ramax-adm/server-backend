export const TEMP_TITULOS_PAGAR_QUERY = `
SELECT
    t.codigo_empresa,
    t.sequencial_titulo_pagar,
    f.codigo_fornecedor,
    f.cgc,
    f.razao_social,
    t.data_emissao,
    t.data_vencimento,
    t.data_baixa,
    t.numero_titulo,
    t.valor,
    t.valor_pago,
    sigma_fin.valor_aberto(t.sequencial_titulo_pagar) AS valor_aberto,
    t.codigo_tipo_baixa,
    t.observacao,

    -- 'P' (pendente) se ainda tem valor aberto na data de hoje, senão 'L' (liquidado)
    CASE
        WHEN sigma_fin.pkg_titulo_pagar.valor_aberto(t.sequencial_titulo_pagar, TRUNC(SYSDATE)) > 0
             THEN 'P'
        ELSE 'L'
    END AS tipo,

    -- Valor atualizado somente se estiver pendente na data de hoje
    CASE
        WHEN sigma_fin.pkg_titulo_pagar.valor_aberto(t.sequencial_titulo_pagar, TRUNC(SYSDATE)) > 0
             THEN TRUNC(SIGMA_FIN.PKG_TITULO_PAGAR.VALOR_ATUALIZADO(t.sequencial_titulo_pagar, TRUNC(SYSDATE)), 2)
        ELSE 0
    END AS valor_atualizado,
    ne.chave_acesso_nfe chv

FROM sigma_fin.titulo_pagar t
JOIN sigma_mat.fornecedor f   ON f.codigo_fornecedor = t.codigo_fornecedor
left join sigma_mat.nota_entrada  ne on t.sequencial_nota_entrada = ne.sequencial_nota_entrada
WHERE f.codigo_fornecedor IN (5857,14556,15954)

  AND t.data_emissao >= TO_DATE('01/01/2025','DD/MM/YYYY')
  AND t.data_emissao < TRUNC(SYSDATE)+1
`;
