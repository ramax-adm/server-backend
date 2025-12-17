export const TEMP_HISTORICO_REFATURAMENTO_QUERY = `
SELECT 
  bod.CODIGO_EMPRESA,
  bod.SEQUENCIAL_PEDIDO AS pedido_faturamento,
  nsip.SEQUENCIAL_NOTA_SAIDA  AS id_nf_faturamento,
  nsip.nota_saida AS nf_faturamento,
  brp.ID_BOLETIM_OCORRENCIA_DEV AS BO,
  ne.NOTA_ENTRADA AS nf_devolucao,
  ROW_NUMBER() OVER (
    PARTITION BY bod.SEQUENCIAL_PEDIDO
    ORDER BY nsip2.nota_saida ASC
  ) AS sequencia_refaturamento,
  brp.sequencial_pedido AS pedido_refaturamento,
  nsip2.SEQUENCIAL_NOTA_SAIDA AS id_nf_refaturamento,
  nsip2.nota_saida AS nf_refaturamento
FROM sigma_ven.boletim_pedido_refaturado brp
LEFT JOIN sigma_ven.BOLETIM_OCORRENCIA_DEV bod 
  ON bod.id_boletim_ocorrencia_dev = brp.ID_BOLETIM_OCORRENCIA_DEV
LEFT JOIN sigma_mat.NOTA_ENTRADA ne 
  ON bod.sequencial_nota_entrada = ne.sequencial_nota_entrada
LEFT JOIN sigma_mat.NOTA_SAIDA nsip 
  ON bod.SEQUENCIAL_PEDIDO = nsip.sequencial_pedido
LEFT JOIN sigma_mat.nota_saida nsip2 
  ON nsip2.sequencial_pedido = brp.SEQUENCIAL_PEDIDO
ORDER BY
  bod.SEQUENCIAL_PEDIDO,
  sequencia_refaturamento
`;
