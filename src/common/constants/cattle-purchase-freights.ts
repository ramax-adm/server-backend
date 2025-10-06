export const CATTLE_PURCHASE_FREIGHTS_QUERY = /**sql */ `

SELECT
       CODIGO_EMPRESA,
       DATA_CHEGADA AS DATA_RECEBIMENTO,
       --NOME_EMPRESA,
       
       DATA_ABATE,
       data_fechamento_frete,
       ID_ORDEM_COMPRA_GADO,
       TIPO_FROTA,
       CAPACIDADE_UN,
       PLACA_CAMINHAO,
       CODIGO_TRANSPORTADORA,
       NOME_TRANSPORTADORA,
       CODIGO_PECUARISTA AS CODIGO_FORNECEDOR,
       NOME_PECUARISTA AS NOME_FORNECEDOR,
       CODIGO_ASSESSOR,       
       NOME_ASSESSOR,
       CIDADE AS CIDADE_ORIGEM,
       ID_PROPRIEDADE_RURAL,
       DESCRICAO_PROP_RURAL AS NOME_PROPRIEDADE_RURAL,
       --ID_CIDADE,
       
       --UF,
       ROUND(KM_PROPRIEDADE,2) KM_PROPRIEDADE,
       ROUND(KM_NEGOCIADO,2) KM_NEGOCIADO,
       (QUANTIDADE_MACHOS + QUANTIDADE_FEMEAS) QUANTIDADE_CABECA,
                       
       (select case when pfi.tipo_valor = 'I' then pfi_frota.valor_asfalto
                else pfi_frota.valor_asfalto * km_negociado
                  end 
         from sigma_ven.transportadora tr
             ,sigma_ven.calculo_frete c
             ,sigma_ven.preco_frete_km pf
             ,sigma_ven.preco_frete_km_item pfi
             ,sigma_ven.preco_frete_km_frota pfi_frota
        where tr.sequencial_transportadora     = x.sequencial_transportadora
          and c.id_calculo_frete               = tr.id_calculo_frete_compra
          and c.id_preco_frete_km              = pf.id_preco_frete_km
          and pfi.id_preco_frete_km            = pf.id_preco_frete_km
          and km_negociado between pfi.km_inicial and pfi.km_final
          and pfi_frota.id_preco_frete_km_item = pfi.id_preco_frete_km_item
          and pfi_frota.codigo_tipo_frota      = x.codigo_tipo_frota) VALOR_FRETE_TABELA,
          
       (select case when pfi.tipo_valor = 'I' then pfi_frota.valor_asfalto
                else pfi_frota.valor_asfalto * km_propriedade
                  end
         from sigma_ven.transportadora tr
             ,sigma_ven.calculo_frete c
             ,sigma_ven.preco_frete_km pf
             ,sigma_ven.preco_frete_km_item pfi
             ,sigma_ven.preco_frete_km_frota pfi_frota
        where tr.sequencial_transportadora     = x.sequencial_transportadora
          and c.id_calculo_frete               = tr.id_calculo_frete_compra
          and c.id_preco_frete_km              = pf.id_preco_frete_km
          and pfi.id_preco_frete_km            = pf.id_preco_frete_km
          and km_propriedade between pfi.km_inicial and pfi.km_final
          and pfi_frota.id_preco_frete_km_item = pfi.id_preco_frete_km_item
          and pfi_frota.codigo_tipo_frota      = x.codigo_tipo_frota) FRETE_TABELA_KM_PROPRIEDADE,
       
       ROUND(VALOR_FRETE,2) VALOR_FRETE_NEGOCIADO,
       ROUND(VALOR_PEDAGIO,2) VALOR_PEDAGIO,
       ROUND(VALOR_FRETE_ASFALTO,2) VALOR_ASFALTO,
       ROUND(VALOR_FRETE_TERRA,2) VALOR_TERRA,
       ROUND(VALOR_SAIDA,2) VALOR_SAIDA,
       ROUND(VALOR_ADICIONAL_FRETE,2) VALOR_ADICIONAL,
       ROUND(VALOR_DESCONTO_FRETE,2) VALOR_DESCONTO,
       
       nota_frete AS NOTA_ENTRADA,
       nota_frete_complemento AS NOTA_COMPLEMENTO,
       tipo_nota_frete AS ESPECIE
       

FROM (
SELECT R.ID_RECEBIMENTO_GADO,
       R.DATA_CHEGADA,
       O.CODIGO_EMPRESA,
       EP.RAZAO_SOCIAL NOME_EMPRESA,
       TR.SEQUENCIAL_TRANSPORTADORA,
       T.CODIGO_ENTIDADE CODIGO_TRANSPORTADORA,
       T.ID_ENTIDADE,
       T.NOME NOME_TRANSPORTADORA,
       A.CODIGO_ENTIDADE CODIGO_ASSESSOR,
       A.NOME NOME_ASSESSOR,
       T.FONE,
       O.ID_ORDEM_COMPRA_GADO,
       O.DATA_ABATE,
       TF.DESCRICAO TIPO_FROTA,
       R.PLACA_CAMINHAO,
       SUBSTR(SIGMA_PEC.PKG_ORDEM_COMPRA_GADO.NOTAS_FISCAIS_ENTRADA(O.ID_ORDEM_COMPRA_GADO),1,250) NF,
       P.CODIGO_ENTIDADE CODIGO_PECUARISTA,
       P.NOME NOME_PECUARISTA,
       PR.ID_PROPRIEDADE_RURAL,
       PR.DESCRICAO DESCRICAO_PROP_RURAL,
       C.ID_CIDADE,
       C.DESCRICAO CIDADE,
       C.UF,
       TF.CAPACIDADE_UN,
       (sigma_pec.pkg_propriedade_rural_distanc.DISTANCIA_PROPRIEDADE_RURAL(PR.ID_PROPRIEDADE_RURAL, O.CODIGO_EMPRESA,'A') +
        sigma_pec.pkg_propriedade_rural_distanc.DISTANCIA_PROPRIEDADE_RURAL(PR.ID_PROPRIEDADE_RURAL, O.CODIGO_EMPRESA,'T'))  KM_PROPRIEDADE,
       (R.KM_NEGOCIADO + R.KM_NEGOCIADO_TERRA) KM_NEGOCIADO,
       NVL(R.VALOR_FRETE,0) VALOR_FRETE,
       NVL(R.VALOR_PEDAGIO,0) VALOR_PEDAGIO,
       NVL(R.VALOR_FRETE_ASFALTO,0) VALOR_FRETE_ASFALTO,
       NVL(R.VALOR_FRETE_TERRA,0) VALOR_FRETE_TERRA,
       NVL(R.VALOR_SAIDA,0) VALOR_SAIDA,
       NVL(R.VALOR_ADICIONAL_FRETE,0) VALOR_ADICIONAL_FRETE,
       NVL(R.VALOR_DESCONTO_FRETE,0) VALOR_DESCONTO_FRETE,

       (NVL((SELECT SUM(I.QUANTIDADE)
               FROM SIGMA_PEC.ITEM_RECEBIMENTO_GADO I,
                    SIGMA_PEC.ESPECIE_GADO EG
              WHERE I.ID_RECEBIMENTO_GADO = R.ID_RECEBIMENTO_GADO
                AND EG.ID_ESPECIE_GADO = I.ID_ESPECIE_GADO
                AND EG.SEXO = 'M'),0)
        +
        NVL((SELECT SUM(I.QUANTIDADE)
               FROM SIGMA_PEC.RECEBIMENTO_GADO RF,
                    SIGMA_PEC.ITEM_RECEBIMENTO_GADO I,
                    SIGMA_PEC.ESPECIE_GADO EG
              WHERE RF.ID_RECEBIMENTO_GADO_PRINCIPAL = R.ID_RECEBIMENTO_GADO
                AND I.ID_RECEBIMENTO_GADO = RF.ID_RECEBIMENTO_GADO
                AND EG.ID_ESPECIE_GADO = I.ID_ESPECIE_GADO
                AND EG.SEXO = 'M'),0)
         ) QUANTIDADE_MACHOS,

       (NVL((SELECT SUM(I.QUANTIDADE)
               FROM SIGMA_PEC.ITEM_RECEBIMENTO_GADO I,
                    SIGMA_PEC.ESPECIE_GADO EG
              WHERE I.ID_RECEBIMENTO_GADO = R.ID_RECEBIMENTO_GADO
                AND EG.ID_ESPECIE_GADO = I.ID_ESPECIE_GADO
                AND EG.SEXO = 'F'),0)
        +
        NVL((SELECT SUM(I.QUANTIDADE)
               FROM SIGMA_PEC.RECEBIMENTO_GADO RF,
                    SIGMA_PEC.ITEM_RECEBIMENTO_GADO I,
                    SIGMA_PEC.ESPECIE_GADO EG
              WHERE RF.ID_RECEBIMENTO_GADO_PRINCIPAL = R.ID_RECEBIMENTO_GADO
                AND I.ID_RECEBIMENTO_GADO = RF.ID_RECEBIMENTO_GADO
                AND EG.ID_ESPECIE_GADO = I.ID_ESPECIE_GADO
                AND EG.SEXO = 'F'),0)

         ) QUANTIDADE_FEMEAS  ,

         R.CABECAS_NEGOCIADA,
         R.CODIGO_TIPO_FROTA,
         o.data_fechamento_frete,
          replace(to_char((select wm_concat(distinct n.especie)
            from sigma_mat.nota_entrada n 
                ,sigma_mat.nota_entrada_documentos nd
           where n.sequencial_nota_entrada = nd.sequencial_nota_entrada
             and nd.id_recebimento_gado = r.id_recebimento_gado
             and n.nota_complemento is null)),',','/') tipo_nota_frete,
             
         replace(to_char((select wm_concat(n.nota_entrada)
            from sigma_mat.nota_entrada n 
                ,sigma_mat.nota_entrada_documentos nd
           where n.sequencial_nota_entrada = nd.sequencial_nota_entrada
             and nd.id_recebimento_gado = r.id_recebimento_gado
             and n.nota_complemento is null)),',','/') nota_frete,
             
          replace(to_char((select wm_concat(nc.nota_entrada)
            from sigma_mat.nota_entrada n 
                ,sigma_mat.nota_entrada nc
                ,sigma_mat.nota_entrada_documentos nd
           where n.sequencial_nota_entrada = nd.sequencial_nota_entrada
             and nd.id_recebimento_gado = r.id_recebimento_gado
             and nc.nota_complemento = n.nota_entrada
             and nc.serie_complemento = n.serie
             and nc.codigo_fornecedor = n.codigo_fornecedor
             )),',','/') nota_frete_complemento
         


  FROM SIGMA_VEN.ENTIDADE T,
       SIGMA_VEN.ENTIDADE P,
       SIGMA_VEN.ENTIDADE A,
       SIGMA_VEN.TRANSPORTADORA TR,
       SIGMA_PEC.ORDEM_COMPRA_GADO O,
       SIGMA_PEC.PROPRIEDADE_RURAL PR,
       SIGMA_FIN.CEP,
       SIGMA_FIN.CIDADE C,
       SIGMA_PEC.RECEBIMENTO_GADO R,
       SIGMA_FRO.TIPO_FROTA TF,
       SIGMA_FIS.EMPRESA EP


 WHERE R.ID_ORDEM_COMPRA_GADO            = O.ID_ORDEM_COMPRA_GADO
   AND O.CODIGO_EMPRESA                  = EP.CODIGO_EMPRESA
   AND O.ID_ENTIDADE_ACESSOR             = A.ID_ENTIDADE
   AND PR.ID_PROPRIEDADE_RURAL           = R.ID_PROPRIEDADE_RURAL
   AND P.ID_ENTIDADE                     = R.ID_ENTIDADE_PROPRIETARIO
   AND PR.CEP                            = CEP.CEP
   AND CEP.CODIGO_CIDADE                 = C.ID_CIDADE
   AND TF.CODIGO_TIPO                    = R.CODIGO_TIPO_FROTA
   AND T.ID_ENTIDADE                     = TR.ID_ENTIDADE
   AND TR.SEQUENCIAL_TRANSPORTADORA      = R.SEQUENCIAL_TRANSPORTADORA
   --AND O.CODIGO_EMPRESA                  = 12
   AND O.DATA_ABATE                      >= TO_DATE($1,'DD/MM/YYYY')
)x
`;
