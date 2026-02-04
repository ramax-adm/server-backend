export const INVENTORY_BALANCE_QUERY = `
SELECT 
IP.ID_INVENTARIO,
P.CODIGO_PRODUTO,
P.DESCRICAO AS PRODUTO,
-- saldo anterior => SALDO ESTOQUE FISICO
ip.ID_INVENTARIO_PRODUTO,
IP.SALDO_ESTOQUE_FISICO_UN qtd_saldo_anterior,
IP.SALDO_ESTOQUE_FISICO_KG peso_saldo_anterior, 
-- etiquetas lidas => saldo das caixas inventariadas
count(le.numero_caixa) qtd_estoque_fisico,
sum(le.PESO) peso_estoque_fisico
FROM sigma_pcp.inventario_produto ip
LEFT JOIN sigma_ven.produto p ON ip.sequencial_produto = p.SEQUENCIAL_PRODUTO 
LEFT JOIN sigma_pcp.INVENTARIO_CONTAGEM ic ON ic.ID_INVENTARIO_PRODUTO = ip.ID_INVENTARIO_PRODUTO 
LEFT JOIN sigma_pcp.LOTE_ENTRADA le ON le.ID_LOTE_ENTRADA = ic.ID_LOTE_ENTRADA  
--WHERE ip.id_inventario = 141
--AND le.CANCELADO = 0
--AND le.EXPEDIDO = 0
GROUP BY 
IP.ID_INVENTARIO,
p.CODIGO_PRODUTO,
P.DESCRICAO,
ip.ID_INVENTARIO_PRODUTO,
IP.SALDO_ESTOQUE_FISICO_UN,
IP.SALDO_ESTOQUE_FISICO_KG
ORDER BY p.DESCRICAO ASC

/*
 * inventory_id varchar NULL, OK
	product_code varchar NULL, OK
	product_name varchar NULL, OK
	inventory_quantity float4 NULL, OK
	inventory_weight_in_kg float4 NULL, OK
	phisical_quantity float4 NULL, OK
	phisical_weight_in_kg float4 NULL, OK
 * */
`;
