export const TEMP_BALANCETE_QUERY = `
-----------------------BALANCETE-------------
      SELECT
      NVL(SD.codigo_empresa, MOV.codigo_empresa) as emp,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 1) AS AGL1,  
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 4) AS AGL2,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 7) AS AGL3,
      SUBSTR(NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO), 1, 10) AS AGL4,
       NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO) CLASSIFICACAO,
       NVL(SD.CONTA, MOV.CONTA) CONTA,
       NVL(SD.DESCRICAO, MOV.DESCRICAO) DESCRICAO,
       NVL(SD.clas,MOV.clas) CLAS,
       NVL(SD.cst,MOV.cst) CST,
       NVL(SD.ID_FILIAL,MOV.ID_FILIAL) F,
       NVL(sd.CODIGO_ANALITICO ,MOV.CODIGO_ANALITICO) entidade,
       --NVL(SD.dac,MOV.DAC)DAC,
       NVL(SD.razao,MOV.RAZAO) RAZAO,
       nvl(sd.o_clas,mov.o_clas)o_clas,
       nvl(sd.ocst,mov.ocst)o_cst,
       nvl(sd.cst_desc,mov.cst_desc)o_desc,
       nvl(sd.id_grupo_rateio,mov.id_grupo_rateio) gr,
       nvl(sd.tipo_custo,mov.tipo_custo) tp,
       NVL(SD.SALDO,0)SALDO_SDI,
       TO_DATE(:data1,'YYYY-MM-DD')-1 as Data_SDI,
       NVL(MOV.DEBITO,0) DEBITO,
       NVL(MOV.CREDITO,0)CREDITO,
       NVL(MOV.VALOR,0) MOVIMENTO,
       TO_DATE(:data2, 'YYYY-MM-DD') as Data_SDF,
       NVL(SD.SALDO,0)+ NVL(MOV.VALOR,0) SDF
       ,BS.SUBSTR_CLASS,
       BS.SUBSTR_DESCRICAO,
       BS.DESCRICAO_CLASS,
       bs.class,
       BS.CLASSIFICACAO_SIMPLES
                   
       
FROM
-------------------------saldo anterior

       (select TO_DATE(:data1,'YYYY-MM-DD')-1 as Data_base,ant.chv
        ,ant.CODIGO_ANALITICO 
        --,ant.ORIGEM_ANALITICA dac
        ,ant.NOME razao
        ,ant.id_filial
        ,ant.o_clas,ant.ocst, ant.cst_desc, ant.id_grupo_rateio, ant.tipo_custo
        ,ant.clas
        ,ant.cst
        ,ant.conta
        ,ant.classificacao
        ,ant.descricao
        ,ant.SALDO
        ,ant.codigo_empresa
        from 
        (
                      select case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end codigo_empresa ,
                             i.codigo_analitico,
                             --i.origem_analitica,
                             entidade.nome,
                             e.classificacao||o.codigo_objeto_custo||e.codigo_empresa||i.codigo_analitico chv,
                             case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ID_FILIAL, 
                             o.classificacao o_clas,o.codigo_objeto_custo ocst, o.descricao cst_desc,o.id_grupo_rateio, o.tipo_custo,
                             e.tipo_classificacao clas,
                             e.natureza_custo cst,
                             E.conta,
                             e.descricao,
                             e.classificacao,
                             SUM(case when i.tipo = 'C' THEN i.valor * -1 ELSE I.VALOR END) SALDO
                        from sigma_fis.lancamento_contabil      c,
                             sigma_fis.item_lancamento_contabil i,
                             sigma_fis.conta_contabil           e,
                             sigma_ger.objeto_custo             o,
                             sigma_ven.entidade                 entidade
                       where i.codigo_conta_contabil = e.codigo_conta_contabil
                         and c.id_lancamento_contabil = i.id_lancamento_contabil
                         and o.codigo_objeto_custo(+) = i.codigo_objeto_custo
                         and entidade.codigo_entidade(+) = i.codigo_analitico
                         --and not e.codigo_empresa in (8,5)
                         --and e.conta = 329                  
                         AND c.data < TO_DATE(:data1,'YYYY-MM-DD')
                         GROUP BY i.codigo_analitico,
                             --i.origem_analitica,
                             entidade.nome,
                             e.classificacao||o.codigo_objeto_custo||e.codigo_empresa||i.codigo_analitico,
                             case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end,
                             o.classificacao ,o.codigo_objeto_custo , o.descricao ,o.id_grupo_rateio, o.tipo_custo,
                             e.tipo_classificacao ,
                             e.natureza_custo ,
                             E.conta, 
                             e.classificacao, 
                             e.descricao,
                             e.codigo_empresa
        ) ant  
      WHERE ANT.SALDO <> 0) SD
      
FULL OUTER JOIN 


----------------------------atual---------


        (select TO_DATE(:data2, 'YYYY-MM-DD') as Data_base, ctb.chv
        ,ctb.CODIGO_ANALITICO 
        --,ctb.ORIGEM_ANALITICA dac
        ,ctb.NOME razao
        ,CTB.ID_FILIAL
        ,ctb.o_clas,ctb.ocst, ctb.cst_desc, ctb.id_grupo_rateio, ctb.tipo_custo
        ,CTB.clas
        ,CTB.cst
        ,ctb.conta
        ,ctb.classificacao
        ,ctb.descricao
        ,ctb.debito
        ,ctb.credito
        ,ctb.VALOR
        ,ctb.codigo_empresa
        from 
        (
                      select case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end codigo_empresa,
                             i.codigo_analitico,
                             --i.origem_analitica,
                             entidade.nome,
                             e.classificacao||o.codigo_objeto_custo||case when I.ID_FILIAL iS null then 0 else I.ID_FILIAL end||i.codigo_analitico chv,
                             case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ID_FILIAL, 
                             o.classificacao o_clas,o.codigo_objeto_custo ocst, o.descricao cst_desc,o.id_grupo_rateio, o.tipo_custo,
                             e.tipo_classificacao clas,
                             e.natureza_custo cst,
                             E.Conta,
                             e.descricao,
                             e.classificacao,
                             SUM(case when i.tipo = 'C' THEN 0 ELSE I.VALOR END)debito,
                             SUM(case  when i.tipo = 'C' THEN i.valor * -1 ELSE 0 END) credito,
                             SUM(case when i.tipo = 'C' THEN i.valor * -1 ELSE I.VALOR END) VALOR
                        from sigma_fis.lancamento_contabil      c,
                             sigma_fis.item_lancamento_contabil i,
                             sigma_fis.conta_contabil           e,
                             sigma_ger.objeto_custo             o,
                             sigma_ven.entidade                 entidade
                       where i.codigo_conta_contabil = e.codigo_conta_contabil
                         and c.id_lancamento_contabil = i.id_lancamento_contabil
                         and o.codigo_objeto_custo(+) = i.codigo_objeto_custo
                         and entidade.codigo_entidade(+) = i.codigo_analitico
                         AND c.data BETWEEN TO_DATE(:data1,'YYYY-MM-DD') AND TO_DATE(:data2,'YYYY-MM-DD')
                         --and e.codigo_empresa in (8,5)
                         --and e.conta = 329
                         and not c.origem = 9
                         GROUP BY i.codigo_analitico,
                             --i.origem_analitica,
                             entidade.nome,
                             e.classificacao||o.codigo_objeto_custo||case when I.ID_FILIAL iS null then 0 else I.ID_FILIAL end||i.codigo_analitico ,
                             case when I.ID_FILIAL iS null then e.codigo_empresa when I.ID_FILIAL =20 then 6 when I.ID_FILIAL =19 then 2 when I.ID_FILIAL =22 then 17 when I.ID_FILIAL =21 then 13 else 0 end ,
                             o.classificacao ,o.codigo_objeto_custo , o.descricao ,o.id_grupo_rateio, o.tipo_custo,
                             e.tipo_classificacao ,
                             e.natureza_custo ,
                             E.conta, 
                             e.classificacao, 
                             e.descricao,
                             e.codigo_empresa
        ) ctb 
        --where ctb.valor <> 0  
        --and ctb.classificacao like '3%'--between '3.02.01.01.00001' and  '3.02.01.03.999999'
        )MOV
        
ON MOV.chv = SD.chv
LEFT JOIN ramax.PLANO_CONTAS_SIMPLES BS ON  NVL(SD.CLASSIFICACAO, MOV.CLASSIFICACAO) = BS.CLASSIFICACAO
--left join sigma_fis.filial filial on filial.id_filial = 
where not NVL(SD.codigo_empresa, MOV.codigo_empresa) in (5,8)
--where 


UNION

-----------------------------------ENTRADA DE GADO---------------------------------------------------------------
SELECT   
null,'Gado', null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,
  null,  null,  null,  compra.cabeca - dev.cabeca,  0.3,  'CABEÇAS',  null,  0.3,  'CABEÇAS'
  FROM
(select 1 G , nvl(sum(v.total_item),0) COMPRA_GADO, nvl(sum(v.quantidade),0) cabeca
                 from sigma_fis.v_nota_entrada_pis_cofins v
                 where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD') 
                 AND V.cod_sit <> '02' AND V.ncm LIKE '01%' AND NOT V.CFOP IN (1925,2925,1949,2949,1201,1202,2201,2202) and v.codigo_empresa <> 5)COMPRA,
(select 1 g,NVL(sum(v.total_item),0) DEV,NVL(sum(v.quantidade),0) cabeca
      from sigma_fis.v_nota_saida_pis_cofins v
      where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
      AND V.cod_sit <> '02'  AND V.ncm LIKE '01%'  and v.codigo_empresa <> 5 AND V.CFOP IN (5201,6201,5202,6202)) DEV   WHERE COMPRA.G = DEV.G 
UNION
-----------------------------------------FATURAMENTO---------------------------------------------------------------
select
null,'Fat', null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  
null,  null,  null,  S.VALOR-E.VALOR,0.3,  'KG',  null,  0.3,  'KG'


                      from
                        (select 3 s,sum(valor) valor
                                  from
                                ( select SUM(V.quantidade) VALOR
                                from sigma_fis.v_nota_saida_ICMS v, sigma_ven.categoria_pedido c
                                where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD')
                                and c.sequencial_categoria_pedido = v.categoria and c.operacao ='V'
                                and v.cod_sit <> '02' )
                                                              
                                )s,    
                        (select 3 e,nvl(sum(v.quantidade),2) valor               
                        from sigma_fis.v_nota_entrada_icms v
                        where v.data_saida_entrada between to_date(:data1,'YYYY-MM-DD') and to_date(:data2,'YYYY-MM-DD') 
                        and v.cod_sit <> '02' --and v.codigo_empresa = &emp
                        and v.cfop in (1201,1202,2201,2202,1411,2411) ) e
                       

                                                     
                      WHERE E.E=S.S
`;
