export const TEMP_RAZAO_CONTABIL_QUERY = `
SELECT
	i.id_lancamento_contabil,
	i.id_item_lancamento,
	CASE
		WHEN I.ID_FILIAL IS NULL THEN e.codigo_empresa
		WHEN I.ID_FILIAL = 20 THEN 6
		WHEN I.ID_FILIAL = 19 THEN 2
		WHEN I.ID_FILIAL = 22 THEN 17
		WHEN I.ID_FILIAL = 21 THEN 13
		ELSE 0
	END FILIAL,
	c.origem,
	C.DATA,
	C.DOCUMENTO,
	C.ID_HISTORICO,
	C.COMPLEMENTO,
	i.codigo_analitico,
	i.origem_analitica,
	entidade.nome,
	I.TIPO,
	E.conta,
	e.descricao cta,
	E.CLASSIFICACAO,
	o.codigo_objeto_custo cst,
	o.descricao cst_descricao,
	CASE
		WHEN i.tipo = 'C' THEN
          i.valor * -1
		ELSE
          I.VALOR
	END VALOR
FROM
	sigma_fis.lancamento_contabil c,
	sigma_fis.item_lancamento_contabil i,
	sigma_fis.conta_contabil e,
	sigma_ger.objeto_custo o,
	sigma_ven.entidade entidade
WHERE
	i.codigo_conta_contabil = e.codigo_conta_contabil
	AND c.id_lancamento_contabil = i.id_lancamento_contabil
	AND o.codigo_objeto_custo(+) = i.codigo_objeto_custo
	AND entidade.codigo_entidade(+) = i.codigo_analitico
	AND c.id_lancamento_contabil IN
    (
	SELECT
		c.id_lancamento_contabil
	FROM
		sigma_fis.lancamento_contabil c,
		sigma_fis.item_lancamento_contabil i,
		sigma_fis.conta_contabil e
	WHERE
		i.codigo_conta_contabil = e.codigo_conta_contabil
		AND c.id_lancamento_contabil = i.id_lancamento_contabil
		AND c.data BETWEEN TO_DATE(:data1, 'YYYY-MM-DD') AND TO_DATE(:data2, 'YYYY-MM-DD')
		--and e.conta in (791)
      /*and c.codigo_empresa = '12'
      and c.documento = '4597'*/
		) 
      /*
      select * 
      from sigma_fis.filial*/
`;
