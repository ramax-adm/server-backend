export const TEMP_LIVRO_FISCAL_QUERY = `
SELECT
	V.codigo_empresa,
	'SAIDA' TIPO,
	v.data_emissao,
	V.data_saida_entrada ENTRADA,
	V.categoria,
	C.DESCRICAO AS CATEGORIA_DESCRICAO,
	V.documento,
	V.razao_social,
	V.descricao,
	V.cfop,
	CFOP.NOME,
	v.ncm,
	v.quantidade,
	v.valor_unitario,
	v.valor_total,
	V.valor_contabil,
	v.cst_icms,
	v.aliquota_icms,
	v.base_calculo_icms,
	v.valor_icms,
	v.cst_pis,
	v.aliquota_pis,
	v.base_calculo_pis,
	v.valor_pis,
	v.aliquota_cofins,
	v.valor_cofins,
	v.chave_acesso
FROM
	SIGMA_FIS.V_NOTA_SAIDA_PIS_COFINS V
INNER JOIN sigma_mat.natureza_operacao cfop ON
	V.cfop = cfop.codigo_natureza_operacao
INNER JOIN SIGMA_VEN.CATEGORIA_PEDIDO C ON
	C.SEQUENCIAL_CATEGORIA_PEDIDO = V.categoria
WHERE
	V.data_saida_entrada BETWEEN to_date(:data1,'YYYY-MM-DD') AND to_date(:data2,'YYYY-MM-DD')
	AND v.cod_sit <> '02'
	--and v.categoria = 199
UNION ALL
SELECT
	V.codigo_empresa,
	'ENTRADA' TIPO,
	v.data_emissao,
	V.data_saida_entrada ENTRADA,
	V.categoria,
	C.DESCRICAO AS CATEGORIA_DESCRICAO,
	V.documento,
	V.razao_social,
	V.descricao,
	V.cfop,
	CFOP.NOME,
	v.ncm,
	v.quantidade *-1,
	v.valor_unitario *-1,
	v.valor_total *-1,
	V.total_item *-1
,
	v.cst_icms,
	v.aliquota_icms,
	v.base_calculo_icms *-1,
	v.valor_icms *-1,
	v.cst_pis,
	v.aliquota_pis,
	v.base_calculo_pis *-1,
	v.valor_pis *-1,
	v.aliquota_cofins,
	v.valor_cofins *-1,
	v.chave_acesso
FROM
	SIGMA_FIS.V_NOTA_ENTRADA_PIS_COFINS V
INNER JOIN sigma_mat.natureza_operacao cfop ON
	V.cfop = cfop.codigo_natureza_operacao
INNER JOIN SIGMA_MAT.CATEGORIA_NOTA_ENTRADA C ON
	C.SEQUENCIAL_CATEGORIA_ENTRADA = V.categoria
WHERE
	V.data_saida_entrada BETWEEN to_date(:data1,'YYYY-MM-DD') AND to_date(:data2,'YYYY-MM-DD')
	AND v.cod_sit <> '02'
`;
