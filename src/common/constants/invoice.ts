export const INVOICE_QUERY = `
select 'COM LEITOR' tipo_nota,
       nfe.data_emissao,
   	   decode(nfe.situacao,'A','Autorizada','C','Cancelada','G', 'Denegada', 'D', 'Digitação', 'P', 'Processamento','R', 'Rejeitada', 'T', 'Transmitida', 'V', 'Validada', 'I', 'Incompleta','N/D') AS situacao,
       tc.codigo_tipo_cliente,
       tc.descricao tipo_cliente,
       e.codigo_empresa,
       e.cidade,
       e.uf,
       substr(nfe.natureza_operacao,1,4) codigo_cfop,
       substr(nfe.natureza_operacao,6,50)desc_cfop,
       nfe.numero_documento nota_fiscal,
       ns.sequencial_pedido,
       cli.codigo_cliente,
       cli.razao_social,
       pr.codigo_produto,
       pr.descricao produto,
       count(ipl.numero_caixa)qtde_caixas,
       CASE WHEN (IP.EXPEDIDO = 1) AND (nvl(IP.quantidade_peso,0) > 0) THEN
                   IP.quantidade_peso
                 ELSE
                   decode(IP.tipo_unidade_medida, 'U', (IP.quantidade * nvl(IP.peso_medio_estoque,nvl(pr.peso_liquido,0))) , nvl(IP.quantidade,0)) END PESO_LIQUIDO,
       ROUND((CASE WHEN (IP.EXPEDIDO = 1) AND (nvl(IP.quantidade_peso,0) > 0) THEN
                   IP.quantidade_peso
                 ELSE
                   decode(IP.tipo_unidade_medida, 'U', (IP.quantidade * nvl(IP.peso_medio_estoque,nvl(pr.peso_liquido,0))) , nvl(IP.quantidade,0)) END * IP.VALOR_UNITARIO),2)VALOR_TOTAL,
        round(ip.valor_unitario,2)valor_unitario           
       
       
  from sigma_mat.nota_saida ns,
       sigma_nfe.nota_fiscal nfe,
       sigma_ven.pedido p,
       sigma_ven.item_pedido ip,
       sigma_ven.item_pedido_lote ipl,
       sigma_fin.cliente cli,
       sigma_fis.empresa e,
       sigma_fin.tipo_cliente tc,
       sigma_ven.produto pr
 where ns.id_nota_fiscal              = nfe.id_nota_fiscal
   and ns.sequencial_pedido           = p.sequencial_pedido
   and p.sequencial_pedido            = ip.sequencial_pedido
   and ip.sequencial_item_pedido      = ipl.sequencial_item_pedido
   and p.codigo_cliente               = cli.codigo_cliente
   and p.codigo_empresa               = e.codigo_empresa
   and cli.sequencial_tipo_cliente    = tc.sequencial_tipo_cliente(+)
   and ipl.sequencial_produto         = pr.sequencial_produto
   and nfe.data_emissao               >= TO_DATE(:data_inicio,'DD/MM/YYYY')
   --and ns.codigo_empresa              = 3
   --and nfe.numero_documento           = 20149
group by  tc.codigo_tipo_cliente,
       tc.descricao,
       e.codigo_empresa,
       e.cidade,
       e.uf,
       nfe.natureza_operacao,
       nfe.numero_documento,
       ns.sequencial_pedido,
       cli.codigo_cliente,
       cli.razao_social,
       pr.codigo_produto,
       pr.descricao,
       IP.EXPEDIDO,
       IP.quantidade_peso,
       IP.tipo_unidade_medida,
       IP.quantidade,
       IP.peso_medio_estoque,
       pr.peso_liquido,
       IP.VALOR_UNITARIO,
       nfe.data_emissao,
       nfe.situacao
union all
select 'AVULSA' tipo_nota,
       nfe.data_emissao,
   	   decode(nfe.situacao,'A','Autorizada','C','Cancelada','G', 'Denegada', 'D', 'Digitação', 'P', 'Processamento','R', 'Rejeitada', 'T', 'Transmitida', 'V', 'Validada', 'I', 'Incompleta','N/D') AS situacao,
       tc.codigo_tipo_cliente,
       tc.descricao tipo_cliente,
       e.codigo_empresa,
       e.cidade,
       e.uf,
       substr(nfe.natureza_operacao,1,4) codigo_cfop,
       substr(nfe.natureza_operacao,6,50)desc_cfop,
       nfe.numero_documento nota_fiscal,
       ns.sequencial_pedido,
       cli.codigo_cliente,
       cli.razao_social,
       pr.codigo_produto,
       pr.descricao produto,
       0 qtde_caixas,--talve mudar o campo quantidade caixas, para quantidade
       round(infe.quantidade,2) peso_liquido,
       round((infe.quantidade * infe.valor_unitario),2)valor_total,
       infe.valor_unitario valor_unitario          
       
       
  from sigma_mat.nota_saida ns,
       sigma_nfe.nota_fiscal nfe,
       sigma_nfe.item_nota infe,
       sigma_fin.cliente cli,
       sigma_fis.empresa e,
       sigma_fin.tipo_cliente tc,
       sigma_ven.produto pr
 where ns.id_nota_fiscal              = nfe.id_nota_fiscal
   and nfe.id_nota_fiscal             = infe.id_nota_fiscal
   and ns.codigo_cliente              = cli.codigo_cliente
   and ns.codigo_empresa              = e.codigo_empresa
   and cli.sequencial_tipo_cliente    = tc.sequencial_tipo_cliente(+)
   and infe.codigo_produto            = pr.codigo_produto
   and nfe.data_emissao               >= TO_DATE(:data_inicio,'DD/MM/YYYY')
   --and ns.codigo_empresa              = 3
   and not exists (select 1 from sigma_ven.item_pedido ip, sigma_ven.item_pedido_lote ipl 
                           where ip.sequencial_item_pedido = ipl.sequencial_item_pedido 
                             and ip.sequencial_pedido = ns.sequencial_pedido)
group by  tc.codigo_tipo_cliente,
       tc.descricao,
       e.codigo_empresa,
       e.cidade,
       e.uf,
       nfe.natureza_operacao,
       nfe.numero_documento,
       ns.sequencial_pedido,
       cli.codigo_cliente,
       cli.razao_social,
       pr.codigo_produto,
       pr.descricao,
       infe.quantidade,
       pr.peso_liquido,
       infe.valor_unitario,
       nfe.data_emissao,       
       nfe.situacao

`;
