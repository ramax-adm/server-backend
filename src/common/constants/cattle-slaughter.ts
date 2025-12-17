export const CATTLE_SLAUGHTER_QUERY = `
SELECT
	la."DATA" data_abate,
	cp.ID_LOTE_ABATE,
	la.ID_ORDEM_COMPRA_GADO,
	ocg.CODIGO_EMPRESA,
	la.DATA_INICIO data_inicio_abate,
	la.DATA_ENCERRAMENTO data_fim_abate,
	da.descricao destino_abate,
	tg.descricao tipificacao_gado,
	eg.descricao especie_gado,
	decode(eg.sexo,'F','Femêa','M','Macho','N/D') sexo,
	i.descricao idade,
	clp.descricao classificacao_pesagem,
	count(*) quantidade,
	sum(cp.peso1 + cp.peso2) peso,
	sum(cp.tara) tara
FROM
	sigma_pec.carcaca_pesagem cp
LEFT JOIN sigma_pec.LOTE_ABATE la ON
	cp.ID_LOTE_ABATE = la.ID_LOTE_ABATE
LEFT JOIN sigma_pec.destino_abate da ON
	da.id_destino_abate = la.id_destino_abate
LEFT JOIN sigma_pec.tipificacao_gado tg ON
	tg.id_tipificacao_gado = cp.id_tipificacao_gado
LEFT JOIN sigma_pec.especie_gado eg ON
	eg.id_especie_gado = cp.id_especie_gado
LEFT JOIN sigma_pec.idade i ON
	i.id_idade = cp.id_idade
LEFT JOIN sigma_pec.classificacao_pesagem clp ON
	clp.id_classificacao_pesagem = cp.id_classificacao_pesagem
LEFT JOIN sigma_pec.ordem_compra_gado ocg ON
	ocg.id_ordem_compra_gado = la.id_ordem_compra_gado
GROUP BY
	la."DATA",
	cp.ID_LOTE_ABATE,
	la.ID_ORDEM_COMPRA_GADO,
	la.DATA_INICIO,
	la.DATA_ENCERRAMENTO,
	da.DESCRICAO,
	ocg.codigo_empresa,
	tg.descricao,
	eg.descricao,
	eg.sexo,
	i.descricao,
	clp.descricao
ORDER BY 1 desc
`;
