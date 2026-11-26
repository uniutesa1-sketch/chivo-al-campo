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

  // 1.0 DESCRIPCIÓN DEL ECOSISTEMA Y ROLES DE ACCESO
  mark('1.0', 'Descripción del Ecosistema y Roles de Acceso');
  drawH1(doc, '1.0', 'Descripción del Ecosistema y Roles de Acceso');
  drawParagraph(doc, 'El sistema de "Chivo al Campo SRL" es una plataforma integral de gestión para restaurantes gastronómicos, concebida para unificar la interacción del cliente en mesa, el flujo operativo de cocina y la administración gerencial bajo la normativa tributaria de la Dirección General de Impuestos Internos (DGII), según la Ley 32-23 de Facturación Electrónica.');
  drawParagraph(doc, 'La plataforma opera bajo un modelo multi-perfil donde cada estación de trabajo cuenta con una interfaz especializada:');

  const roleHeaders = ['Perfil de Usuario', 'Credencial', 'Área de Operación', 'Privilegios y Responsabilidades'];
  const roleRows = [
    ['Comensal (Cliente)', 'Acceso libre táctil', 'Salón / Mesas 01 a 05', 'Autoservicio, selección de menú, upselling IA, llamada y PayPal'],
    ['Chef / Cocineros', 'chef / admin123', 'Estación de Cocina KDS', 'Monitoreo de comandas, tiempos de cocción y despacho rápido'],
    ['Cajera Principal', 'caja / admin123', 'Caja y Mostrador', 'Facturación e-CF, pedidos de delivery (Mesa 99) y cuadre de caja'],
    ['Gerente General', 'admin / admin123', 'Gerencia Administrativa', 'Acceso integral: Dashboard KPIs, 36 Reportes, NCF y almacén']
  ];
  drawTable(doc, 'Tabla 1: Matriz de Roles y Perfiles de Acceso al Sistema.', roleHeaders, roleRows, [95, 80, 110, 205]);

  // 2.0 PORTAL CENTRAL DE ACCESO (PGM_MAIN)
  mark('2.0', 'Portal Central de Acceso (PGM_MAIN)');
  drawH1(doc, '2.0', 'Portal Central de Acceso (PGM_MAIN)');
  drawParagraph(doc, 'El portal central (http://localhost:8080/ o http://localhost:3000/) funciona como enrutador principal para los dispositivos del restaurante. Presenta una interfaz de alto contraste en negro carbón y naranja liniero con el logotipo oficial centrado.');
  drawParagraph(doc, 'Desde este portal, el personal puede ingresar a cualquiera de los tres módulos operativos:');
  drawBullet(doc, 'Módulo de Autoservicio Comensal (PGM_CLIENTE):', 'Selector de mesa (Mesa 01 a 05) que lanza la interfaz táctil del comensal.');
  drawBullet(doc, 'Módulo de Cocina KDS (PGM_COCINA):', 'Lanza la pantalla táctil de preparación para el área de calderos y fogones.');
  drawBullet(doc, 'Módulo de Gerencia y Administración (PGM_ADMIN):', 'Acceso protegido por credenciales SHA-256 para supervisión financiera y fiscal.');

  // 3.0 MÓDULO DE AUTOSERVICIO EN MESA (PGM_CLIENTE)
  mark('3.0', 'Módulo de Autoservicio en Mesa (PGM_CLIENTE)');
  drawH1(doc, '3.0', 'Módulo de Autoservicio en Mesa (PGM_CLIENTE)');
  drawParagraph(doc, 'Ruta de acceso: /tablet.html?mesa=X. Diseñado para pantallas táctiles instaladas en las mesas del salón.');

  drawH2(doc, '3.1', 'Catálogo Gastronómico Liniero y Fotografías Reales');
  drawParagraph(doc, 'El menú digital presenta los platos organizados en 4 pestañas interactivas con fotografías de alta resolución tomadas directamente de la cocina del restaurante:');

  const dishes = [
    {
      name: 'Chivo Liniero al Caldero',
      price: 'RD$ 450.00',
      desc: 'Carne tierna cocida con orégano silvestre y especias linieras.',
      imgPath: path.join(IMAGES_DIR, 'chivo_liniero.jpg')
    },
    {
      name: 'Chivo Asado Especial',
      price: 'RD$ 480.00',
      desc: 'Corte caprino dorado al horno con sazón campestre.',
      imgPath: path.join(IMAGES_DIR, 'chivo_asado.jpg')
    },
    {
      name: 'Tostones Crujientes Criollos',
      price: 'RD$ 120.00',
      desc: 'Plátano verde liniero frito al instante con sal marina.',
      imgPath: path.join(IMAGES_DIR, 'tostones.jpg')
    },
    {
      name: 'Moro de Guandules con Coco',
      price: 'RD$ 150.00',
      desc: 'Arroz tradicional con guandules frescos y leche de coco.',
      imgPath: path.join(IMAGES_DIR, 'moro_guandules.jpg')
    }
  ];
  drawDishGallery(doc, dishes, 'Figura 1: Muestra de Especialidades Linieras disponibles en el Catálogo Digital de la Tablet.');

  drawH2(doc, '3.2', 'Motor de Sugerencias Inteligentes con IA (Upselling)');
  drawParagraph(doc, 'Al seleccionar un plato fuerte (por ejemplo, Chivo al Caldero), el motor asistido por Google Gemini Flash analiza la orden y sugiere de forma contextual un acompañamiento o bebida típica para enriquecer la experiencia culinaria. El comensal puede añadir la sugerencia con un solo toque.');

  drawH2(doc, '3.3', 'Llamada de Mesero en Tiempo Real');
  drawParagraph(doc, 'La tablet dispone del botón "Llamar al Mesero". Al presionarlo, la orden genera un timbre sonoro y tiñe la mesa en color rojo parpadeante en el plano de salón del panel administrativo, indicando al mozo que acuda a la mesa.');

  drawH2(doc, '3.4', 'Facturación Fiscal y Pasarela Digital');
  drawParagraph(doc, 'Al pulsar "Pedir Cuenta", el comensal puede elegir entre dos tipos de comprobantes fiscales:');
  drawBullet(doc, 'Comprobante de Consumo (e-CF E32):', 'Generación directa para clientes particulares sin necesidad de RNC.');
  drawBullet(doc, 'Crédito Fiscal (e-CF E31):', 'Despliega un teclado numérico táctil para ingresar el RNC o Cédula de la empresa compradora, validando su dígito verificador y razón social ante la base de datos de DGII.');
  drawParagraph(doc, 'El pago puede liquidarse en efectivo con el mesero o mediante la pasarela PayPal escaneando el Código QR dinámico generado en pantalla con conversión automática a dólares.');

  // 4.0 MÓDULO DE COCINA: MONITOR TÁCTIL KDS (PGM_COCINA)
  mark('4.0', 'Módulo de Cocina: Monitor Táctil KDS (PGM_COCINA)');
  drawH1(doc, '4.0', 'Módulo de Cocina: Monitor Táctil KDS (PGM_COCINA)');
  drawParagraph(doc, 'Ruta de acceso: /cocina.html. El Kitchen Display System (KDS) reemplaza los tickets de papel en la cocina por un monitor industrial resistente al calor.');

  drawH2(doc, '4.1', 'Alertas Sonoras y Reloj en Tiempo Real');
  drawParagraph(doc, 'El monitor KDS sincroniza con WebSockets: en cuanto entra un pedido desde una tablet o por teléfono, el sistema sintetiza mediante Web Audio API un timbre acústico de dos tonos que alerta a la brigada de cocineros.');

  drawH2(doc, '4.2', 'Ciclo de Cocción y Despacho Rápido');
  drawParagraph(doc, 'Cada tarjeta de comanda presenta cronómetro de minutos transcurridos y dos controles ergonómicos:');
  drawBullet(doc, 'Botón de Estado Culinario:', 'Alterna entre "EN PREPARACIÓN" (fuego naranja) y "LISTO PARA SERVIR" (campana dorada), informando en vivo a la tablet de la mesa.');
  drawBullet(doc, 'Botón Directo DESPACHAR (Verde Esmeralda):', 'Permite con un toque retirar la comanda del display cuando los platos salen de la línea de pase, manteniendo el monitor limpio.');

  drawH2(doc, '4.3', 'Diferenciación de Salón vs Delivery');
  drawParagraph(doc, 'Las órdenes solicitadas telefónicamente se rotulan como "DELIVERY (MESA 99)", señalando a los despachadores que deben utilizar envases térmicos desechables y cubiertos sellados.');

  // 5.0 MÓDULO DE GERENCIA Y ADMINISTRACIÓN (PGM_ADMIN)
  mark('5.0', 'Módulo de Gerencia y Administración (PGM_ADMIN)');
  drawH1(doc, '5.0', 'Módulo de Gerencia y Administración (PGM_ADMIN)');
  drawParagraph(doc, 'Ruta de acceso: /admin.html. Centro de mando gerencial con 12 módulos funcionales para la supervisión integral de ingresos, salón, auditoría fiscal, almacén y finanzas.');

  drawH2(doc, '5.1', 'Dashboard de Indicadores Clave (KPIs)');
  drawParagraph(doc, 'Presenta métricas en vivo: Ventas Totales del día, ITBIS Recaudado (18%), Fondo de Propina Legal acumulado (10%), Volumen de facturas emitidas y Ticket Promedio consumido.');

  drawH2(doc, '5.2', 'Plano de Mesas y Control de Disponibilidad');
  drawParagraph(doc, 'Muestra el estado físico de las mesas mediante código de colores semafórico: Verde (Disponible), Ámbar (Ocupada con consumo en curso) y Rojo (Llamando mesero). Incluye el botón superior "Liberar Todas las Mesas" para resetear el salón al inicio de cada jornada.');

  drawH2(doc, '5.3', 'Auditoría Fiscal e-NCF y Notas de Crédito E34');
  drawParagraph(doc, 'Listado oficial de comprobantes emitidos. Permite reimprimir el ticket térmico con su código QR fiscal o anular formalmente una factura emitiendo una Nota de Crédito Electrónica E34 con reintegro automático de las libras de carne e ingredientes al almacén.');

  drawH2(doc, '5.4', 'Centro Maestro de Consultas y Reportes (Catálogo de 36)');
  drawParagraph(doc, 'El sistema cuenta con un centro unificado que agrupa 36 reportes especializados clasificados en 6 categorías estratégicas con filtros por rango de fechas, búsqueda instantánea y botones para exportar a Excel (CSV) o imprimir en formato formal:');

  const repHeaders = ['Código', 'Nombre del Reporte', 'Categoría', 'Propósito Operativo y Fiscal'];
  const repRows = [
    // Categoría 1
    ['REP-01', 'Ventas Generales por Período', 'Ventas', 'Consolidado cronológico de comprobantes emitidos e ingresos brutos'],
    ['REP-02', 'Ventas por Método de Pago', 'Ventas', 'Distribución: Efectivo en caja vs Tarjeta POS vs PayPal QR'],
    ['REP-03', 'Facturación por Mesa y Salón', 'Ventas', 'Rendimiento y ventas acumuladas por cada mesa física'],
    ['REP-04', 'Facturas Anuladas con Nota E34', 'Ventas', 'Auditoría fiscal de anulaciones y motivos DGII registrados'],
    ['REP-05', 'Ticket Promedio y Consumo', 'Ventas', 'Consumo medio, máximo y mínimo por mesa atendida'],
    ['REP-06', 'Ventas por Turno de Trabajo', 'Ventas', 'Comparativa financiera: Turno Matutino vs Turno Nocturno'],
    ['REP-31', 'Ventas Detalladas por Hora', 'Ventas', 'Curva horaria de consumo de 11:00 AM a 11:00 PM'],

    // Categoría 2
    ['REP-07', 'Formato 607 DGII Oficial', 'Fiscal DGII', 'Estructura estándar de ventas mensuales requerida por DGII'],
    ['REP-08', 'Resumen de Comprobantes e-CF', 'Fiscal DGII', 'Conteo y totales desglosados de E31, E32 y notas E34'],
    ['REP-09', 'Formato 608 DGII Anulaciones', 'Fiscal DGII', 'Relación jurada de comprobantes fiscales cancelados'],
    ['REP-10', 'Auditoría de ITBIS Recaudado', 'Fiscal DGII', 'Base imponible y monto del 18% para formulario IT-1'],
    ['REP-11', 'Liquidación Propina Legal (10%)', 'Fiscal DGII', 'Auditoría de ley para distribución equitativa de mozos'],
    ['REP-32', 'Directorio de Clientes con RNC', 'Fiscal DGII', 'Padrón de empresas que solicitaron comprobantes E31'],

    // Categoría 3
    ['REP-12', 'Ranking de Platos Más Vendidos', 'Menú', 'Top de mayor a menor demanda culinaria liniera'],
    ['REP-13', 'Ventas por Categoría de Menú', 'Menú', 'Volumen de ventas en Carnes, Guarniciones, Bebidas y Postres'],
    ['REP-14', 'Platos de Menor Rotación', 'Menú', 'Especialidades de baja salida para ajustes de menú'],
    ['REP-15', 'Efectividad de Upselling IA', 'Menú', 'Tasa de conversión de sugerencias automáticas en tablets'],
    ['REP-16', 'Rentabilidad y Margen por Plato', 'Menú', 'Costos de materias primas versus precio final de venta'],
    ['REP-33', 'Consumo de Guarniciones', 'Menú', 'Libras de tostones, moro y víveres despachados'],

    // Categoría 4
    ['REP-17', 'Eficiencia y Tiempos de Cocina', 'Cocina KDS', 'Minutos promedio desde que el cliente ordena hasta despacho'],
    ['REP-18', 'Horas Pico y Concentración', 'Cocina KDS', 'Franjas horarias de máxima afluencia para refuerzo de brigada'],
    ['REP-19', 'Comandas: Despachadas vs Pend.', 'Cocina KDS', 'Auditoría de flujo de pedidos en el monitor táctil'],
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
  drawTable(doc, 'Tabla 4: Catálogo Maestro de los 36 Reportes del Sistema.', repHeaders, repRows, [45, 145, 75, 225]);

  // 6.0 PROCEDIMIENTOS OPERATIVOS Y PREGUNTAS FRECUENTES
  mark('6.0', 'Procedimientos Operativos y Preguntas Frecuentes');
  drawH1(doc, '6.0', 'Procedimientos Operativos y Preguntas Frecuentes');

  drawH2(doc, '6.1', 'Apertura de Turno y Verificación de Salón');
  drawParagraph(doc, 'Al inicio de cada jornada laboral, la cajera principal debe ingresar a /admin.html, verificar que el saldo inicial de caja esté registrado y pulsar "Liberar Todas las Mesas" para asegurar que todas las tablets inicien en estado disponible.');

  drawH2(doc, '6.2', 'Recuperación ante Interrupción Momentánea de Red');
  drawParagraph(doc, 'Si por alguna fluctuación local de red Wi-Fi una tablet no refleja el cambio de estado de cocina, presione el botón "Actualizar Salón" en el plano de mesas para forzar una sincronización atómica inmediata vía WebSockets.');

  drawH2(doc, '6.3', 'Validación del Timbre Electrónico ante la DGII');
  drawParagraph(doc, 'Al emitir un ticket de Consumo (E32) o Crédito Fiscal (E31), el código QR impreso puede ser escaneado con cualquier dispositivo móvil. El enlace redirige a los servidores de facturación electrónica de la DGII, confirmando la validez del comprobante y el RNC 132-90740-1.');

  drawParagraph(doc, 'Manual de Operación formal elaborado para el Restaurante Chivo al Campo SRL.', { bold: true, align: 'center' });
  drawParagraph(doc, 'Jeremi Santos Fabian (1-19-7223) • Prof. Iván Mendoza • UTESA Recinto Santiago 2026', { align: 'center', color: THEME.muted });
}

/**
 * Genera el archivo MANUAL_DE_USUARIO.pdf con correspondencia 1:1 de páginas
 */
async function generateUsuarioAcademicPDF() {
  const pdfPath = path.join(OUT_DIR, 'MANUAL_DE_USUARIO.pdf');

  // Pasada 1: Simulación en memoria para registrar páginas exactas
  const simDoc = createAcademicDoc('Simulación Usuario');
  drawAcademicCover(simDoc, {
    title: 'MANUAL DE OPERACIÓN Y USUARIO DEL SISTEMA',
    subtitle: 'GUÍA INTEGRAL DE PROCEDIMIENTOS PARA TABLETS, COCINA KDS, AUDITORÍA DGII Y 36 REPORTES'
  });
  simDoc.addPage(); // Reserva Página 2 (TOC)
  simDoc.addPage(); // Reserva Página 3 (Inicio contenido)

  const tracker = [];
  buildUsuarioContent(simDoc, tracker);
  simDoc.end();

  // Pasada 2: Renderizado final en disco
  return new Promise((resolve, reject) => {
    const doc = createAcademicDoc('Manual de Usuario y Operación');
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Página 1: Portada
    drawAcademicCover(doc, {
      title: 'MANUAL DE OPERACIÓN Y USUARIO DEL SISTEMA',
      subtitle: 'GUÍA INTEGRAL DE PROCEDIMIENTOS PARA TABLETS, COCINA KDS, AUDITORÍA DGII Y 36 REPORTES'
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
      console.log(`[OK] MANUAL_DE_USUARIO.pdf generado exitosamente con ${total} páginas totales.`);
      resolve({ path: pdfPath, totalPages: total });
    });

    stream.on('error', err => reject(err));
  });
}

module.exports = { generateUsuarioAcademicPDF, buildUsuarioContent };

if (require.main === module) {
  generateUsuarioAcademicPDF();
}
