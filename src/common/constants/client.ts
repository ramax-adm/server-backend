export const CLIENT_QUERY = `
SELECT 
codigo_cliente
, RAZAO_SOCIAL 
, NOME_FANTAZIA 
, INSCRICAO_ESTADUAL 
, E_MAIL 
, FONE 
, UF 
, CIDADE 
, CEP 
, BAIRRO
, endereco
 
FROM sigma_fin.cliente
`;
