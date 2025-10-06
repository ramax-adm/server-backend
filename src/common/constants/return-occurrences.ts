export const RETURN_OCCURRENCES_QUERY = `
SELECT 
 bod."DATA" AS data_devolucao
,ped.data_faturamento
,bod.ID_BOLETIM_OCORRENCIA_DEV AS BO

,e.CODIGO_EMPRESA
,e.RAZAO_SOCIAL AS empresa
,c.CODIGO_CLIENTE
,c.NOME_FANTAZIA AS cliente
,r.CODIGO_REPRESENTANTE 
,r.razao_social AS representante
,decode(bod.OPERACAO,'P','Parcial','I','Integral','N/D') AS tipo_devolucao
,mdv.descricao AS motivo_devolucao
,bod.observacao
,p.codigo_produto
,p.DESCRICAO
--,nsip.nota_saida AS nf_faturamento_item_pedido
,bod.sequencial_pedido
,bodi.sequencial_item_pedido
--,ip.sequencial_item_pedido
--,ns.SEQUENCIAL_NOTA_SAIDA 
--,nsteste.sequencial_nota_saida
,ns.nota_saida AS nf_faturamento
,round(ip.QUANTIDADE / CASE WHEN ip.PESO_MEDIO_ESTOQUE = 0 THEN 1 ELSE ip.PESO_MEDIO_ESTOQUE END,0) AS quantidade_faturamento
,ip.QUANTIDADE AS peso_faturamento_kg
,ip.VALOR_UNITARIO AS valor_un_faturamento
,ip.valor_unitario * ip.quantidade AS valor_total_faturamento
,ne.sequencial_nota_entrada
,ne.nota_entrada AS nf_devolucao
,bodi.quantidade AS quantidade_devolvida
,bodi.peso AS peso_devolvida_kg
,bodi.VALOR_UNITARIO AS valor_un_devolucao
,bodi.valor_unitario * bodi.peso AS valor_total_devolucao
--,bodi.*
FROM sigma_ven.BOLETIM_OCORRENCIA_DEV bod
LEFT JOIN sigma_ven.BOLETIM_OCORRENCIA_DEV_ITEM bodi ON bod.ID_BOLETIM_OCORRENCIA_DEV = bodi.ID_BOLETIM_OCORRENCIA_DEV 
LEFT JOIN sigma_fin.CLIENTE c ON bod.codigo_cliente = c.codigo_cliente
LEFT JOIN sigma_fis.empresa e ON bod.codigo_empresa = e.CODIGO_EMPRESA
LEFT JOIN sigma_ven.produto p ON bodi.SEQUENCIAL_PRODUTO = p.SEQUENCIAL_PRODUTO
LEFT JOIN sigma_ven.ITEM_PEDIDO ip ON bodi.sequencial_item_pedido = ip.SEQUENCIAL_ITEM_PEDIDO
LEFT JOIN sigma_ven.pedido ped ON bod.SEQUENCIAL_PEDIDO = ped.SEQUENCIAL_PEDIDO 
LEFT JOIN sigma_fin.representante r ON ped.CODIGO_REPRESENTANTE = r.CODIGO_REPRESENTANTE 
LEFT JOIN sigma_ven.MOTIVO_DEVOLUCAO_VENDA mdv ON bod.CODIGO_MOTIVO_DEVOLUCAO_VENDA = mdv.CODIGO_MOTIVO_DEVOLUCAO_VENDA 
LEFT JOIN sigma_mat.NOTA_ENTRADA ne ON bod.sequencial_nota_entrada = ne.sequencial_nota_entrada
LEFT JOIN sigma_mat.NOTA_SAIDA ns ON bodi.sequencial_nota_saida = ns.sequencial_nota_saida
--LEFT JOIN sigma_mat.NOTA_SAIDA nsteste ON ped.sequencial_pedido = ns.sequencial_pedido
LEFT JOIN sigma_mat.NOTA_SAIDA nsip ON bod.SEQUENCIAL_PEDIDO = nsip.sequencial_pedido
WHERE 1=1
--AND bod.ID_BOLETIM_OCORRENCIA_DEV = 2298
AND bod."DATA" >= to_date(:data1,'YYYY-MM-DD')
ORDER BY 1 desc
`;
