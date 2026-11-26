const fs = require('fs');
const path = require('path');
const {
  THEME,
  IMAGES_DIR,
  OUT_DIR,
  createAcademicDoc,
  drawAcademicCover,
  finalizeDocument,
  drawH1,
  drawH2,
  drawParagraph,
  drawBullet,
  drawCodeBlock,
  drawTable,
  drawCallout,
  drawDishGallery,
  drawAcademicTOC
} = require('./pdf_academic_engine');

function buildUsuarioContent(doc, pageTracker) {
  const mark = (num, title, level = 1) => {
    if (pageTracker) {
      pageTracker.push({
        num,
        title: `${num} ${title}`,
        page: doc.bufferedPageRange().count,
        level
      });
    }
  };

  // 1.0 INTRODUCCIÓN GENERAL Y MARCO NORMATIVO DOMINICANO
  mark('1.0', 'Introducción General y Marco Normativo Dominicano');
  drawH1(doc, '1.0', 'Introducción General y Marco Normativo Dominicano');
  drawParagraph(doc, 'El presente Manual de Operación y Guía Integral de Usuario describe exhaustivamente las funcionalidades, procesos y políticas del sistema tecnológico implementado para el restaurante gastronómico "Chivo al Campo SRL", ubicado en el Km 2 de la Carretera Duarte, Villa Elisa, Provincia Monte Cristi, República Dominicana.');
  drawParagraph(doc, 'La solución tecnológica surge con el objetivo primordial de resolver los cuellos de botella característicos de la gastronomía regional liniera: tiempos excesivos de espera en toma de comandas manuscritas, extravío de órdenes de papel entre el salón y los calderos de cocina, retrasos en la liquidación de cuentas y la falta de cumplimiento en la emisión de comprobantes fiscales electrónicos exigidos por la ley.');

  drawH2(doc, '1.1', 'Marco Legal Tributario de la República Dominicana');
  drawParagraph(doc, 'El sistema ha sido homologado bajo las regulaciones fiscales vigentes impuestas por la Dirección General de Impuestos Internos (DGII):');
  drawBullet(doc, 'Ley 32-23 de Facturación Electrónica:', 'Obligatoriedad de emisión, timbrado digital y validación en tiempo real de comprobantes fiscales electrónicos (e-CF) estructurados bajo el estándar XML con firma digital.');
  drawBullet(doc, 'Comprobante de Crédito Fiscal Electrónico (e-CF Tipo 31 / B01):', 'Destinado a personas jurídicas o físicas registradas que requieren sustentar costos y gastos deducibles del Impuesto Sobre la Renta (ISR) o adelantar el ITBIS.');
  drawBullet(doc, 'Comprobante de Consumo Electrónico (e-CF Tipo 32 / B02):', 'Emitido a consumidores finales para consumos individuales o familiares sin valor para crédito fiscal.');
  drawBullet(doc, 'Nota de Crédito Electrónica (e-CF Tipo 34 / B04):', 'Documento tributario obligatorio para modificar, anular facturas emitidas o aplicar devoluciones de platos y servicios, con reintegro contable y de almacén.');
  drawBullet(doc, 'Ley 253-12 (ITBIS del 18%):', 'Aplicación del Impuesto a la Transferencia de Bienes Industrializados y Servicios sobre la base imponible neta.');
  drawBullet(doc, 'Ley 18-88 (Propina Legal del 10%):', 'Retención obligatoria del 10% por concepto de servicio de salón para su distribución equitativa y mensual entre el personal de camareros (excluida automáticamente en órdenes de delivery para llevar).');

  drawH2(doc, '1.2', 'Matriz de Perfiles, Privilegios y Credenciales de Acceso');
  const roleHeaders = ['Perfil de Usuario', 'Credenciales por Defecto', 'Estación de Trabajo', 'Alcance y Responsabilidades'];
  const roleRows = [
    ['Comensal (Autoservicio)', 'Sin contraseña (Táctil)', 'Tablets en Mesas 01 a 05', 'Autoservicio, selección de menú, upselling IA, llamada de mesero, facturación y pago QR'],
    ['Chef Ejecutivo / Cocina', 'chef / admin123', 'Monitor KDS en Cocina', 'Visualización de comandas táctiles, cronómetro de cocción, cambio de estados y despacho'],
    ['Cajera Principal', 'caja / admin123', 'Estación de Caja', 'Facturación, cobro en efectivo, toma de pedidos telefónicos para delivery y arqueo Z'],
    ['Gerente General / Auditor', 'admin / admin123', 'Terminal Administrativa', 'Acceso irrestricto: Dashboard KPIs, plano de mesas, 36 reportes, auditoría NCF, almacén y nómina']
  ];
  drawTable(doc, 'Tabla 1: Matriz de Roles, Credenciales y Privilegios del Ecosistema.', roleHeaders, roleRows, [105, 85, 105, 195]);

  // 2.0 PORTAL CENTRAL DE ENRUTAMIENTO (PGM_MAIN)
  mark('2.0', 'Portal Central de Enrutamiento (PGM_MAIN)');
  drawH1(doc, '2.0', 'Portal Central de Enrutamiento (PGM_MAIN)');
  drawParagraph(doc, 'Al acceder a la dirección raíz de la plataforma (http://localhost:8080/, http://localhost:3000/ o la URL en la nube Google Cloud Run), el usuario es recibido por el Portal Central de Enrutamiento. Este portal fue concebido como el distribuidor de tráfico para todas las pantallas del restaurante.');

  drawH2(doc, '2.1', 'Identidad Visual Gastronómica y Elementos de Portada');
  drawBullet(doc, 'Esquema de Color Rústico Liniero:', 'Fondo en negro carbón (#0b0704) con detalles en naranja vivo (#ea580c), evocando la brasa del caldero y el asado liniero.');
  drawBullet(doc, 'Logotipo Oficial Destacado:', 'Emblema institucional de "Chivo al Campo" centrado, con marco dorado y resolución optimizada.');
  drawBullet(doc, 'Selector Dinámico de Mesas del Salón:', 'Menú desplegable que permite asociar la sesión táctil a cualquiera de las mesas del establecimiento:');
  drawParagraph(doc, '  • Mesa 01: Terraza Campestre (Ambiente exterior al aire libre).' +
                     '\n  • Mesa 02: Salón Central (Área climatizada con vista a la barra).' +
                     '\n  • Mesa 03: Jardín Liniero (Zona para comensales en áreas verdes).' +
                     '\n  • Mesa 04: VIP Caldero (Mesa principal para celebraciones y grupos).' +
                     '\n  • Mesa 05: Familiar Liniera (Mesa espaciosa para familias numerosas).');

  drawH2(doc, '2.2', 'Accesos Rápidos a Módulos del Sistema');
  drawBullet(doc, 'Tarjeta "Tablet en Mesa":', 'Abre el módulo comensal para la mesa seleccionada mediante la ruta /tablet.html?mesa=X.');
  drawBullet(doc, 'Tarjeta "Monitor de Cocina KDS":', 'Lanza la interfaz táctil de la brigada de cocineros (/cocina.html).');
  drawBullet(doc, 'Tarjeta "Gerencia y Administración":', 'Acceso con autenticación SHA-256 para el panel de control (/admin.html).');
  drawBullet(doc, 'Acceso a Documentación Oficial:', 'Botones directos para visualizar el Manual de Instalación y el Manual de Usuario en PDF oficial.');

  // 3.0 MÓDULO COMENSAL: AUTOSERVICIO TÁCTIL EN MESA (PGM_CLIENTE)
  mark('3.0', 'Módulo Comensal: Autoservicio en Mesa (PGM_CLIENTE)');
  drawH1(doc, '3.0', 'Módulo Comensal: Autoservicio en Mesa (PGM_CLIENTE)');
  drawParagraph(doc, 'Ruta de acceso: /tablet.html?mesa=X. Diseñado para dispositivos táctiles (tablets Android, iPad o quioscos integrados en cada mesa física). Garantiza una experiencia de autoservicio moderna y fluida.');

  drawH2(doc, '3.1', 'Protector de Pantalla Interactivo (Screen Saver)');
  drawParagraph(doc, 'Cuando la mesa no tiene actividad de clientes, la tablet entra automáticamente en modo protector de pantalla proyectando fotografías en alta definición de las especialidades linieras recién preparadas. Con solo tocar cualquier punto de la pantalla, el sistema desbloquea instantáneamente el catálogo de platos.');

  drawH2(doc, '3.2', 'Catálogo Gastronómico y Fotografías Reales de Platos');
  drawParagraph(doc, 'El catálogo clasifica la gastronomía tradicional liniera en cuatro categorías organizadas por pestañas táctiles:');
  drawBullet(doc, '1. Carnes de Chivo:', 'Especialidades culinarias preparadas con chivo lechal criado en Monte Cristi, sazonado con orégano de la cordillera septentrional y ajo criollo (Chivo Liniero al Caldero y Chivo Asado Especial).');
  drawBullet(doc, '2. Guarniciones Criollas:', 'Acompañamientos típicos como Tostones Crujientes Criollos fritos al momento, Moro de Guandules con Coco y Arroz Blanco liniero.');
  drawBullet(doc, '3. Bebidas Tradicionales:', 'Jugo Natural de Chinola de la cuenca del río Yaque del Norte, Cerveza Presidente "vestida de novia" y Refrescos.');
  drawBullet(doc, '4. Postres Típicos:', 'Majarete tradicional con canela espolvoreada y Dulce de Leche cortada liniero.');

  // Galería de fotos reales
  const dishes = [
    {
      name: 'Chivo Liniero al Caldero',
      price: 'RD$ 450.00',
      desc: 'Carne tierna estofada con orégano silvestre, ajíes y especias linieras.',
      imgPath: path.join(IMAGES_DIR, 'chivo_liniero.jpg')
    },
    {
      name: 'Chivo Asado Especial',
      price: 'RD$ 480.00',
      desc: 'Corte caprino dorado lentamente al horno con aderezo rústico de la casa.',
      imgPath: path.join(IMAGES_DIR, 'chivo_asado.jpg')
    },
    {
      name: 'Tostones Crujientes Criollos',
      price: 'RD$ 120.00',
      desc: 'Plátano verde seleccionado de Guayubín, frito dos veces con sal marina.',
      imgPath: path.join(IMAGES_DIR, 'tostones.jpg')
    },
    {
      name: 'Moro de Guandules con Coco',
      price: 'RD$ 150.00',
      desc: 'Arroz tradicional liniero con guandules frescos y leche de coco pura.',
      imgPath: path.join(IMAGES_DIR, 'moro_guandules.jpg')
    }
  ];
  drawDishGallery(doc, dishes, 'Figura 1: Muestra fotográfica del menú gastronómico liniero en la tablet.');

  drawH2(doc, '3.3', 'Control del Carrito y Desglose Impositivo en Vivo');
  drawParagraph(doc, 'Cada tarjeta de plato cuenta con controles táctiles "+" y "-" para agregar raciones. En el lateral de la pantalla, el comensal visualiza el desglose transparente de su cuenta:');
  drawBullet(doc, 'Subtotal Neto:', 'Suma de los precios base de los platos seleccionados.');
  drawBullet(doc, 'ITBIS Retenido (18%):', 'Impuesto legal calculado con precisión de dos decimales.');
  drawBullet(doc, 'Propina Legal (10%):', 'Retención obligatoria de salón para beneficio equitativo del personal de mozos.');
  drawBullet(doc, 'Total General a Pagar:', 'Monto consolidado en pesos dominicanos (RD$).');

  drawH2(doc, '3.4', 'Motor de Recomendaciones Inteligentes (Google Gemini Flash IA)');
  drawParagraph(doc, 'Al confirmar el plato fuerte en la tablet, el sistema envía los identificadores de la orden al modelo Google Gemini Flash. El motor analiza la combinación gastronómica y genera una recomendación contextual educada en pantalla (ejemplo: "Para acompañar su Chivo al Caldero, le sugerimos añadir unos crujientes Tostones Criollos recién hechos"). El comensal puede aceptar la sugerencia con un solo toque o ignorarla sin recargo.');

  drawH2(doc, '3.5', 'Llamada Sonora de Mesero');
  drawParagraph(doc, 'En la esquina inferior izquierda de la tablet se ubica el botón destacado "Llamar al Mesero". Al presionarlo:');
  drawBullet(doc, 'Confirmación en Tablet:', 'El botón cambia a color ámbar informando que el personal ha sido notificado.');
  drawBullet(doc, 'Alerta en Gerencia y Salón:', 'El panel de gerencia emite una señal sonora y el plano de mesas tiñe la tarjeta en color rojo parpadeante con el rótulo "LLAMANDO MESERO" hasta que el camarero pulsa "Atender".');

  drawH2(doc, '3.6', 'Solicitud y Emisión de Comprobantes Fiscales Electrónicos (e-CF)');
  drawParagraph(doc, 'Al pulsar "Pedir Cuenta y Facturar", la tablet despliega la selección de comprobante tributario:');
  drawBullet(doc, 'Opción 1: Factura de Consumo (e-CF E32):', 'Generación instantánea para consumo personal o familiar, sin necesidad de ingresar RNC.');
  drawBullet(doc, 'Opción 2: Factura de Crédito Fiscal (e-CF E31):', 'Para fines empresariales y deducción del ISR.');
  drawParagraph(doc, 'Al seleccionar Crédito Fiscal, se despliega un teclado numérico táctil en pantalla para digitar el RNC (9 dígitos) o Cédula (11 dígitos). El software aplica el algoritmo del módulo 11 de la DGII para certificar el dígito verificador y consulta en tiempo real la razón social oficial de la empresa compradora.');

  drawH2(doc, '3.7', 'Pasarela Digital de Pago con Código QR de PayPal y Efectivo');
  drawParagraph(doc, 'El comensal escoge su modalidad de liquidación de pago:');
  drawBullet(doc, 'Pago en Efectivo:', 'Registra la solicitud y notifica al mozo asignado para acudir a la mesa con el cambio exacto.');
  drawBullet(doc, 'Pago Digital por Código QR PayPal:', 'La tablet convierte el monto en DOP a dólares estadounidenses (USD) a la tasa de cambio vigente y despliega un Código QR dinámico. El comensal escanea el código con su teléfono celular mediante la app de PayPal y aprueba el pago en segundos sin entregar su tarjeta.');

  drawH2(doc, '3.8', 'Visualización del Ticket Fiscal Oficial con Timbre QR de la DGII');
  drawParagraph(doc, 'Aprobada la transacción, la tablet despliega el comprobante fiscal formal con los datos del Restaurante Chivo al Campo SRL (RNC 132-90740-1), número de e-NCF (E31 o E32), fecha, hora, desglose neto, ITBIS y propina, acompañado del **Código QR Fiscal Oficial**, el cual puede ser escaneado con la cámara de cualquier teléfono para consultar el estatus del timbre electrónico en el portal de la DGII.');

  // 4.0 MÓDULO DE COCINA: MONITOR TÁCTIL KDS (PGM_COCINA)
  mark('4.0', 'Módulo de Cocina: Monitor Táctil KDS (PGM_COCINA)');
  drawH1(doc, '4.0', 'Módulo de Cocina: Monitor Táctil KDS (PGM_COCINA)');
  drawParagraph(doc, 'Ruta de acceso: /cocina.html. El Kitchen Display System (KDS) sustituye los tickets de papel en la cocina por una pantalla táctil industrial de alta visibilidad montada en el área de pase culinario.');

  drawH2(doc, '4.1', 'Pantalla de Alto Contraste y Reloj Sincronizado');
  drawBullet(doc, 'Diseño Antirreflejo:', 'Esquema visual optimizado para cocinas profesionales con presencia de vapores, calor y humo.');
  drawBullet(doc, 'Reloj en Vivo:', 'Sincronizado con la hora de República Dominicana para controlar con exactitud la rotación de los calderos.');
  drawBullet(doc, 'Cronómetro por Comanda:', 'Cada orden calcula en tiempo real los minutos transcurridos desde que ingresó (verde < 10 mins, ámbar 10-20 mins, rojo crítico > 20 mins).');

  drawH2(doc, '4.2', 'Alertas Sonoras Sintetizadas (Web Audio API)');
  drawParagraph(doc, 'Cada vez que una mesa de salón o una orden de delivery es confirmada, el monitor de cocina sintetiza un repique audible de dos tonos utilizando Web Audio API nativa. De esta forma, la brigada de cocineros se entera al instante sin necesidad de estar mirando fijamente el monitor.');

  drawH2(doc, '4.3', 'Ciclo de Estados Culinarios y Botón Directo "DESPACHAR"');
  drawParagraph(doc, 'Cada tarjeta de comanda en el KDS cuenta con dos controles táctiles ergonómicos:');
  drawBullet(doc, 'Botón de Estado Culinario:', 'Alterna entre "EN PREPARACIÓN" (ícono de fuego naranja) y "LISTO PARA SERVIR" (campana dorada). Cuando el chef pulsa "En Preparación", la tablet de la mesa actualiza su estado informando al comensal que sus carnes están cociéndose en el caldero.');
  drawBullet(doc, 'Botón Directo "DESPACHAR" (Verde Esmeralda):', 'Cuando los platos salen del pase hacia el salón o el repartidor, el despachador presiona "DESPACHAR" con un solo toque. La comanda se archiva de inmediato y se retira de pantalla, manteniendo el monitor despejado.');

  drawH2(doc, '4.4', 'Diferenciación de Comandas de Salón vs Delivery');
  drawParagraph(doc, 'Las órdenes solicitadas telefónicamente se identifican claramente con la cabecera destacada "DELIVERY (MESA 99)". Esto instruye a los empacadores a sellar los platos en envases térmicos, incluir cubiertos desechables y empacar las salsas por separado para los motoristas.');

  // 5.0 MÓDULO DE GERENCIA Y ADMINISTRACIÓN (PGM_ADMIN)
  mark('5.0', 'Módulo de Gerencia y Administración (PGM_ADMIN)');
  drawH1(doc, '5.0', 'Módulo de Gerencia y Administración (PGM_ADMIN)');
  drawParagraph(doc, 'Ruta de acceso: /admin.html. Constituye el centro de mando y supervisión para la gerencia general, contabilidad, auditoría tributaria, caja y control de inventarios.');

  drawH2(doc, '5.1', 'Autenticación Criptográfica SHA-256');
  drawParagraph(doc, 'El acceso está restringido mediante validación de credenciales con hash SHA-256 en la base de datos atómica. Se protegen las operaciones financieras contra accesos no autorizados.');

  drawH2(doc, '5.2', 'Dashboard de Indicadores Clave de Rendimiento (KPIs en Vivo)');
  drawParagraph(doc, 'En la primera pestaña se consolidan las métricas económicas en tiempo real:');
  drawBullet(doc, 'Ventas Totales Brutas:', 'Monto consolidado de facturación acumulada del día.');
  drawBullet(doc, 'ITBIS Recaudado (18%):', 'Total de impuestos retenidos listo para la conciliación del formulario IT-1 ante la DGII.');
  drawBullet(doc, 'Propina Legal (10%):', 'Fondo retenido bajo la Ley 18-88 para liquidación mensual equitativa entre los 4 camareros.');
  drawBullet(doc, 'Volumen de Facturas:', 'Cantidad de comprobantes fiscales emitidos en el turno.');
  drawBullet(doc, 'Ticket Promedio por Mesa:', 'Gasto medio consumido por comensales.');

  drawH2(doc, '5.3', 'Plano Interactivo de Mesas y Control de Salón en Vivo');
  drawParagraph(doc, 'Supervisa la distribución espacial de las mesas con semaforización en tiempo real:');
  drawBullet(doc, 'Verde (DISPONIBLE):', 'Mesa lista para recibir clientes. Incluye botón directo para lanzar el modo tablet.');
  drawBullet(doc, 'Ámbar (OCUPADA):', 'Mesa con consumo en curso. Muestra el total acumulado y lista de platos servidos.');
  drawBullet(doc, 'Rojo Parpadeante (LLAMANDO MESERO):', 'Solicitud de asistencia urgente en mesa. Botón directo "Atender Mesero".');
  drawBullet(doc, 'Liberación Individual:', 'Botón "Liberar" en cada mesa para depurar órdenes y dejarla disponible.');
  drawBullet(doc, 'Liberación General del Salón:', 'Botón superior rojo "Liberar Todas las Mesas" que limpia pedidos huérfanos y resetea todas las mesas a verde para iniciar un nuevo turno de operaciones sin reocupación.');

  drawH2(doc, '5.4', 'Caja y Gestión de Delivery Telefónico (Mesa Virtual 99)');
  drawParagraph(doc, 'Permite a la cajera registrar pedidos recibidos por llamada telefónica o WhatsApp:');
  drawBullet(doc, 'Formulario de Cliente:', 'Captura nombre, teléfono celular y dirección de entrega en Villa Elisa o comunidades aledañas.');
  drawBullet(doc, 'Selección de Menú:', 'Agrega los platos y bebidas solicitadas calculando el subtotal y el 18% de ITBIS.');
  drawBullet(doc, 'Exención Automática de Propina:', 'El sistema excluye automáticamente el 10% de propina legal de salón por tratarse de un despacho fuera de mesa.');
  drawBullet(doc, 'Despacho a KDS:', 'Al enviar la orden, se genera la comanda en cocina con el rótulo "DELIVERY (MESA 99)".');

  drawH2(doc, '5.5', 'Auditoría Fiscal e-NCF DGII y Anulación con Nota de Crédito E34');
  drawParagraph(doc, 'Módulo formal de control tributario homologado con la Ley 32-23:');
  drawBullet(doc, 'Historial Fiscal Completo:', 'Listado de las 25 facturas fiscales con número de e-NCF, fecha y hora, mesa, subtotal, ITBIS, propina y estatus de pago.');
  drawBullet(doc, 'Reimpresión de Comprobante Térmico:', 'Genera el ticket oficial con su código QR fiscal verificable en DGII.');
  drawBullet(doc, 'Procedimiento de Anulación Formal con Nota de Crédito Electrónica E34:', 'Asistente de 4 fases que solicita el motivo oficial DGII (devolución de plato, corrección de RNC o comanda errónea). El sistema emite la Nota de Crédito E34 enlazada a la factura origen, anula el comprobante y ejecuta el **reintegro automático de las materias primas al inventario de almacén** (libras de carne de chivo lechal, plátanos y raciones).');
  drawBullet(doc, 'Mantenimiento y Cierre de Ciclos Fiscales:', 'Botón protegido por PIN de seguridad (1234) para cerrar períodos de prueba o realizar cierres fiscales autorizados sin provocar saltos de secuencia.');

  drawH2(doc, '5.6', 'Centro Maestro de Consultas y Reportes (Catálogo Oficial de 36)');
  drawParagraph(doc, 'Accesible mediante la pestaña destacada "Consultas y Reportes". Reúne 36 reportes especializados clasificados en 6 categorías estratégicas con filtros por rango de fechas, buscador interactivo en vivo y opciones de exportación inmediata:');
  drawBullet(doc, 'Botón "Exportar CSV (Excel)":', 'Descarga instantánea de la consulta activa en formato compatible con Microsoft Excel y hojas de cálculo.');
  drawBullet(doc, 'Botón "Imprimir / Guardar en PDF":', 'Abre la vista de impresión con membrete formal de UTESA y datos tributarios de Chivo al Campo SRL.');

  const repHeaders = ['Código', 'Nombre del Reporte', 'Categoría', 'Propósito Operativo y Fiscal'];
  const repRows = [
    // Categoría 1
    ['REP-01', 'Ventas Generales por Período', 'Ventas', 'Consolidado cronológico de comprobantes emitidos e ingresos brutos'],
    ['REP-02', 'Ventas por Método de Pago', 'Ventas', 'Distribución porcentual: Efectivo vs Tarjetas POS vs PayPal QR'],
    ['REP-03', 'Facturación por Mesa y Salón', 'Ventas', 'Rendimiento y ventas acumuladas por cada mesa física del salón'],
    ['REP-04', 'Facturas Anuladas con Nota E34', 'Ventas', 'Auditoría fiscal de anulaciones y motivos DGII registrados'],
    ['REP-05', 'Ticket Promedio y Consumo', 'Ventas', 'Métricas de consumo medio, máximo y mínimo por mesa atendida'],
    ['REP-06', 'Ventas por Turno de Trabajo', 'Ventas', 'Comparativa financiera: Turno Matutino vs Turno Nocturno'],
    ['REP-31', 'Ventas Detalladas por Hora', 'Ventas', 'Curva horaria de facturación continua desde 11:00 AM a 11:00 PM'],

    // Categoría 2
    ['REP-07', 'Formato 607 DGII Oficial', 'Fiscal DGII', 'Estructura estándar de ventas mensuales requerida para declaración'],
    ['REP-08', 'Resumen de Comprobantes e-CF', 'Fiscal DGII', 'Conteo y totales desglosados de facturas E31, E32 y notas E34'],
    ['REP-09', 'Formato 608 DGII Anulaciones', 'Fiscal DGII', 'Relación jurada de comprobantes fiscales cancelados ante DGII'],
    ['REP-10', 'Auditoría de ITBIS Recaudado', 'Fiscal DGII', 'Base imponible y monto del 18% para formulario jurado IT-1'],
    ['REP-11', 'Liquidación Propina Legal (10%)', 'Fiscal DGII', 'Auditoría de ley para distribución equitativa de los camareros'],
    ['REP-32', 'Directorio de Clientes con RNC', 'Fiscal DGII', 'Padrón de empresas que solicitaron comprobantes de crédito fiscal E31'],

    // Categoría 3
    ['REP-12', 'Ranking de Platos Más Vendidos', 'Menú', 'Listado ordenado de mayor a menor demanda culinaria liniera'],
    ['REP-13', 'Ventas por Categoría de Menú', 'Menú', 'Volumen de ventas en Carnes, Guarniciones, Bebidas y Postres'],
    ['REP-14', 'Platos de Menor Rotación', 'Menú', 'Especialidades de baja salida para ajustes de promociones'],
    ['REP-15', 'Efectividad de Upselling IA', 'Menú', 'Tasa de conversión de sugerencias automáticas de Gemini en tablets'],
    ['REP-16', 'Rentabilidad y Margen por Plato', 'Menú', 'Costos de materias primas versus precio final de venta'],
    ['REP-33', 'Consumo de Guarniciones', 'Menú', 'Libras de tostones, moro con coco y víveres despachados'],

    // Categoría 4
    ['REP-17', 'Eficiencia y Tiempos de Cocina', 'Cocina KDS', 'Minutos promedio desde que el cliente ordena hasta despacho en pase'],
    ['REP-18', 'Horas Pico y Concentración', 'Cocina KDS', 'Franjas horarias de máxima afluencia para refuerzo de personal'],
    ['REP-19', 'Comandas: Despachadas vs Pend.', 'Cocina KDS', 'Auditoría de flujo de pedidos en el monitor táctil de cocina'],
    ['REP-20', 'Canal: Salón vs Delivery', 'Cocina KDS', 'Proporción de comensales sentados versus pedidos para llevar'],
    ['REP-34', 'Control de Calidad y Mermas', 'Cocina KDS', 'Registro de mermas de carne y platos devueltos a cocina'],

    // Categoría 5
    ['REP-21', 'Existencias y Valor de Almacén', 'Almacén', 'Stock actual en libras/unidades y valor económico en DOP'],
    ['REP-22', 'Insumos Críticos (Punto Reorden)', 'Almacén', 'Materias primas que requieren reposición inmediata'],
    ['REP-23', 'Kardex: Movimientos Históricos', 'Almacén', 'Entradas por compras y salidas automáticas por recetas'],
    ['REP-24', 'Reintegro por Anulaciones E34', 'Almacén', 'Libras de carne devueltas al stock tras anulación fiscal'],
    ['REP-25', 'Directorio de Suplidores Locales', 'Almacén', 'Registro de productores caprinos y agrícolas de Monte Cristi'],
    ['REP-35', 'Consumo Semanal de Carne Chivo', 'Almacén', 'Libras de chivo lechal procesadas diariamente en caldero'],

    // Categoría 6
    ['REP-26', 'Cuadre de Caja Diario (Reporte Z)', 'Caja/Finanzas', 'Arqueo oficial, balance en gaveta y cierre fiscal nocturno'],
    ['REP-27', 'Conciliación: Efectivo vs PayPal', 'Caja/Finanzas', 'Fondos físicos en caja versus transacciones digitales en nube'],
    ['REP-28', 'Productividad y Turnos Personal', 'Caja/Finanzas', 'Horarios asignados, asistencia y estatus activo en nómina'],
    ['REP-29', 'Auditoría de Secuencia e-NCF', 'Caja/Finanzas', 'Certificación matemática de 0% saltos en numeración DGII'],
    ['REP-30', 'Resumen Gerencial y Demanda IA', 'Caja/Finanzas', 'Diagnóstico general con recomendaciones de compra Gemini'],
    ['REP-36', 'Liquidación de Propinas por Mozo', 'Caja/Finanzas', 'Cálculo de reparto equitativo del 10% entre los 4 camareros']
  ];
  drawTable(doc, 'Tabla 2: Catálogo Maestro de los 36 Reportes del Sistema.', repHeaders, repRows, [45, 145, 75, 225]);

  drawH2(doc, '5.7', 'Almacén, Insumos y Kardex con Alertas de Punto de Reorden');
  drawParagraph(doc, 'El sistema cuenta con un módulo de inventario automatizado basado en recetas estándar. Cada vez que se factura un plato (ej: Servicio de Chivo al Caldero), el software descuenta automáticamente de las existencias las cantidades exactas: 1.2 lbs de carne de chivo lechal, 3 unidades de plátano verde liniero, orégano, ajo y especias.');
  drawBullet(doc, 'Semaforización de Insumos:', 'Verde (Stock normal), Ámbar (Alerta de reorden) y Rojo (Insumo crítico que requiere compra urgente).');

  drawH2(doc, '5.8', 'Directorio de Proveedores Locales de Monte Cristi');
  drawParagraph(doc, 'Mantiene el padrón de socios comerciales de la Línea Noroeste con información de contacto y productos provistos: Asociación de Criadores de Chivo de Monte Cristi (suministro fresco de carne lechal), Productores Agrícolas de Guayubín (plátanos verdes) y Cooperativa Apícola del Noroeste (miel y aderezos linieros).');

  drawH2(doc, '5.9', 'Gestión de Personal, Asistencia y Nómina');
  drawParagraph(doc, 'Permite administrar a los 10 colaboradores del restaurante (Chef Ejecutivo, 2 cocineros, 4 camareros, cajera principal y personal de limpieza), registrando su cargo, turno asignado (Turno Matutino: 8:00 AM a 4:00 PM o Turno Vespertino: 4:00 PM a 12:00 AM) y su estado activo en nómina.');

  drawH2(doc, '5.10', 'Diagnóstico Predictivo de Demanda con Google Gemini IA');
  drawParagraph(doc, 'Analiza la tendencia de facturación de los últimos 7 días y emite un informe predictivo en lenguaje natural, recomendando la cantidad exacta de libras de carne de chivo lechal a comprar a los ganaderos locales antes del fin de semana para garantizar stock sin incurrir en mermas por sobrecompra.');

  drawH2(doc, '5.11', 'Módulo SaaS y Licenciamiento Tecnológico');
  drawParagraph(doc, 'Monitorea el estado de la suscripción Cloud del restaurante con botón de renovación mediante la pasarela digital PayPal.');

  // 6.0 PROCEDIMIENTOS OPERATIVOS Y PREGUNTAS FRECUENTES
  mark('6.0', 'Procedimientos Operativos y Preguntas Frecuentes');
  drawH1(doc, '6.0', 'Procedimientos Operativos y Preguntas Frecuentes');

  drawH2(doc, '6.1', 'Apertura de Turno y Verificación de Salón');
  drawParagraph(doc, 'Al inicio de cada jornada laboral, la cajera principal debe ingresar a /admin.html con su clave, verificar que el saldo inicial de caja esté registrado y pulsar "Liberar Todas las Mesas" para asegurar que todas las tablets inicien en estado disponible y limpias de comandas previas.');

  drawH2(doc, '6.2', 'Cierre de Turno Nocturno y Generación del Reporte Z Fiscal');
  drawParagraph(doc, 'Al finalizar las operaciones nocturnas, la cajera accede al Centro de Reportes ➔ Reporte REP-26 (Cuadre de Caja Diario y Reporte Z). El sistema totaliza las ventas en efectivo, los pagos en PayPal, el ITBIS recaudado y el fondo de propina acumulado, permitiendo imprimir el arqueo formal de cierre para entrega al gerente.');

  drawH2(doc, '6.3', 'Recuperación ante Interrupción Momentánea de Red');
  drawParagraph(doc, 'Si por alguna fluctuación local de red Wi-Fi una tablet no refleja el cambio de estado de cocina, presione el botón "Actualizar Salón" en el plano de mesas para forzar una sincronización atómica inmediata vía WebSockets.');

  drawH2(doc, '6.4', 'Validación del Timbre Electrónico ante la DGII');
  drawParagraph(doc, 'Al emitir un ticket de Consumo (E32) o Crédito Fiscal (E31), el código QR impreso puede ser escaneado con cualquier dispositivo móvil. El enlace redirige a los servidores de facturación electrónica de la DGII, confirmando la validez del comprobante y el RNC 132-90740-1.');

  drawParagraph(doc, 'Manual de Operación formal elaborado para el Restaurante Chivo al Campo SRL.', { bold: true, align: 'center' });
  drawParagraph(doc, 'Jeremi Santos Fabian (1-19-7223) • Prof. Iván Mendoza • UTESA Recinto Santiago 2026', { align: 'center', color: THEME.muted });
}

/**
 * Genera el archivo MANUAL_DE_USUARIO.pdf exhaustivo con correspondencia exacta de páginas
 */
async function generateUsuarioAcademicPDF() {
  const pdfPath = path.join(OUT_DIR, 'MANUAL_DE_USUARIO.pdf');

  // Pasada 1: Simulación en memoria para registrar páginas exactas de cada sección
  const simDoc = createAcademicDoc('Simulación Usuario');
  drawAcademicCover(simDoc, {
    title: 'MANUAL DE OPERACIÓN Y USUARIO DEL SISTEMA',
    subtitle: 'GUÍA INTEGRAL DE PROCEDIMIENTOS PARA TABLETS EN MESA, COCINA KDS, CAJA, DGII Y 36 REPORTES'
  });
  simDoc.addPage(); // Reserva Página 2 (TOC)
  simDoc.addPage(); // Reserva Página 3 (Inicio contenido)

  const tracker = [];
  buildUsuarioContent(simDoc, tracker);
  simDoc.end();

  // Pasada 2: Renderizado final en disco con TOC exacta
  return new Promise((resolve, reject) => {
    const doc = createAcademicDoc('Manual de Usuario y Operación');
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Página 1: Portada
    drawAcademicCover(doc, {
      title: 'MANUAL DE OPERACIÓN Y USUARIO DEL SISTEMA',
      subtitle: 'GUÍA INTEGRAL DE PROCEDIMIENTOS PARA TABLETS EN MESA, COCINA KDS, CAJA, DGII Y 36 REPORTES'
    });

    // Página 2: Índice General
    doc.addPage();
    drawAcademicTOC(doc, tracker);

    // Página 3 en adelante: Contenido real
    doc.addPage();
    buildUsuarioContent(doc, null);

    // Finalizar con encabezados y pies de página
    finalizeDocument(doc, 'Manual de Usuario y Operación');

    const total = doc.bufferedPageRange().count;
    doc.end();

    stream.on('finish', () => {
      console.log(`[OK] MANUAL_DE_USUARIO.pdf exhaustivo generado exitosamente con ${total} páginas totales.`);
      resolve({ path: pdfPath, totalPages: total });
    });

    stream.on('error', err => reject(err));
  });
}

module.exports = { generateUsuarioAcademicPDF, buildUsuarioContent };

if (require.main === module) {
  generateUsuarioAcademicPDF();
}
