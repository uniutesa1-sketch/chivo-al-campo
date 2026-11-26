const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'assets', 'images');
const LOGO_PATH = path.join(IMAGES_DIR, 'logo.jpg');
const OUT_DIR = path.join(__dirname, '..', 'docs');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Paleta de Colores Académica UTESA (Azul Marino Institucional, Grafito y Acento Ámbar/Oro)
const THEME = {
  navy: '#0f2b48',         // Azul marino institucional UTESA
  navyLight: '#1e3a5f',    // Azul intermedio
  gold: '#b45309',         // Ámbar / Dorado sobrio
  dark: '#1e293b',         // Texto oscuro principal (grafito)
  body: '#334155',         // Texto de párrafo
  muted: '#64748b',        // Texto secundario / leyendas
  border: '#cbd5e1',       // Bordes de tablas y cuadros
  tableHeader: '#0f2b48',  // Fondo de cabecera de tablas
  tableRowEven: '#ffffff', // Fila blanca
  tableRowOdd: '#f8fafc',  // Fila gris tenue
  codeBg: '#f1f5f9',       // Fondo de bloques técnicos
  alertBg: '#f0fdf4',      // Alerta suave
  alertBorder: '#16a34a',
  pageWidth: 612,
  pageHeight: 792,
  marginLeft: 56,
  marginRight: 56,
  contentWidth: 500,       // Ancho exacto de contenido (612 - 56*2 = 500)
};

/**
 * Crea una nueva instancia de PDFKit configurada
 */
function createAcademicDoc(docTitle) {
  return new PDFDocument({
    size: 'LETTER',
    margins: { top: 48, bottom: 48, left: THEME.marginLeft, right: THEME.marginRight },
    bufferPages: true,
    info: {
      Title: docTitle,
      Author: 'Jeremi Santos Fabian (1-19-7223)',
      Subject: 'Proyecto Integrador - UTESA',
      Keywords: 'UTESA, Proyecto Integrador, Chivo al Campo, Cloud Run, DGII',
    }
  });
}

/**
 * Dibuja la Portada Institucional Universitaria (Página 1 estricta, sin desborde a Página 2)
 */
function drawAcademicCover(doc, meta) {
  const { pageWidth, pageHeight, marginLeft, contentWidth } = THEME;
  const centerX = pageWidth / 2;

  // Desactivar temporalmente el bottom margin para evitar auto-pagebreak accidental
  const oldBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  // Borde perimetral sobrio (doble línea académica)
  doc.rect(36, 36, pageWidth - 72, pageHeight - 72)
     .lineWidth(1.2)
     .strokeColor(THEME.navy)
     .stroke();

  doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
     .lineWidth(0.5)
     .strokeColor(THEME.navyLight)
     .stroke();

  let y = 56;

  // 1. Membrete Institucional UTESA
  doc.font('Helvetica-Bold').fontSize(13.5).fillColor(THEME.navy)
     .text('UNIVERSIDAD TECNOLÓGICA DE SANTIAGO (UTESA)', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 18;

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(THEME.muted)
     .text('RECINTO SANTIAGO • SEDE CENTRAL', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 14;

  doc.font('Helvetica').fontSize(9.5).fillColor(THEME.body)
     .text('FACULTAD DE INGENIERÍA Y ARQUITECTURA', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 13;

  doc.font('Helvetica-Bold').fontSize(10).fillColor(THEME.navyLight)
     .text('CARRERA DE INGENIERÍA EN SISTEMAS COMPUTACIONALES', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 15;

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(THEME.gold)
     .text('ASIGNATURA: PROYECTO INTEGRADOR', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 18;

  // Línea divisora
  doc.moveTo(100, y).lineTo(pageWidth - 100, y).lineWidth(1).strokeColor(THEME.gold).stroke();
  y += 18;

  // 2. Logotipo Oficial del Restaurante
  if (fs.existsSync(LOGO_PATH)) {
    try {
      const logoW = 82;
      doc.image(LOGO_PATH, centerX - (logoW / 2), y, { width: logoW });
      y += 90;
    } catch (e) {
      y += 8;
    }
  } else {
    y += 8;
  }

  // 3. Título del Proyecto y Documento
  doc.font('Helvetica-Bold').fontSize(15.5).fillColor(THEME.navy)
     .text(meta.title, marginLeft, y, { width: contentWidth, align: 'center' });
  y += doc.heightOfString(meta.title, { width: contentWidth, fontSize: 15.5 }) + 6;

  if (meta.subtitle) {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(THEME.gold)
       .text(meta.subtitle, marginLeft, y, { width: contentWidth, align: 'center' });
    y += doc.heightOfString(meta.subtitle, { width: contentWidth, fontSize: 9.5 }) + 7;
  }

  doc.font('Helvetica').fontSize(8.8).fillColor(THEME.body)
     .text('Sistema Multi-Modo de Autoservicio, Monitor KDS y Facturación Fiscal DGII (Ley 32-23)', marginLeft, y, { width: contentWidth, align: 'center' });
  y += 20;

  // 4. Bloque de Datos Académicos (Cuadro formal)
  const boxX = marginLeft + 15;
  const boxW = contentWidth - 30;
  const boxH = 136;

  doc.roundedRect(boxX, y, boxW, boxH, 4)
     .fillAndStroke('#f8fafc', THEME.border);

  // Franja lateral
  doc.roundedRect(boxX, y, 4, boxH, 2).fill(THEME.navy);

  let mY = y + 12;
  const rows = [
    ['Empresa Usuaria:', 'Restaurante "Chivo al Campo SRL" (Villa Elisa, Monte Cristi)'],
    ['RNC Contribuyente:', '132-90740-1 (Certificación e-CF DGII Ley 32-23)'],
    ['Docente Evaluador:', 'Prof. Iván Mendoza'],
    ['Sustentante / Autor:', 'Jeremi Santos Fabian'],
    ['Matrícula:', '1-19-7223'],
    ['Versión de Software:', 'Versión 2.4.0 (Cloud Native / Docker / Serverless)'],
    ['Fecha de Entrega:', 'Noviembre 2026']
  ];

  rows.forEach(([lbl, val]) => {
    doc.font('Helvetica-Bold').fontSize(8.8).fillColor(THEME.navy)
       .text(lbl, boxX + 16, mY, { width: 140, lineBreak: false });
    doc.font('Helvetica').fontSize(8.8).fillColor(THEME.dark)
       .text(val, boxX + 160, mY, { width: boxW - 175, lineBreak: false });
    mY += 16.5;
  });

  // Pie de portada fijo al fondo de la página 1
  const footY = pageHeight - 68;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(THEME.navy)
     .text('Santiago de los Caballeros, República Dominicana', marginLeft, footY, { width: contentWidth, align: 'center', lineBreak: false });
  doc.font('Helvetica').fontSize(8.5).fillColor(THEME.muted)
     .text('Período Académico 3-2026', marginLeft, footY + 12, { width: contentWidth, align: 'center', lineBreak: false });

  // Restaurar margen inferior
  doc.page.margins.bottom = oldBottom;
}

/**
 * Aplica encabezados y pies de página en las páginas de contenido sin generar páginas en blanco
 */
function finalizeDocument(doc, docShortTitle) {
  const range = doc.bufferedPageRange();
  const total = range.count;

  // Iterar desde la página 2 (índice 1) hasta la última
  for (let i = 1; i < total; i++) {
    doc.switchToPage(i);

    const oldB = doc.page.margins.bottom;
    const oldT = doc.page.margins.top;
    doc.page.margins.bottom = 0;
    doc.page.margins.top = 0;

    // Encabezado institucional
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(THEME.navy)
       .text('UTESA • PROYECTO INTEGRADOR • PROF. IVÁN MENDOZA', THEME.marginLeft, 24, { lineBreak: false });

    doc.font('Helvetica').fontSize(7.5).fillColor(THEME.gold)
       .text(docShortTitle.toUpperCase(), THEME.marginLeft, 24, { width: THEME.contentWidth, align: 'right', lineBreak: false });

    doc.moveTo(THEME.marginLeft, 35)
       .lineTo(THEME.pageWidth - THEME.marginRight, 35)
       .lineWidth(0.5)
       .strokeColor(THEME.border)
       .stroke();

    // Pie de página
    const footY = THEME.pageHeight - 28;
    doc.moveTo(THEME.marginLeft, footY - 6)
       .lineTo(THEME.pageWidth - THEME.marginRight, footY - 6)
       .lineWidth(0.5)
       .strokeColor(THEME.border)
       .stroke();

    doc.font('Helvetica').fontSize(7.5).fillColor(THEME.muted)
       .text('Restaurante Chivo al Campo SRL • Jeremi Santos Fabian (1-19-7223)', THEME.marginLeft, footY, { lineBreak: false });

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(THEME.navy)
       .text(`Página ${i + 1} de ${total}`, THEME.marginLeft, footY, { width: THEME.contentWidth, align: 'right', lineBreak: false });

    doc.page.margins.bottom = oldB;
    doc.page.margins.top = oldT;
  }
}

/**
 * Título de Sección de Nivel 1 (1.0, 2.0...)
 */
function drawH1(doc, num, title) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.6);

  const startY = doc.y;
  const textFull = `${num} ${title.toUpperCase()}`;

  // Banda de título sobria
  doc.rect(THEME.marginLeft, startY, THEME.contentWidth, 20)
     .fill('#f1f5f9');

  // Acento lateral izquierdo azul marino
  doc.rect(THEME.marginLeft, startY, 4, 20)
     .fill(THEME.navy);

  doc.font('Helvetica-Bold').fontSize(10.2).fillColor(THEME.navy)
     .text(textFull, THEME.marginLeft + 12, startY + 4.5, { width: THEME.contentWidth - 20, lineBreak: false });

  doc.y = startY + 26;
}

/**
 * Subtítulo de Sección de Nivel 2 (1.1, 1.2...)
 */
function drawH2(doc, num, title) {
  if (doc.y > 700) doc.addPage();
  doc.moveDown(0.4);

  const textFull = `${num} ${title}`;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(THEME.navyLight)
     .text(textFull, THEME.marginLeft, doc.y, { width: THEME.contentWidth });
  doc.moveDown(0.25);
}

/**
 * Párrafo de texto académico
 */
function drawParagraph(doc, text, options = {}) {
  if (doc.y > 720) doc.addPage();
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(options.fontSize || 8.8)
     .fillColor(options.color || THEME.body)
     .text(text, THEME.marginLeft, doc.y, {
       width: THEME.contentWidth,
       align: 'justify',
       lineGap: 2.2,
       ...options
     });
  doc.moveDown(0.3);
}

/**
 * Viñeta formal
 */
function drawBullet(doc, boldPrefix, text) {
  if (doc.y > 720) doc.addPage();
  const y = doc.y;

  doc.circle(THEME.marginLeft + 6, y + 4.5, 2).fill(THEME.navy);

  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(THEME.dark)
     .text(boldPrefix + ' ', THEME.marginLeft + 16, y, { continued: true });
  doc.font('Helvetica').fontSize(8.5).fillColor(THEME.body)
     .text(text, { width: THEME.contentWidth - 20, lineGap: 1.5 });
  doc.moveDown(0.25);
}

/**
 * Bloque de código / comandos compacto
 */
function drawCodeBlock(doc, codeText) {
  if (doc.y > 670) doc.addPage();
  doc.moveDown(0.2);

  const lines = codeText.trim().split('\n');
  const lineHeight = 10.5;
  const boxHeight = lines.length * lineHeight + 12;

  if (doc.y + boxHeight > 730) doc.addPage();

  const startY = doc.y;
  doc.roundedRect(THEME.marginLeft, startY, THEME.contentWidth, boxHeight, 3)
     .fillAndStroke(THEME.codeBg, THEME.border);

  let textY = startY + 7;
  lines.forEach(line => {
    doc.font('Courier').fontSize(7.2).fillColor(THEME.dark)
       .text(line, THEME.marginLeft + 10, textY, { width: THEME.contentWidth - 20, lineBreak: false });
    textY += lineHeight;
  });

  doc.y = startY + boxHeight + 6;
}

/**
 * Tabla formal académica de informe técnico
 * Ancho total fijo: 490pt a 500pt (centrada en margen izquierdo 56)
 */
function drawTable(doc, tableTitle, headers, rows, colWidths) {
  if (doc.y > 660) doc.addPage();
  doc.moveDown(0.3);

  if (tableTitle) {
    doc.font('Helvetica-Bold').fontSize(8.2).fillColor(THEME.navy)
       .text(tableTitle, THEME.marginLeft, doc.y);
    doc.moveDown(0.2);
  }

  const tableX = THEME.marginLeft;
  let currentY = doc.y;
  const headerHeight = 18;
  const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);

  // Cabecera
  doc.rect(tableX, currentY, totalTableWidth, headerHeight).fill(THEME.tableHeader);

  let colX = tableX;
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
       .text(h, colX + 4, currentY + 5, { width: colWidths[i] - 8, align: 'left' });
    colX += colWidths[i];
  });

  currentY += headerHeight;

  // Filas
  rows.forEach((row, rowIndex) => {
    let maxCellHeight = 14;
    row.forEach((cell, i) => {
      const h = doc.heightOfString(cell, { width: colWidths[i] - 8, fontSize: 7.4 });
      if (h + 6 > maxCellHeight) maxCellHeight = h + 6;
    });

    if (currentY + maxCellHeight > 730) {
      doc.addPage();
      currentY = 48;

      doc.rect(tableX, currentY, totalTableWidth, headerHeight).fill(THEME.tableHeader);
      let repeatColX = tableX;
      headers.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
           .text(h + (i === 0 ? ' (Cont.)' : ''), repeatColX + 4, currentY + 5, { width: colWidths[i] - 8 });
        repeatColX += colWidths[i];
      });
      currentY += headerHeight;
    }

    const rowBg = rowIndex % 2 === 0 ? THEME.tableRowEven : THEME.tableRowOdd;
    doc.rect(tableX, currentY, totalTableWidth, maxCellHeight).fill(rowBg);
    doc.rect(tableX, currentY, totalTableWidth, maxCellHeight).lineWidth(0.5).strokeColor(THEME.border).stroke();

    let cellX = tableX;
    row.forEach((cell, i) => {
      const isBold = (i === 0 && row.length > 2);
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.4).fillColor(THEME.dark)
         .text(cell, cellX + 4, currentY + 3.5, { width: colWidths[i] - 8 });
      cellX += colWidths[i];
    });

    currentY += maxCellHeight;
  });

  doc.y = currentY + 6;
}

/**
 * Dibuja un cuadro explicativo formal (Callout técnico)
 */
function drawCallout(doc, type, title, text) {
  if (doc.y > 690) doc.addPage();
  doc.moveDown(0.3);

  const boxW = THEME.contentWidth;
  const startY = doc.y;
  const textH = doc.heightOfString(text, { width: boxW - 24, fontSize: 8.2 });
  const boxH = textH + (title ? 24 : 14);

  doc.roundedRect(THEME.marginLeft, startY, boxW, boxH, 3)
     .fillAndStroke('#f8fafc', THEME.border);

  const barColor = type === 'warning' ? THEME.gold : THEME.navy;
  doc.roundedRect(THEME.marginLeft, startY, 3.5, boxH, 1.5).fill(barColor);

  let curY = startY + 6;
  if (title) {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(barColor)
       .text(title.toUpperCase(), THEME.marginLeft + 12, curY);
    curY += 12;
  }

  doc.font('Helvetica').fontSize(8.2).fillColor(THEME.body)
     .text(text, THEME.marginLeft + 12, curY, { width: boxW - 24, lineGap: 1.5 });

  doc.y = startY + boxH + 6;
}

/**
 * Dibuja una galería de fotos de especialidades gastronómicas en 2 columnas
 */
function drawDishGallery(doc, items, caption) {
  if (doc.y > 580) doc.addPage();
  doc.moveDown(0.4);

  const startY = doc.y;
  const colW = 238;
  const gap = 24;
  const imgW = 75;

  items.forEach((item, idx) => {
    const isRight = idx % 2 === 1;
    const itemX = THEME.marginLeft + (isRight ? colW + gap : 0);
    const itemY = startY + (Math.floor(idx / 2) * 65);

    doc.roundedRect(itemX, itemY, colW, 60, 3)
       .fillAndStroke('#ffffff', THEME.border);

    if (fs.existsSync(item.imgPath)) {
      try {
        doc.image(item.imgPath, itemX + 4, itemY + 4, { width: imgW, height: 52 });
      } catch (e) {}
    }

    doc.font('Helvetica-Bold').fontSize(8.2).fillColor(THEME.navy)
       .text(item.name, itemX + imgW + 10, itemY + 6, { width: colW - imgW - 14 });
    doc.font('Helvetica').fontSize(7.5).fillColor(THEME.gold)
       .text(item.price, itemX + imgW + 10, itemY + 18);
    doc.font('Helvetica').fontSize(7.2).fillColor(THEME.muted)
       .text(item.desc, itemX + imgW + 10, itemY + 28, { width: colW - imgW - 14, lineGap: 1 });
  });

  const totalGalleryHeight = Math.ceil(items.length / 2) * 65;
  doc.y = startY + totalGalleryHeight + 6;

  if (caption) {
    doc.font('Helvetica-Oblique').fontSize(7.8).fillColor(THEME.muted)
       .text(caption, THEME.marginLeft, doc.y, { width: THEME.contentWidth, align: 'center' });
    doc.moveDown(0.4);
  }
}

/**
 * Dibuja el Diagrama de Arquitectura de Software como bloques visuales vectoriales
 */
function drawArchitectureDiagram(doc) {
  if (doc.y > 580) doc.addPage();
  doc.moveDown(0.4);

  const startY = doc.y;
  const diagW = THEME.contentWidth;
  const boxH = 46;

  const topBoxes = [
    { title: 'TABLETS EN MESA', sub: 'Autoservicio Comensal\nUpselling Gemini IA' },
    { title: 'MONITOR KDS COCINA', sub: 'Display Táctil de Cocción\nAlertas Web Audio' },
    { title: 'GERENCIA & CAJA', sub: 'Panel Admin & Reportes\nFacturación e-CF DGII' }
  ];

  const colW = 152;
  const colGap = 22;

  topBoxes.forEach((b, i) => {
    const x = THEME.marginLeft + i * (colW + colGap);
    doc.roundedRect(x, startY, colW, boxH, 3).fillAndStroke('#f8fafc', THEME.navy);
    doc.rect(x, startY, colW, 3).fill(THEME.navy);
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor(THEME.navy)
       .text(b.title, x + 4, startY + 8, { width: colW - 8, align: 'center' });
    doc.font('Helvetica').fontSize(6.8).fillColor(THEME.muted)
       .text(b.sub, x + 4, startY + 20, { width: colW - 8, align: 'center', lineGap: 1.5 });
  });

  const midY = startY + boxH + 16;
  doc.moveTo(THEME.pageWidth / 2, startY + boxH).lineTo(THEME.pageWidth / 2, midY).lineWidth(1).strokeColor(THEME.navy).stroke();

  doc.roundedRect(THEME.marginLeft + 40, midY, diagW - 80, 48, 4).fillAndStroke('#0f2b48', THEME.gold);
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff')
     .text('GOOGLE CLOUD RUN (SERVERLESS CONTAINER - HTTPS)', THEME.marginLeft + 40, midY + 8, { width: diagW - 80, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#cbd5e1')
     .text('Node.js 20 LTS Alpine • Express 5.3 REST API • Socket.IO WebSockets • Crypto SHA-256', THEME.marginLeft + 40, midY + 22, { width: diagW - 80, align: 'center' });

  const bottomY = midY + 48 + 16;
  doc.moveTo(THEME.pageWidth / 2, midY + 48).lineTo(THEME.pageWidth / 2, bottomY).lineWidth(1).strokeColor(THEME.navy).stroke();

  const botBoxes = [
    { title: 'BASE DE DATOS', sub: 'JSON Store Atómico\n(data/database.json)' },
    { title: 'PLATAFORMA DGII', sub: 'API e-CF Ley 32-23\nE31, E32, E34 & QR' },
    { title: 'PASARELA PAYPAL', sub: 'Checkout QR Dinámico\nDivisa USD / DOP' }
  ];

  botBoxes.forEach((b, i) => {
    const x = THEME.marginLeft + i * (colW + colGap);
    doc.roundedRect(x, bottomY, colW, boxH, 3).fillAndStroke('#f8fafc', THEME.navyLight);
    doc.rect(x, bottomY, colW, 3).fill(THEME.gold);
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor(THEME.navy)
       .text(b.title, x + 4, bottomY + 8, { width: colW - 8, align: 'center' });
    doc.font('Helvetica').fontSize(6.8).fillColor(THEME.muted)
       .text(b.sub, x + 4, bottomY + 20, { width: colW - 8, align: 'center', lineGap: 1.5 });
  });

  doc.y = bottomY + boxH + 8;
  doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(THEME.muted)
     .text('Figura 1: Arquitectura Multi-Capa del Sistema de Autoservicio, KDS y Facturación Fiscal.', THEME.marginLeft, doc.y, { width: THEME.contentWidth, align: 'center' });
  doc.moveDown(0.4);
}

/**
 * Tabla de Contenido Académica (Página 2 estricta, sin saltos accidentales)
 */
function drawAcademicTOC(doc, items) {
  doc.y = 52;

  doc.font('Helvetica-Bold').fontSize(12).fillColor(THEME.navy)
     .text('ÍNDICE GENERAL', THEME.marginLeft, doc.y);
  doc.moveDown(0.2);

  doc.moveTo(THEME.marginLeft, doc.y)
     .lineTo(THEME.pageWidth - THEME.marginRight, doc.y)
     .lineWidth(1)
     .strokeColor(THEME.gold)
     .stroke();
  doc.moveDown(0.5);

  items.forEach(it => {
    const isSub = it.level === 2;
    const indent = isSub ? THEME.marginLeft + 18 : THEME.marginLeft;
    const titleWidth = isSub ? 370 : 390;
    const curY = doc.y;

    doc.font(isSub ? 'Helvetica' : 'Helvetica-Bold')
       .fontSize(isSub ? 8.2 : 9)
       .fillColor(isSub ? THEME.body : THEME.navy)
       .text(it.title, indent, curY, { width: titleWidth, lineBreak: false });

    // Puntos de relleno
    const textW = doc.widthOfString(it.title, { fontSize: isSub ? 8.2 : 9 });
    const dotsStart = indent + textW + 8;
    const dotsEnd = THEME.pageWidth - THEME.marginRight - 35;

    if (dotsEnd > dotsStart) {
      doc.font('Helvetica').fontSize(7.5).fillColor(THEME.muted);
      let dots = '';
      while (doc.widthOfString(dots + '. ') < (dotsEnd - dotsStart)) {
        dots += '. ';
      }
      doc.text(dots, dotsStart, curY, { lineBreak: false });
    }

    // Número de página
    doc.font('Helvetica-Bold').fontSize(isSub ? 8.2 : 9).fillColor(THEME.gold)
       .text(String(it.page), THEME.pageWidth - THEME.marginRight - 28, curY, { width: 28, align: 'right', lineBreak: false });

    doc.y = curY + (isSub ? 14 : 17);
  });
}

module.exports = {
  THEME,
  IMAGES_DIR,
  LOGO_PATH,
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
  drawArchitectureDiagram,
  drawAcademicTOC
};
