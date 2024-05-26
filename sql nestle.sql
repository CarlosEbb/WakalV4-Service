Select * FROM (
    SELECT 
        e.nroControl,
        nroDocSL,
        cliente as nombre_cliente,
        serie,
        rif,
        totalBs as neto_pagar,
        igtfBs as igtf,
        subtotalBs as total_pagar,
        ivaBs as base_imponible,
        totalExentoBs as monto_iva,

        fechaEmisionContabilidad as fechaCarga,
        horaProceso,
        tipoDoc,
        encript,
        
        statusAnulacion,
        motivoAnulacion,
        fechaAnulacion
    FROM Encabezado AS e LEFT JOIN sumario AS s ON e.nroControl = s.nroControl 

    UNION ALL

    SELECT
        e.nroControlPreventa as nroControl,
        nroDocSL,
        nombreEmisor as nombre_cliente,
        serie,
        RIFEmisor as rif,
        Total as neto_pagar,
        igtf as igtf,
        Subtota as total_pagar,
        MontoIva as base_imponible,
        Texento as monto_iva,

        fechaCarga,
        horaCarga as horaProceso,
        tipoDoc,
        encript,

        statusAnulacion,
        motivoAnulacion,
        fechaAnulacion
    FROM Encabezado_Preventas AS e LEFT JOIN sumario_Preventas AS s ON e.nroControlPreventa = s.nroControlPreventa 

    UNION ALL

    SELECT
        nroControl,
        nroDocSL,
        conductor as nombre_cliente,
        'F' as serie,
        ciConductor as rif,
        '' as neto_pagar,
        '' as igtf,
        '' as total_pagar,
        '' as base_imponible,
        '' as monto_iva,

        fechaCarga,
        horaCarga as horaProceso,
        'GD' as tipoDoc,
        encript,

        '' as statusAnulacion,
        '' as motivoAnulacion,
        '' as fechaAnulacion
    FROM "dba"."EncabezadoGuiaDespacho"


    UNION ALL

    SELECT 
        e.nroControlAutoFactura as nroControl,
        nroDocSL,
        CUS_Name as nombre_cliente,
        serie,
        CUS_RegCode as rif,
        ValorTotalBS as neto_pagar,
        '' as igtf,
        TotalAmountBS as total_pagar,
        VAT16BS as base_imponible,
        TotalExtconDescBS as monto_iva,

        fechaCarga,
        horaCarga as horaProceso,
        'FA' as tipoDoc,
        encript,

        statusAnulacion,
        motivoAnulacion,
        fechaAnulacion
    FROM Encabezado_AutoFactura AS e LEFT JOIN Sumario_AutoFactura AS s ON e.nroControlAutoFactura = s.nroControlAutoFactura
) as Encabezado