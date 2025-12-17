export const INVENTORY_QUERY = `
SELECT 
	i.ID_INVENTARIO,
    i."DATA",
    i.DATA_INICIO_CONTAGEM,
    i.DATA_FIM_CONTAGEM,
    e.CODIGO_EMPRESA,
    e.RAZAO_SOCIAL AS empresa,
    a.CODIGO_ALMOXARIFADO,
    a.NOME AS almoxarifado,
    DECODE(i.SITUACAO, 0, 'Pendente', 1, 'Iniciado', 2, 'Finalizado', 'N/D') AS situacao
FROM sigma_pcp.INVENTARIO i 
LEFT JOIN sigma_mat.ALMOXARIFADO a 
    ON a.CODIGO_ALMOXARIFADO = i.CODIGO_ALMOXARIFADO
LEFT JOIN sigma_fis.EMPRESA e 
    ON e.CODIGO_EMPRESA = a.CODIGO_EMPRESA
`;
