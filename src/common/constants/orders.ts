export const ORDER_LINES_QUERY = `
SELECT 
    p.DATA_FATURAMENTO,
    p.data_emissao,
    e.CODIGO_EMPRESA,
    e.NOME_FANTASIA AS empresa,
    p.sequencial_pedido,
    decode(p.SITUACAO,'E','Pendente','A','Aprovado','F','Faturado','C','Cancelado','R','Reprovado','N/D') AS SITUACAO,
    decode(p.mercado,'E','external','I','internal') AS MERCADO,
    p.CODIGO_CLIENTE,
    c.NOME_FANTAZIA AS cliente,
    p.CODIGO_REPRESENTANTE,
    r.NOME_FANTASIA AS representante,
    cp.sequencial_categoria_pedido,
    cp.DESCRICAO AS categoria_pedido,
    DECODE(
    cp.operacao,
    'V','Venda',
    'T','Troca',
    'B','Bonificacao',
    'D','Devolucao',
    'O','Outras operacoes',
    'R','Transferencia',
    'N/D'
  ) AS operacao,
    l.CODIGO_LINHA,
    l.descricao AS linha,
    prod.CODIGO_PRODUTO,
    prod.DESCRICAO AS produto,
    cpgt.codigo_condicao_pagamento AS codigo_prazo,
    cpgt.descricao AS prazo,
    round(ip.QUANTIDADE / CASE WHEN ip.PESO_MEDIO_ESTOQUE = 0 THEN 1 ELSE ip.PESO_MEDIO_ESTOQUE END,0) AS qtd_pecas,
    ip.QUANTIDADE AS peso_kg,
    i.cifra AS MOEDA,
    ip.preco_custo as valor_custo,
    ip.VALOR_DESCONTO_PROMOCAO AS valor_desconto_promocao,
    ip.VALOR_UNITARIO AS valor_venda_un,
    ip.VALOR_UNITARIO_TABELA AS valor_tabela_un,
    ip.QUANTIDADE * ip.VALOR_UNITARIO AS valor_total,
    ip.sequencial_tabela_preco AS sequencial_tp,
    tp.sequencial_tabela_preco,
    tp.numero_tabela,
    tp.descricao AS tabela_preco,
    t.sequencial_transportadora,
    t.razao_social AS transportadora,
    ip.OBSERVACAO AS DESCRICAO,
--    ge.CODIGO_GRUPO_EMPENHO,
--    ge.DESCRICAO AS grupo_empenho,
--    emp.CODIGO_EMPENHO,
--    emp.descricao AS empenho,
    ns.sequencial_nota_saida,
    nf.numero_documento AS nota_fiscal,
    substr(nf.natureza_operacao,1,4) AS codigo_cfop,
    substr(nf.natureza_operacao,6,50) AS descricao_cfop,
    rv.nome AS regiao_venda,
    ec.id_especie_cobranca,
    ec.descricao AS especie_cobranca

    -- agregados vindos do título (como podem ser vários)
    -- MAX(tr.CODIGO_EMPENHO) AS algum_codigo_empenho,
    -- MAX(tr.OBSERVACAO) AS alguma_obs_titulo
    -- se precisar de somatório: SUM(tr.valor) AS total_valor_titulos

FROM sigma_ven.ITEM_PEDIDO ip
LEFT JOIN sigma_ven.pedido p ON p.sequencial_pedido = ip.sequencial_pedido
LEFT JOIN sigma_ven.CONDICAO_PAGAMENTO cpgt ON cpgt.SEQUENCIAL_CONDICAO_PAGAMENTO = p.SEQUENCIAL_CONDICAO_PAGAMENTO  
LEFT JOIN sigma_fin.indice i ON i.CODIGO_INDICE = p.codigo_indice
LEFT JOIN sigma_fis.empresa e ON p.codigo_empresa = e.codigo_empresa
LEFT JOIN sigma_ven.produto prod ON prod.SEQUENCIAL_PRODUTO = ip.SEQUENCIAL_PRODUTO 
LEFT JOIN sigma_ven.LINHA l ON l.sequencial_linha = prod.SEQUENCIAL_LINHA 
LEFT JOIN sigma_ven.categoria_pedido cp ON cp.sequencial_categoria_pedido = p.sequencial_categoria_pedido
LEFT JOIN sigma_ven.TRANSPORTADORA t ON t.SEQUENCIAL_TRANSPORTADORA = p.SEQUENCIAL_TRANSPORTADORA
LEFT JOIN sigma_ven.tabela_preco tp ON tp.sequencial_tabela_preco = p.sequencial_tabela_preco
LEFT JOIN SIGMA_FIN.cliente c ON c.codigo_cliente = p.CODIGO_CLIENTE
LEFT JOIN sigma_fin.REPRESENTANTE r ON r.CODIGO_REPRESENTANTE = p.CODIGO_REPRESENTANTE 
LEFT JOIN sigma_fin.RELACIONAMENTO_TITULO_RECEBER rtr ON rtr.SEQUENCIAL_PEDIDO = p.SEQUENCIAL_PEDIDO
LEFT JOIN sigma_fin.TITULO_RECEBER tr ON tr.SEQUENCIAL_TITULO_RECEBER = rtr.SEQUENCIAL_TITULO_RECEBER
LEFT JOIN sigma_ger.empenho emp ON emp.CODIGO_EMPENHO  = tr.CODIGO_EMPENHO
LEFT JOIN sigma_ger.GRUPO_EMPENHO ge ON ge.CODIGO_GRUPO_EMPENHO = emp.CODIGO_GRUPO_EMPENHO
LEFT JOIN sigma_mat.nota_saida ns ON ns.sequencial_pedido = ip.sequencial_pedido
LEFT JOIN sigma_nfe.NOTA_FISCAL nf ON nf.id_nota_fiscal = ns.ID_NOTA_FISCAL 
-- novas consultas
LEFT JOIN sigma_fin.regiao_venda rv ON rv.SEQUENCIAL_REGIAO_VENDA = p.sequencial_regiao_venda
LEFT JOIN sigma_fin.especie_cobranca ec ON ec.ID_ESPECIE_COBRANCA = p.ID_ESPECIE_COBRANCA



WHERE 1=1
AND p.data_emissao >= to_date(:data_inicio,'YYYY-MM-DD')
GROUP BY 
    p.DATA_FATURAMENTO,
    p.data_emissao,
    e.CODIGO_EMPRESA,
    e.NOME_FANTASIA,
    p.sequencial_pedido,
    p.SITUACAO,
    p.mercado,
    p.CODIGO_CLIENTE,
    c.NOME_FANTAZIA,
    p.CODIGO_REPRESENTANTE,
    r.NOME_FANTASIA,
    cp.sequencial_categoria_pedido,
    cp.DESCRICAO,
     cp.operacao,
    l.CODIGO_LINHA,
    l.descricao,
    prod.CODIGO_PRODUTO,
    prod.DESCRICAO,
    cpgt.codigo_condicao_pagamento,
    cpgt.descricao,
    ip.QUANTIDADE,
    ip.PESO_MEDIO_ESTOQUE,
    i.cifra,
    ip.preco_custo,
    ip.VALOR_DESCONTO_PROMOCAO,
    ip.VALOR_UNITARIO,
    ip.VALOR_UNITARIO_TABELA,
    ip.sequencial_tabela_preco,
    tp.sequencial_tabela_preco,
    tp.numero_tabela,
    tp.descricao,
    t.sequencial_transportadora,
    t.razao_social,
    ip.OBSERVACAO,
 --   ge.CODIGO_GRUPO_EMPENHO,
 --   ge.DESCRICAO,
 --   emp.CODIGO_EMPENHO,
 --   emp.descricao,
    ns.sequencial_nota_saida,
    nf.numero_documento,
    nf.natureza_operacao,
    rv.nome,
    ec.id_especie_cobranca,
    ec.descricao
`;
