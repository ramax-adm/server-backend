export const GET_PRODUCTS_WITH_LINE_QUERY = /**sql */ `
        select 
            usdp.datavale_code as productInternalCode,
            sp.sensatta_code as productCode,
            sp."name" as productName,
            spl.sensatta_code as productLineCode,
            spl."name" as productLineName
        from dev.utils_sensatta_datavale_products usdp 
        left join "dev".sensatta_products sp on usdp.sensatta_code = sp.sensatta_code 
        left join "dev".sensatta_product_lines spl on sp.product_line_id = spl.sensatta_id;`;
