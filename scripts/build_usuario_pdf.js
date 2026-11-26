const fs = require('fs');
const path = require('path');
const {
  COLORS,
  createBaseDocument,
  drawAcademicCover,
  applyHeadersAndFooters,
  drawH1,
  drawH2,
  drawH3,
  drawParagraph,
  drawBullet,
  drawCallout,
  drawCodeBlock,
  drawTable,
  renderTOCAtPage,
  OUT_DIR
} = require('./pdf_builder');

function generateUsuarioPDF() {
  return new Promise((resolve, reject) => {
    const doc = createBaseDocument();
    const pdfPath = path.join(OUT_DIR, 'MANUAL_DE_USUARIO.pdf');
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // 1. Portada Académica (Página 1)
    drawAcademicCover(doc, {
      title: 'MANUAL DE USUARIO Y GUÍA INTEGRAL DE OPERACIÓN',
      subtitle: 'MANUAL OPERATIVO MULTI-MODO: TABLETS EN MESA, MONITOR KDS, FACTURACIÓN FISCAL DGII Y 36 REPORTES GERENCIALES',
    });

    // Página 2 queda reservada para la Tabla de Contenido (TOC)
    // Pasamos a la Página 3 para iniciar el contenido
    doc.addPage();

    const tracker = [];

    // SECCIÓN 1
    drawH1(doc, '1. VISIÓN GENERAL DEL SISTEMA Y ROLES OPERATIVOS', tracker);
    drawParagraph(doc, 'El sistema del restaurante "Chivo al Campo SRL" es una solución integral Cloud SaaS diseñada específicamente para modernizar y certificar las operaciones de un restaurante gastronómico dominicano. Su arquitectura responde tanto a la agilidad del servicio diario en salón como a las estrictas exigencias de la Dirección General de Impuestos Internos (DGII) bajo el marco de la Ley 32-23 de Facturación Electrónica.');

    drawCodeBlock(doc,
`  ┌────────────────────────────────────────────────────────────────────────┐
  │                           SISTEMA CHIVO AL CAMPO                       │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
   PGM_CLIENTE                   PGM_COCINA                   PGM_ADMIN
 (Tablet en Mesa)            (Monitor KDS Cocina)        (Gerencia, Caja y NCF)
  - Pedidos interactivos      - Comandas en tiempo real   - Facturación Fiscal DGII
  - Sugerencias con IA        - Alertas sonoras audibles  - Cuadre de Caja (Reporte Z)
  - Llamada de mesero         - Tiempos de cocción        - 36 Reportes Gerenciales
  - Pago PayPal QR / Efectivo - Botón directo Despachar   - Almacén, Kardex e IA`);

    drawH2(doc, 'Matriz de Módulos y Roles Operativos:', tracker);
    const rolesHeaders = ['Módulo', 'Identificador', 'Usuarios Destinatarios', 'Funcionalidades Clave'];
    const rolesRows = [
      ['Portada Central', 'PGM_MAIN', 'Público / Todo el personal', 'Portal de enrutamiento con selector de mesas'],
      ['Tablet en Mesa', 'PGM_CLIENTE', 'Comensales en Salón', 'Autoservicio, fotos HD, upselling IA, llamada y PayPal QR'],
      ['Monitor KDS', 'PGM_COCINA', 'Chef Ejecutivo y Cocineros', 'Comandas táctiles, alertas de audio y botón Despachar'],
      ['Panel Administrativo', 'PGM_ADMIN', 'Gerente, Cajero y Contable', 'Dashboard, Plano de mesas, Auditoría NCF y 36 Reportes']
    ];
    drawTable(doc, rolesHeaders, rolesRows, [100, 85, 130, 197]);

    // SECCIÓN 2
    drawH1(doc, '2. PORTAL CENTRAL DE NAVEGACIÓN (PGM_MAIN)', tracker);
    drawParagraph(doc, 'Al acceder a la URL principal del restaurante (http://localhost:8080 o la dirección HTTPS en Google Cloud Run), el usuario es recibido por el Portal Central de Navegación:');

    drawCodeBlock(doc,
`+-------------------------------------------------------------------------+
|                  RESTAURANTE "CHIVO AL CAMPO"                           |
|       UTESA • PROYECTO INTEGRADOR • PROF. IVÁN MENDOZA                  |
|     Diseñado y Desarrollado por: Jeremi Santos Fabian (1-19-7223)        |
+-------------------------------------------------------------------------+
|   [ TABLET EN MESA ]     |    [ MONITOR COCINA ]    |   [ GERENCIA ]    |
|   Seleccione Mesa [04]   |    Display táctil KDS    |   Caja, NCF y     |
|   [ Iniciar Modo Tablet] |    [ Abrir Monitor KDS ] |   36 Reportes     |
+-------------------------------------------------------------------------+`);

    drawBullet(doc, 'Identidad Visual Gastronómica:', 'Tema rústico en Naranja Quemado y Negro Carbón de alto contraste, evocando la tradición del caldero liniero.');
    drawBullet(doc, 'Logotipo Centrado:', 'Emblema oficial destacado en el encabezado con bordes definidos y aspecto profesional.');
    drawBullet(doc, 'Selector de Mesas Dinámico:', 'Permite elegir la mesa a simular (Mesa 01 a Mesa 05) para demostraciones académicas.');
    drawBullet(doc, 'Tres Accesos Directos:', 'Módulos independientes para Comensales, Cocina KDS y Gerencia Administrativa.');

    // SECCIÓN 3
    drawH1(doc, '3. MÓDULO COMENSAL: TABLET EN MESA (PGM_CLIENTE)', tracker);
    drawParagraph(doc, 'Ruta de acceso: /tablet.html?mesa=4 (o seleccionando la mesa desde el portal principal). Optimizado para interacción táctil en tablets Android, iPads o quioscos interactivos en mesa.');

    drawH2(doc, '3.1 Protector de Pantalla Interactivo (Screen Saver)', tracker);
    drawParagraph(doc, 'Cuando la mesa se encuentra en reposo, la tablet proyecta un carrusel fotográfico en alta definición con las especialidades de la casa (Chivo Liniero al Caldero, Chivo Guisado, Tostones y Moro con Coco). Al tocar cualquier punto de la pantalla, se activa inmediatamente el catálogo digital.');

    drawH2(doc, '3.2 Catálogo y Menú Gastronómico Liniero', tracker);
    drawParagraph(doc, 'Los comensales disponen de cuatro categorías con navegación instantánea por pestañas:');
    drawBullet(doc, '1. Carnes de Chivo:', 'Especialidades caprinas: Servicio de Chivo Liniero al Caldero y Chivo Asado Familiar.');
    drawBullet(doc, '2. Guarniciones Criollas:', 'Acompañamientos linieros: Tostones Crujientes, Moro de Guandules con Coco y Arroz Blanco.');
    drawBullet(doc, '3. Bebidas Típicas:', 'Jugo Natural de Chinola recién exprimido, Cerveza Presidente "Vestida de Novia" y Refrescos.');
    drawBullet(doc, '4. Postres Tradicionales:', 'Majarete Típico con Canela y Dulce de Leche Cortada de Monte Cristi.');
    drawParagraph(doc, 'Cada tarjeta muestra foto real, precio unitario, desglose impositivo y botones táctiles + y - para configurar la comanda.');

    drawH2(doc, '3.3 Sugerencias Inteligentes con IA (Upselling)', tracker);
    drawParagraph(doc, 'Al confirmar el plato fuerte, el motor de Inteligencia Artificial (Google Gemini Flash) analiza la comanda y despliega una sugerencia culinaria complementaria en pantalla (ejemplo: "Para acompañar su Chivo al Caldero le sugerimos unos Tostones Linieros crujientes recién hechos"). El comensal puede aceptarla con un solo toque o continuar sin recargo.');

    drawH2(doc, '3.4 Llamada de Asistencia al Mesero', tracker);
    drawParagraph(doc, 'La tablet incluye en la esquina inferior el botón destacado "Llamar al Mesero". Al ser presionado:');
    drawBullet(doc, 'Confirmación en Mesa:', 'El botón cambia a estado activo informando que el mozo viene en camino.');
    drawBullet(doc, 'Alerta en Salón:', 'El Panel de Gerencia activa una alerta sonora audible y tiñe la mesa en color rojo parpadeante con el rótulo "LLAMANDO MESERO" hasta que el personal acude a atenderla.');

    drawH2(doc, '3.5 Solicitud de Comprobante Fiscal (DGII Ley 32-23)', tracker);
    drawParagraph(doc, 'Al solicitar la cuenta, el comensal selecciona el tipo de comprobante requerido conforme a la legislación tributaria:');
    drawBullet(doc, 'Comprobante de Consumo (e-CF E32 / B02):', 'Generación inmediata para consumo personal o familiar sin requerir RNC.');
    drawBullet(doc, 'Crédito Fiscal (e-CF E31 / B01):', 'Para fines comerciales y deducibilidad de impuestos. Se despliega un teclado numérico táctil para ingresar el RNC o Cédula del cliente, validando en línea su razón social y estructura tributaria.');

    drawH2(doc, '3.6 Pasarela Digital con Código QR PayPal y Efectivo', tracker);
    drawParagraph(doc, 'El cliente selecciona su modalidad de pago:');
    drawBullet(doc, 'Pago en Efectivo:', 'Avisa al mesero para cobrar y llevar el cambio a la mesa.');
    drawBullet(doc, 'Pasarela Digital PayPal QR:', 'La tablet genera un código QR dinámico con el importe liquidado y convertido a dólares según la tasa de cambio vigente. El cliente escanea el código con su teléfono y efectúa el pago seguro al instante.');

    drawH2(doc, '3.7 Visualización del Ticket Fiscal con QR Oficial DGII', tracker);
    drawParagraph(doc, 'Procesado el pago, se muestra el comprobante fiscal electrónico formal:');
    drawBullet(doc, 'Datos del Emisor:', 'Razón Social: Restaurante Chivo al Campo SRL • RNC: 132-90740-1.');
    drawBullet(doc, 'Secuencia Fiscal:', 'e-NCF emitido (E31 o E32) con fecha y hora exacta.');
    drawBullet(doc, 'Desglose Impositivo:', 'Subtotal Neto + ITBIS retenido (18%) + Propina Legal de Ley 18-88 (10%).');
    drawBullet(doc, 'Código QR Tributario:', 'Escaneable con cualquier smartphone para verificar la autenticidad del timbre fiscal directamente ante la plataforma de la DGII.');

    // SECCIÓN 4
    drawH1(doc, '4. MÓDULO DE COCINA: MONITOR TÁCTIL KDS (PGM_COCINA)', tracker);
    drawParagraph(doc, 'Ruta de acceso: /cocina.html. El Kitchen Display System (KDS) reemplaza las comandas de papel por una pantalla táctil industrial de alta visibilidad para la brigada de cocineros y el Chef Ejecutivo.');

    drawCodeBlock(doc,
`+-------------------------------------------------------------------------+
| MONITOR DE COCINA - CHIVO AL CAMPO              🔔  🔊  12:45 PM        |
+-------------------------------------------------------------------------+
| [ COMANDA: MESA 04 ]             | [ COMANDA: DELIVERY 99 ]             |
| Hora: 12:40 PM • Hace: 5 MINS    | Hora: 12:42 PM • Hace: 3 MINS        |
|----------------------------------|--------------------------------------|
| • 2x Servicio Chivo Liniero      | • 1x Chivo Asado Familiar            |
| • 2x Tostones Crujientes         | • 1x Moro de Guandules con Coco      |
| • 1x Jugo Natural de Chinola     | • 2x Cerveza Presidente              |
|----------------------------------|--------------------------------------|
| [ EN PREPARACIÓN ] [ DESPACHAR ] | [ LISTO / ENTREGAR ] [ DESPACHAR ]   |
+-------------------------------------------------------------------------+`);

    drawH2(doc, '4.1 Pantalla de Alta Visibilidad y Reloj en Tiempo Real', tracker);
    drawBullet(doc, 'Diseño Antirreflejo:', 'Esquema de color oscuro optimizado para ambientes de cocina con humo, vapor y calor.');
    drawBullet(doc, 'Reloj en Vivo:', 'Sincronizado con la hora legal dominicana para control de tiempos de servicio.');
    drawBullet(doc, 'Cronómetro por Comanda:', 'Calcula en tiempo real los minutos transcurridos desde que la orden ingresó.');

    drawH2(doc, '4.2 Alertas Sonoras Audibles con Web Audio API', tracker);
    drawParagraph(doc, 'Cada vez que una mesa de salón o una llamada telefónica envía una comanda nueva, el monitor emite un repique audible de dos tonos sintetizados mediante Web Audio API, asegurando que la cocina no pase por alto ningún pedido.');

    drawH2(doc, '4.3 Ciclo Culinario y Botón Directo "DESPACHAR"', tracker);
    drawParagraph(doc, 'Cada comanda cuenta con dos controles táctiles ergonómicos:');
    drawBullet(doc, 'Botón de Estado Operativo:', 'Permite alternar entre "EN PREPARACIÓN" (fuego naranja) y "LISTO / ENTREGAR" (campana dorada), notificando en tiempo real a la tablet del cliente.');
    drawBullet(doc, 'Botón Directo DESPACHAR (Verde Esmeralda):', 'Permite con un solo toque retirar la orden de la pantalla cuando los platos salen de cocina, manteniendo el monitor limpio y despejado.');

    drawH2(doc, '4.4 Diferenciación de Comandas Salón vs Delivery', tracker);
    drawParagraph(doc, 'Las órdenes para despacho a domicilio se destacan con el rótulo "DELIVERY (MESA 99)", indicando al personal que deben empacarse con envases térmicos, cubiertos desechables y bolsas selladas.');

    // SECCIÓN 5
    drawH1(doc, '5. MÓDULO ADMINISTRATIVO Y GERENCIAL (PGM_ADMIN)', tracker);
    drawParagraph(doc, 'Ruta de acceso: /admin.html. Centro neurálgico del restaurante para la administración financiera, control de caja, auditoría fiscal DGII, reportes y supervisión de salón.');

    drawH2(doc, '5.1 Autenticación de Usuarios y Roles', tracker);
    const userTableHeaders = ['Usuario', 'Contraseña por Defecto', 'Rol Operativo', 'Privilegios Asignados'];
    const userTableRows = [
      ['admin', 'admin123', 'Gerente General', 'Acceso irrestricto: KPIs, NCF, 36 Reportes, Purga y Personal'],
      ['caja', 'admin123', 'Cajera Principal', 'Facturación, Cuadre Z, Delivery y Liberación de Mesas'],
      ['chef', 'admin123', 'Chef Ejecutivo', 'Monitoreo KDS, Almacén de Carnes y Registro de Mermas']
    ];
    drawTable(doc, userTableHeaders, userTableRows, [75, 110, 105, 222]);

    drawH2(doc, '5.2 Dashboard de Indicadores Clave (KPIs en Vivo)', tracker);
    drawParagraph(doc, 'El panel superior consolida las cifras financieras de la jornada:');
    drawBullet(doc, 'Ventas Totales:', 'Monto bruto facturado acumulado en el día.');
    drawBullet(doc, 'ITBIS Recaudado (18%):', 'Impuestos retenidos listos para declaración jurada mensual en DGII.');
    drawBullet(doc, 'Propina Legal (10%):', 'Fondo de propina obligatoria de ley para liquidación de los 4 mozos.');
    drawBullet(doc, 'Volumen de Facturas:', 'Total de comprobantes e-CF emitidos en la sesión.');
    drawBullet(doc, 'Ticket Promedio:', 'Valor medio consumido por mesa en el restaurante.');

    drawH2(doc, '5.3 Plano de Mesas y Salón (Supervisión y Liberación)', tracker);
    drawParagraph(doc, 'Proporciona una vista en cuadrícula del salón con semaforización en tiempo real:');
    drawBullet(doc, 'Verde (DISPONIBLE):', 'Mesa libre. Incluye botón directo para lanzar el modo tablet.');
    drawBullet(doc, 'Ámbar (OCUPADA):', 'Mesa con pedido en curso. Muestra el total acumulado y detalle de platos.');
    drawBullet(doc, 'Rojo Parpadeante (LLAMANDO MESERO):', 'Mesa solicitando asistencia. Botón directo "Atender".');
    drawParagraph(doc, 'Controles de Liberación:');
    drawBullet(doc, 'Liberar Mesa Individual:', 'Botón "Liberar" en cada tarjeta. Limpia órdenes y la deja en verde permanente.');
    drawBullet(doc, 'Liberar Todas las Mesas:', 'Botón superior rojo que resetea todo el salón en un clic para iniciar nuevas demostraciones sin pedidos huérfanos.');

    drawH2(doc, '5.4 Caja y Gestión de Delivery Telefónico (Mesa 99)', tracker);
    drawParagraph(doc, 'Permite a la cajera tomar pedidos telefónicos: ingresa el nombre, teléfono y dirección del cliente en Villa Elisa, selecciona los platos del menú y envía la orden. El sistema calcula el total eximiendo la propina legal de salón del 10% y envía la comanda al KDS.');

    drawH2(doc, '5.5 Auditoría Fiscal e-NCF DGII y Anulación con E34', tracker);
    drawParagraph(doc, 'Módulo homologado con la Ley 32-23 de Facturación Electrónica:');
    drawBullet(doc, 'Historial Fiscal Completo:', 'Listado de las 25 facturas fiscales con número de e-NCF, fecha, mesa, ITBIS, propina y estado.');
    drawBullet(doc, 'Reimpresión de Ticket Térmico:', 'Genera el comprobante oficial con código QR fiscal verificable en la DGII.');
    drawBullet(doc, 'Anulación Formal con Nota de Crédito Electrónica E34:', 'Asistente de 4 pasos para ingresar el motivo DGII. Emite la nota E34, cancela la factura y devuelve automáticamente las libras de carne y víveres al inventario de almacén.');
    drawBullet(doc, 'Purga y Reinicio de Facturas (PIN 1234):', 'Permite al profesor o evaluador limpiar facturas de demostración y reiniciar las secuencias e-NCF desde cero.');

    // SECCIÓN 5.6: REPORTE MAESTRO DE 36 REPORTES
    drawH1(doc, '5.6 CENTRO MAESTRO DE CONSULTAS Y REPORTES (CATÁLOGO OFICIAL DE 36)', tracker);
    drawParagraph(doc, 'El sistema cuenta con un Centro Integral de Reportes con 36 consultas operativas, fiscales y financieras divididas en 6 categorías estratégicas, con filtros por fecha, buscador en vivo y botones de exportación a Excel (CSV) e Impresión / PDF:');

    drawH2(doc, 'Catálogo Detallado de los 36 Reportes:', tracker);

    const repHeaders = ['Código', 'Nombre Oficial del Reporte', 'Categoría', 'Propósito Técnico y Operativo'];
    const repRows = [
      // Categoría 1
      ['REP-01', 'Ventas Generales por Período', 'Ventas', 'Consolidado cronológico de facturas emitidas, subtotales e impuestos'],
      ['REP-02', 'Ventas por Método de Pago', 'Ventas', 'Distribución porcentual: Efectivo vs Tarjetas POS vs PayPal QR'],
      ['REP-03', 'Facturación por Mesa y Salón', 'Ventas', 'Rendimiento y ventas acumuladas por cada mesa física del salón'],
      ['REP-04', 'Facturas Anuladas con Nota de Crédito E34', 'Ventas', 'Auditoría tributaria de cancelaciones y motivos fiscales DGII'],
      ['REP-05', 'Ticket Promedio y Consumo por Mesa', 'Ventas', 'Métricas de consumo medio, máximo y mínimo por factura'],
      ['REP-06', 'Ventas por Turno de Trabajo', 'Ventas', 'Comparativa de recaudación: Turno Mañana vs Turno Noche'],
      ['REP-31', 'Ventas Detalladas por Hora Exacta', 'Ventas', 'Curva horaria de facturación desde las 11:00 AM hasta las 11:00 PM'],

      // Categoría 2
      ['REP-07', 'Formato 607 DGII Oficial', 'Fiscal DGII', 'Estructura formal de ventas exigida mensualmente por la DGII'],
      ['REP-08', 'Resumen de Comprobantes Fiscales e-CF', 'Fiscal DGII', 'Conteo y totales desglosados de facturas E31, E32 y notas E34'],
      ['REP-09', 'Formato 608 DGII: Comprobantes Anulados', 'Fiscal DGII', 'Relación jurada de facturas canceladas con NCF afectado'],
      ['REP-10', 'Auditoría de ITBIS Recaudado (18%)', 'Fiscal DGII', 'Base imponible y monto de ITBIS listo para formulario IT-1'],
      ['REP-11', 'Liquidación de Propina Legal (Ley 18-88)', 'Fiscal DGII', 'Auditoría del 10% de propina obligatoria para mozos'],
      ['REP-32', 'Directorio de Clientes con RNC Fiscal', 'Fiscal DGII', 'Padrón de empresas que solicitaron comprobantes de Crédito Fiscal E31'],

      // Categoría 3
      ['REP-12', 'Ranking de Platos Más Vendidos (Top)', 'Menú', 'Listado ordenado de mayor a menor demanda culinaria'],
      ['REP-13', 'Ventas por Categoría de Menú', 'Menú', 'Desglose por Carnes, Guarniciones, Bebidas y Postres'],
      ['REP-14', 'Platos de Menor Rotación', 'Menú', 'Identificación de especialidades de baja salida para promociones'],
      ['REP-15', 'Efectividad del Motor de Upselling IA', 'Menú', 'Tasa de conversión de sugerencias automáticas en tablets'],
      ['REP-16', 'Rentabilidad y Margen Estimado por Plato', 'Menú', 'Costo de ingredientes versus precio de venta en menú'],
      ['REP-33', 'Consumo de Guarniciones Criollas', 'Menú', 'Volumen de Tostones, Moro con Coco, Yuca y Arepitas despachadas'],

      // Categoría 4
      ['REP-17', 'Eficiencia y Tiempos de Cocina KDS', 'Cocina KDS', 'Minutos promedio desde que la mesa ordena hasta que cocina despacha'],
      ['REP-18', 'Horas Pico y Concentración de Demanda', 'Cocina KDS', 'Franjas de máxima ocupación para reforzar brigada de cocina'],
      ['REP-19', 'Estado de Comandas: Despachadas vs Pend.', 'Cocina KDS', 'Auditoría de órdenes activas en el monitor táctil'],
      ['REP-20', 'Canal de Atención: Salón vs Delivery', 'Cocina KDS', 'Proporción de comensales en restaurante versus despachos móviles'],
      ['REP-34', 'Control de Calidad y Mermas en Cocina', 'Cocina KDS', 'Registro de platos devueltos, mermas de carne y ajustes culinarios'],

      // Categoría 5
      ['REP-21', 'Valorización y Existencias de Almacén', 'Almacén', 'Stock actual en unidades/libras y valor financiero total'],
      ['REP-22', 'Insumos Críticos (Punto de Reorden)', 'Almacén', 'Materias primas que requieren reposición inmediata'],
      ['REP-23', 'Kardex: Movimientos Históricos de Insumos', 'Almacén', 'Entradas por compras y salidas por recetas facturadas'],
      ['REP-24', 'Reintegro de Insumos por Anulaciones E34', 'Almacén', 'Libras de carne y víveres reincorporados tras anulación fiscal'],
      ['REP-25', 'Directorio de Suplidores de Monte Cristi', 'Almacén', 'Registro de ganaderos y productores agrícolas locales'],
      ['REP-35', 'Consumo Semanal de Carne de Chivo', 'Almacén', 'Libras de chivo lechal procesadas en el caldero por día'],

      // Categoría 6
      ['REP-26', 'Cuadre de Caja Diario y Reporte Z Fiscal', 'Caja y Finanzas', 'Arqueo oficial diario, balance de efectivo y cierre fiscal'],
      ['REP-27', 'Conciliación: Efectivo vs Pasarela PayPal', 'Caja y Finanzas', 'Cotejo de fondos físicos en gaveta versus pasarela en la nube'],
      ['REP-28', 'Productividad y Turnos del Personal', 'Caja y Finanzas', 'Supervisión de horarios, asignación de turnos y estado en nómina'],
      ['REP-29', 'Auditoría de Secuencia y Saltos e-NCF', 'Caja y Finanzas', 'Certificación matemática de 0% saltos en numeración tributaria'],
      ['REP-30', 'Resumen Ejecutivo Gerencial y Proyección IA', 'Caja y Finanzas', 'Informe general consolidado con recomendaciones predictivas Gemini'],
      ['REP-36', 'Liquidación y Balance de Propinas de Mozos', 'Caja y Finanzas', 'Distribución equitativa del fondo del 10% entre los 4 camareros']
    ];

    drawTable(doc, repHeaders, repRows, [48, 155, 75, 234]);

    drawH2(doc, 'Exportación de Reportes:', tracker);
    drawBullet(doc, 'Exportar CSV (Excel):', 'Descarga el reporte activo en formato estructurado delimitado por comas para su análisis en Microsoft Excel o Google Sheets.');
    drawBullet(doc, 'Imprimir / Guardar en PDF:', 'Genera una vista imprimible formal con el membrete institucional de UTESA y cabecera del Restaurante Chivo al Campo SRL.');

    // SECCIONES 5.7 A 5.11
    drawH1(doc, '5.7 ALMACÉN, INSUMOS Y KARDEX', tracker);
    drawParagraph(doc, 'Controla las materias primas del restaurante en tiempo real. Cada plato facturado descuenta automáticamente los insumos de su receta (libras de carne de chivo lechal, plátanos, arroz liniero, habichuelas, chinola y condimentos). Si un insumo desciende por debajo de su stock de seguridad, el sistema lo resalta en color rojo crítico.');

    drawH1(doc, '5.8 DIRECTORIO DE SUPLIDORES DE MONTE CRISTI', tracker);
    drawParagraph(doc, 'Mantiene el padrón de socios comerciales de la Línea Noroeste: Asociación de Criadores de Chivo de Monte Cristi (suministro de chivo fresco), Productores Agrícolas de Guayubín (plátanos verdes) y la Cooperativa Apícola del Noroeste (miel y aderezos linieros).');

    drawH1(doc, '5.9 GESTIÓN DE PERSONAL Y TURNOS', tracker);
    drawParagraph(doc, 'Administra a los 10 colaboradores del restaurante (Chef, cocineros, 4 camareros, cajera y personal de limpieza), asignándoles turnos diurnos (8:00 AM - 4:00 PM) o vespertinos (4:00 PM - 12:00 AM) y supervisando su estatus activo.');

    drawH1(doc, '5.10 DIAGNÓSTICO PREDICTIVO ASISTIDO POR IA (GOOGLE GEMINI)', tracker);
    drawParagraph(doc, 'Analiza la tendencia de consumo de los últimos 7 días y emite un informe predictivo en lenguaje natural, recomendando cuántas libras de chivo liniero comprar antes del fin de semana para garantizar stock sin incurrir en mermas.');

    drawH1(doc, '5.11 MÓDULO SAAS Y LICENCIAMIENTO TECNOLÓGICO', tracker);
    drawParagraph(doc, 'Monitorea el plan de suscripción Cloud del restaurante con botón de renovación mediante la pasarela digital PayPal.');

    // SECCIÓN 6
    drawH1(doc, '6. PREGUNTAS FRECUENTES Y GUÍA DE DEMOSTRACIÓN ACADÉMICA', tracker);
    drawH2(doc, '¿Cómo iniciar una demostración limpia desde cero ante el profesor?', tracker);
    drawBullet(doc, 'Paso 1:', 'Acceda a /admin.html e inicie sesión con admin y admin123.');
    drawBullet(doc, 'Paso 2:', 'En la pestaña "Plano de Mesas", haga clic en "Liberar Todas las Mesas" para asegurar que todas se encuentren en color verde (disponible).');
    drawBullet(doc, 'Paso 3:', 'Si desea reiniciar los contadores de facturas para emitir la primera orden en vivo, diríjase a "Auditoría Fiscal NCF", pulse "Reiniciar Facturas", digite el PIN 1234 y confirme.');

    drawH2(doc, '¿Qué hacer si una mesa no cambia de color al enviar una orden?', tracker);
    drawParagraph(doc, 'El sistema sincroniza mediante WebSockets. Si la conexión tuvo una fluctuación momentánea, presione el botón "Actualizar Salón" en el plano de mesas para forzar una sincronización instantánea.');

    drawH2(doc, '¿Cómo validar un comprobante fiscal ante la DGII?', tracker);
    drawParagraph(doc, 'Al emitir un ticket de Consumo (E32) o Crédito Fiscal (E31), presione "Ver Ticket" y escanee el código QR con cualquier lector o cámara de teléfono celular. El código abrirá la URL del timbre electrónico validando el RNC 132-90740-1.');

    drawParagraph(doc, 'Documento oficial elaborado para la sustentación del Proyecto Integrador en UTESA.', { bold: true, align: 'center' });
    drawParagraph(doc, 'Jeremi Santos Fabian (1-19-7223) • Prof. Iván Mendoza • UTESA Recinto Santiago 2026', { align: 'center', color: COLORS.muted });

    // RENDERIZAR TABLA DE CONTENIDO DINÁMICA EN LA PÁGINA 2
    renderTOCAtPage(doc, 1, tracker);

    // Aplicar numeración y encabezados a todas las páginas de contenido
    applyHeadersAndFooters(doc, 'Manual de Usuario y Operación');

    doc.end();

    writeStream.on('finish', () => {
      console.log('PDF de Usuario generado con éxito en:', pdfPath);
      resolve(pdfPath);
    });

    writeStream.on('error', err => {
      console.error('Error al generar PDF de Usuario:', err);
      reject(err);
    });
  });
}

module.exports = { generateUsuarioPDF };

if (require.main === module) {
  generateUsuarioPDF();
}
