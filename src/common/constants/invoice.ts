export const INVOICE_QUERY = `
SELECT
  /* Tipo da nota */
  DECODE(
    (
      SELECT COUNT(1)
        FROM sigma_ven.item_pedido ip
        JOIN sigma_ven.item_pedido_lote ipl
          ON ipl.sequencial_item_pedido = ip.sequencial_item_pedido
       WHERE ip.sequencial_pedido = ns.sequencial_pedido
    ),
    0, 'AVULSA',
    'COM LEITOR'
  ) AS tipo_nota,

  'NFe' AS tipo_documento,

  nfe.data_emissao,

  /* Situação da NFe */
  DECODE(
    nfe.situacao,
    'A','Autorizada',
    'C','Cancelada',
    'G','Denegada',
    'D','Digitação',
    'P','Processamento',
    'R','Rejeitada',
    'T','Transmitida',
    'V','Validada',
    'I','Incompleta',
    'N/D'
  ) AS situacao,

  tc.codigo_tipo_cliente,
  tc.descricao AS tipo_cliente,

  e.codigo_empresa,
  e.cidade,
  e.uf,

  cp.descricao AS categoria_pedido,

  /* Operação */
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

  substr(nfe.natureza_operacao, 1, 4)  AS codigo_cfop,
  substr(nfe.natureza_operacao, 6, 50) AS desc_cfop,

  nfe.numero_documento AS nota_fiscal,

  ns.sequencial_pedido,
  ns.sequencial_nota_saida,

  cli.codigo_cliente,
  cli.razao_social,

  pr.codigo_produto,
  pr.descricao AS produto,

  /* Quantidade de volumes */
  NVL(infe.quantidade_volumes, 0) AS qtde_caixas,

  /* Peso sempre do INFE */
  ROUND(NVL(infe.quantidade, 0), 2) AS peso_liquido,

  /* Valor sempre do INFE */
  ROUND(NVL(infe.quantidade, 0) * NVL(infe.valor_unitario, 0), 2) AS valor_total,

  ROUND(infe.valor_unitario, 2) AS valor_unitario

FROM sigma_mat.nota_saida ns
JOIN sigma_nfe.nota_fiscal nfe
  ON nfe.id_nota_fiscal = ns.id_nota_fiscal
JOIN sigma_nfe.item_nota infe
  ON infe.id_nota_fiscal = nfe.id_nota_fiscal
JOIN sigma_fin.cliente cli
  ON cli.codigo_cliente = ns.codigo_cliente
JOIN sigma_fis.empresa e
  ON e.codigo_empresa = ns.codigo_empresa
LEFT JOIN sigma_fin.tipo_cliente tc
  ON tc.sequencial_tipo_cliente = cli.sequencial_tipo_cliente
LEFT JOIN sigma_ven.categoria_pedido cp
  ON cp.sequencial_categoria_pedido = ns.sequencial_categoria_pedido
JOIN sigma_ven.produto pr
  ON pr.codigo_produto = infe.codigo_produto

WHERE nfe.data_emissao >= TO_DATE(:data_inicio, 'DD/MM/YYYY')
`;

// export const INVOICE_QUERY = `
// select 'COM LEITOR' tipo_nota,
//       'NFe' as tipo_documento,
//        nfe.data_emissao,
//    	   decode(nfe.situacao,'A','Autorizada','C','Cancelada','G', 'Denegada', 'D', 'Digitação', 'P', 'Processamento','R', 'Rejeitada', 'T', 'Transmitida', 'V', 'Validada', 'I', 'Incompleta','N/D') AS situacao,
//    	   tc.codigo_tipo_cliente,
//        tc.descricao tipo_cliente,
//        e.codigo_empresa,
//        e.cidade,
//        e.uf,
//        cp.descricao AS categoria_pedido,
//        decode(cp.operacao,'V','Venda','T','Troca','B','Bonificacao','D','Devolucao','O','Outras operacoes','R','Transferencia','N/D') AS operacao,
//        substr(nfe.natureza_operacao,1,4) codigo_cfop,
//        substr(nfe.natureza_operacao,6,50)desc_cfop,
//        nfe.numero_documento nota_fiscal,
//        ns.sequencial_pedido,
//        ns.sequencial_nota_saida,
//        cli.codigo_cliente,
//        cli.razao_social,
//        pr.codigo_produto,
//        pr.descricao produto,
//        count(ipl.numero_caixa)qtde_caixas,
//        CASE WHEN (IP.EXPEDIDO = 1) AND (nvl(IP.quantidade_peso,0) > 0) THEN
//                    IP.quantidade_peso
//                  ELSE
//                    decode(IP.tipo_unidade_medida, 'U', (IP.quantidade * nvl(IP.peso_medio_estoque,nvl(pr.peso_liquido,0))) , nvl(IP.quantidade,0)) END PESO_LIQUIDO,
//        ROUND((CASE WHEN (IP.EXPEDIDO = 1) AND (nvl(IP.quantidade_peso,0) > 0) THEN
//                    IP.quantidade_peso
//                  ELSE
//                    decode(IP.tipo_unidade_medida, 'U', (IP.quantidade * nvl(IP.peso_medio_estoque,nvl(pr.peso_liquido,0))) , nvl(IP.quantidade,0)) END * IP.VALOR_UNITARIO),2)VALOR_TOTAL,
//         round(ip.valor_unitario,2)valor_unitario

//   from sigma_mat.nota_saida ns,
//        sigma_nfe.nota_fiscal nfe,
//        sigma_ven.pedido p,
//        sigma_ven.item_pedido ip,
//        sigma_ven.item_pedido_lote ipl,
//        sigma_fin.cliente cli,
//        sigma_fis.empresa e,
//        sigma_fin.tipo_cliente tc,
//        sigma_ven.produto pr,
//        sigma_ven.categoria_pedido cp
//  where ns.id_nota_fiscal              = nfe.id_nota_fiscal
//    and ns.sequencial_pedido           = p.sequencial_pedido
//    and p.sequencial_pedido            = ip.sequencial_pedido
//    and ip.sequencial_item_pedido      = ipl.sequencial_item_pedido
//    and p.codigo_cliente               = cli.codigo_cliente
//    and p.codigo_empresa               = e.codigo_empresa
//    and cli.sequencial_tipo_cliente    = tc.sequencial_tipo_cliente(+)
//    AND ns.sequencial_categoria_pedido = cp.sequencial_categoria_pedido(+)
//    and ipl.sequencial_produto         = pr.sequencial_produto
//    and nfe.data_emissao               >= TO_DATE(:data_inicio,'DD/MM/YYYY')
//    --and ns.codigo_empresa              = 3
//    --and nfe.numero_documento           = 20149
// group by  tc.codigo_tipo_cliente,
//        tc.descricao,
//        e.codigo_empresa,
//        e.cidade,
//        e.uf,
//        nfe.natureza_operacao,
//        nfe.numero_documento,
//        ns.sequencial_pedido,
//        ns.sequencial_nota_saida,
//        cli.codigo_cliente,
//        cli.razao_social,
//        pr.codigo_produto,
//        pr.descricao,
//        IP.EXPEDIDO,
//        IP.quantidade_peso,
//        IP.tipo_unidade_medida,
//        IP.quantidade,
//        IP.peso_medio_estoque,
//        pr.peso_liquido,
//        IP.VALOR_UNITARIO,
//        nfe.data_emissao,
//        nfe.situacao,
//        cp.operacao,
//        cp.descricao
// union all
// select 'AVULSA' tipo_nota,
//        'NFe' as tipo_documento,
//        nfe.data_emissao,
//    	   decode(nfe.situacao,'A','Autorizada','C','Cancelada','G', 'Denegada', 'D', 'Digitação', 'P', 'Processamento','R', 'Rejeitada', 'T', 'Transmitida', 'V', 'Validada', 'I', 'Incompleta','N/D') AS situacao,
//        tc.codigo_tipo_cliente,
//        tc.descricao tipo_cliente,
//        e.codigo_empresa,
//        e.cidade,
//        e.uf,
//        -- Podera valer V -> Venda, B -> Bonificac?o, T -> Troca, D -> Devoluc?o, O -> Outras Operac?es, R -> Transferencia
//        cp.descricao AS categoria_pedido,
//        decode(cp.operacao,'V','Venda','T','Troca','B','Bonificacao','D','Devolucao','O','Outras operacoes','R','Transferencia','N/D') AS operacao,
//        substr(nfe.natureza_operacao,1,4) codigo_cfop,
//        substr(nfe.natureza_operacao,6,50)desc_cfop,
//        nfe.numero_documento nota_fiscal,
//        ns.sequencial_pedido,
//        ns.sequencial_nota_saida,
//        cli.codigo_cliente,
//        cli.razao_social,
//        pr.codigo_produto,
//        pr.descricao produto,
//        infe.quantidade_volumes,--talve mudar o campo quantidade caixas, para quantidade
//        round(infe.quantidade,2) peso_liquido,
//        round((infe.quantidade * infe.valor_unitario),2)valor_total,
//        infe.valor_unitario valor_unitario

//   from sigma_mat.nota_saida ns,
//        sigma_nfe.nota_fiscal nfe,
//        sigma_nfe.item_nota infe,
//        sigma_fin.cliente cli,
//        sigma_fis.empresa e,
//        sigma_fin.tipo_cliente tc,
//        sigma_ven.produto pr,
//        sigma_ven.categoria_pedido cp
// where ns.id_nota_fiscal              = nfe.id_nota_fiscal
//    and nfe.id_nota_fiscal             = infe.id_nota_fiscal
//    and ns.codigo_cliente              = cli.codigo_cliente
//    and ns.codigo_empresa              = e.codigo_empresa
//    and cli.sequencial_tipo_cliente    = tc.sequencial_tipo_cliente(+)
//    AND ns.sequencial_categoria_pedido = cp.sequencial_categoria_pedido(+)
//    and infe.codigo_produto            = pr.codigo_produto
//    and nfe.data_emissao               >= TO_DATE(:data_inicio,'DD/MM/YYYY')
//    --and ns.codigo_empresa              = 3
//    and not exists (select 1 from sigma_ven.item_pedido ip, sigma_ven.item_pedido_lote ipl
//                            where ip.sequencial_item_pedido = ipl.sequencial_item_pedido
//                              and ip.sequencial_pedido = ns.sequencial_pedido)
// group by  tc.codigo_tipo_cliente,
//        tc.descricao,
//        e.codigo_empresa,
//        e.cidade,
//        e.uf,
//        nfe.natureza_operacao,
//        nfe.numero_documento,
//        ns.sequencial_pedido,
//        ns.sequencial_nota_saida,
//        cli.codigo_cliente,
//        cli.razao_social,
//        pr.codigo_produto,
//        pr.descricao,
//        infe.quantidade,
//        infe.quantidade_volumes,
//        pr.peso_liquido,
//        infe.valor_unitario,
//        nfe.data_emissao,
//        nfe.situacao,
//        cp.operacao,
//        cp.descricao
// `;
