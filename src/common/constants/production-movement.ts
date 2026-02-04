export const PRODUCTION_MOVEMENT_QUERY = `
select oc.codigo_empresa,
       trunc(pd.data_movimento) data_movimentacao,
       'ENTRADA' TIPO_PRODUCAO,
       le.especie_movimento,
       oc.id_ordem_compra_gado ordem_compra,
       a.CODIGO_ALMOXARIFADO,
       a.NOME ALMOXARIFADO,
       pr.codigo_produto,
       pr.descricao,
       decode(pr.tipo_peca,1,'TR',2,'PA',3,'DT')QUARTEIO,
       count(*)pecas,
       sum(pd.peso)peso,
       count(*)qtde_caixas       
  from sigma_pec.pesagem_desossa pd,
       sigma_pec.registro_abate ra,
       sigma_pec.lote_abate la,
       sigma_pec.ordem_compra_gado oc,
       sigma_ven.produto pr,
       sigma_pcp.lote_entrada le,
       sigma_mat.almoxarifado a
 where pd.id_registro_abate = ra.id_registro_abate
   and ra.id_lote_abate     = la.id_lote_abate
   and la.id_ordem_compra_gado = oc.id_ordem_compra_gado
   and pd.sequencial_produto   = pr.sequencial_produto
   and pd.id_lote_entrada      = le.id_lote_entrada
   AND le.codigo_almoxarifado = a.codigo_almoxarifado (+)

   --and trunc(pd.data_movimento) = '07/07/2025'
group by pr.codigo_produto,
       pr.descricao,
       pr.tipo_peca,
       trunc(pd.data_movimento),
       oc.id_ordem_compra_gado,
       oc.codigo_empresa,
       le.especie_movimento,
       a.codigo_almoxarifado,
       a.NOME
union all       
/*
 * Para o dia 01/12/2025 os valores sao
 * 
 * caixas 8687
 * peças 44372
 * */
select t.codigo_empresa,
       trunc(le.DATA_PRODUCAO) data_movimentacao,
       'SAIDA' TIPO_PRODUCAO,
       le.especie_movimento,
       0 ordem_compra,
        a.CODIGO_ALMOXARIFADO,
       a.NOME ALMOXARIFADO,
       pr.codigo_produto,
       pr.descricao,
       decode(t.id_familia,4,'TR',5,'DT',6,'PA',10,'MIUDOS')QUARTEIO,
       sum(le.quantidade)qtde_pecas,
       Round(sum(le.peso),2) qtde_peso,
       count(le.numero_caixa)qtde_caixas       
  from sigma_pcp.lote_entrada le,
       sigma_pcp.tabela_pcp t,
       sigma_ven.produto pr,
       sigma_mat.almoxarifado a
 where le.id_tabela_pcp      = t.id_tabela_pcp
   and le.sequencial_produto = pr.sequencial_produto
   AND le.codigo_almoxarifado = a.codigo_almoxarifado (+)
   --and le.DATA_PRODUCAO     = '01/12/2025'
   --and t.codigo_empresa      = 3
   and t.id_familia          not in (1)
   AND le.CANCELADO = 0
   AND le.ESPECIE_MOVIMENTO = 'PRD'
   
group by pr.codigo_produto,
       pr.descricao,
       t.id_familia,
       le.especie_movimento,
       t.codigo_empresa,
       trunc(le.data_producao),
       a.codigo_almoxarifado,
       a.NOME
`;
