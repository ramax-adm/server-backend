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
,TRIM(BOTH FROM REPLACE(REPLACE(bod.observacao, CHR(10), ' '), CHR(13), ' ')) AS observacao
,p.codigo_produto
,TRIM(BOTH FROM REPLACE(REPLACE(P.DESCRICAO, CHR(10), ' '), CHR(13), ' ')) AS DESCRICAO

-- FATURAMENTO INICIAL
,bod.sequencial_pedido
,bodi.sequencial_item_pedido
,nsip.nota_saida AS nf_faturamento
,nfe.id_nota_fiscal
,t.quantidade AS quantidade_faturamento
,t.peso_liquido AS peso_faturamento_kg
,t.valor_unitario AS valor_un_faturamento
,t.valor_total AS valor_total_faturamento

-- DEVOLUCAO
,ne.sequencial_nota_entrada
,ne.nota_entrada AS nf_devolucao
,ROUND(bodi.quantidade) AS quantidade_devolvida
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
LEFT JOIN sigma_nfe.NOTA_FISCAL nfe_ent ON nfe_ent.SEQUENCIAL_NOTA = ne.SEQUENCIAL_NOTA_ENTRADA AND nfe_ent.TIPO_DOCUMENTO = 0
--LEFT JOIN sigma_mat.NOTA_SAIDA ns ON bodi.sequencial_nota_saida = ns.sequencial_nota_saida
--LEFT JOIN sigma_mat.NOTA_SAIDA nsteste ON ped.sequencial_pedido = ns.sequencial_pedido
LEFT JOIN sigma_mat.NOTA_SAIDA nsip ON bod.SEQUENCIAL_PEDIDO = nsip.sequencial_pedido
LEFT JOIN sigma_nfe.nota_fiscal nfe ON nsip.id_nota_fiscal = nfe.id_nota_fiscal
--LEFT JOIN sigma_nfe.item_nota infe ON nfe.id_nota_fiscal = infe.id_nota_fiscal
LEFT JOIN (
	SELECT 
		p.codigo_produto,
		nf.NUMERO_DOCUMENTO,
		infe.id_nota_fiscal,
		ROUND(SUM(infe.QUANTIDADE_volumes)) quantidade,
		SUM(infe.quantidade) peso_liquido,
    	SUM(infe.quantidade * infe.valor_unitario) valor_total,
    	MIN(infe.valor_unitario) valor_unitario  
	FROM sigma_nfe.item_nota infe
	LEFT JOIN sigma_nfe.nota_fiscal nf ON infe.ID_NOTA_FISCAL = nf.ID_NOTA_FISCAL 
	LEFT JOIN sigma_ven.produto p ON infe.CODIGO_PRODUTO = p.CODIGO_PRODUTO 
	GROUP BY nf.numero_documento, infe.id_nota_fiscal, p.CODIGO_PRODUTO 
) T ON T.id_nota_fiscal = nfe.id_nota_fiscal AND t.codigo_produto = p.codigo_produto
WHERE 1=1
--AND bod.ID_BOLETIM_OCORRENCIA_DEV = 3583
AND bod."DATA" >= to_date(:data1,'YYYY-MM-DD')
ORDER BY 1 desc
`;
