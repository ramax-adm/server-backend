export const STOCK_BALANCE_QUERY = `
select lp.codigo_linha
      ,lp.descricao descricao_linha
      ,pr.codigo_produto
      ,pr.descricao descricao_produto
      ,emp.codigo_empresa
      ,emp.razao_social nome_empresa
      ,emp.cidade
      ,emp.uf
      ,est.peso_estoque 
      ,est.quantidade_estoque 
      ,est.peso_reservado_produto 
      ,est.quantidade_reservada_produto 
      ,est.peso_disponivel_producao peso_disponivel 
      ,est.qtde_disponivel_producao quantidade_disponivel
 from sigma_ven.produto pr
      ,sigma_mat.material m
      ,sigma_fis.empresa emp
      ,sigma_ven.linha lp
      ,table(sigma_mat.pkg_saldo_estoque.PPL_SALDO_DISPONIVEL(emp.codigo_empresa , 0 , pr.codigo_material, sysdate , sysdate+900, 1)) est
where m.codigo_material = pr.codigo_material
  and lp.sequencial_linha = pr.sequencial_linha
  and m.tipo_material = 'P'
  --filtro empresas, se nao precisar remover a linha abaixo
  --and emp.codigo_empresa in (:cod_emp) 
 order by lp.codigo_linha, pr.codigo_produto, emp.codigo_empresa
`;
