export const CLIENT_QUERY = `
SELECT 
c.codigo_cliente
, r.codigo_representante
, r.razao_social representante_razao_social
, r.nome_fantasia representante_nome_fantasia
, c.RAZAO_SOCIAL 
, c.NOME_FANTAZIA 
, c.INSCRICAO_ESTADUAL 
, c.E_MAIL 
, c.FONE 
, c.UF 
, c.CIDADE 
, c.CEP 
, c.BAIRRO
, c.endereco
FROM sigma_fin.cliente c
LEFT JOIN sigma_fin.CLIENTE_REPRESENTANTE cr ON c.CODIGO_CLIENTE  = cr.CODIGO_CLIENTE
LEFT JOIN sigma_fin.REPRESENTANTE r ON cr.CODIGO_REPRESENTANTE = r.CODIGO_REPRESENTANTE
`;
