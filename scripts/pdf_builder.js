const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Rutas de archivos
const LOGO_PATH = path.join(__dirname, '..', 'public', 'assets', 'images', 'logo.jpg');
const OUT_DIR = path.join(__dirname, '..', 'docs');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Paleta de Colores
const COLORS = {
  primary: '#c2410c',      // Naranja quemado liniero
  accent: '#ea580c',       // Naranja vivo
  dark: '#0f172a',         // Azul noche profundo
  headerBg: '#1e293b',     // Gris azulado cabecera tablas
  text: '#334155',         // Gris texto principal
  muted: '#64748b',        // Gris secundario
  lightBg: '#f8fafc',      // Fondo tenue
  calloutBg: '#fff7ed',    // Fondo alerta naranja
  calloutBorder: '#f97316',// Borde alerta naranja
  codeBg: '#f1f5f9',       // Fondo bloques de código
  codeBorder: '#cbd5e1',   // Borde bloques de código
  line: '#e2e8f0',         // Líneas divisoras
};

function createBaseDocument() {
  return new PDFDocument({
    size: 'LETTER',
    margins: { top: 54, bottom: 54, left: 50, right: 50 },
    bufferPages: true,
    info: {
      Author: 'Jeremi Santos Fabian (1-19-7223)',
      Creator: 'UTESA - Proyecto Integrador',
      Producer: 'PDFKit Engine v0.15',
    }
  });
}

function drawAcademicCover(doc, config) {
  const { width, height } = doc.page;
  const margin = 36;

  // Marco exterior
  doc.rect(margin, margin, width - margin * 2, height - margin * 2)
     .lineWidth(1.5)
     .strokeColor(COLORS.headerBg)
     .stroke();

  // Marco interior
  doc.rect(margin + 4, margin + 4, width - (margin + 4) * 2, height - (margin + 4) * 2)
     .lineWidth(0.75)
     .strokeColor(COLORS.accent)
     .stroke();

  let y = margin + 26;

  // Encabezado UTESA
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.dark)
     .text('UNIVERSIDAD TECNOLÓGICA DE SANTIAGO (UTESA)', 50, y, { align: 'center' });
  y += 18;

  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.muted)
     .text('RECINTO SANTIAGO • SEDE CENTRAL', 50, y, { align: 'center' });
  y += 14;

  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted)
     .text('FACULTAD DE INGENIERÍA Y ARQUITECTURA', 50, y, { align: 'center' });
  y += 14;

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.primary)
     .text('CARRERA DE INGENIERÍA EN SISTEMAS COMPUTACIONALES', 50, y, { align: 'center' });
  y += 15;

  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.dark)
     .text('ASIGNATURA: PROYECTO INTEGRADOR', 50, y, { align: 'center' });
  y += 18;

  // Línea ornamental
  doc.moveTo(120, y).lineTo(width - 120, y).lineWidth(1).strokeColor(COLORS.accent).stroke();
  y += 20;

  // Logotipo
  if (fs.existsSync(LOGO_PATH)) {
    try {
      const logoWidth = 90;
      const logoX = (width - logoWidth) / 2;
      doc.image(LOGO_PATH, logoX, y, { width: logoWidth });
      y += 98;
    } catch (e) {
      y += 15;
    }
  } else {
    y += 15;
  }

  // Título
  doc.font('Helvetica-Bold').fontSize(17).fillColor(COLORS.primary)
     .text(config.title, 55, y, { align: 'center' });
  y += doc.heightOfString(config.title, { width: width - 110 }) + 6;

  if (config.subtitle) {
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLORS.headerBg)
       .text(config.subtitle, 60, y, { align: 'center' });
    y += doc.heightOfString(config.subtitle, { width: width - 120 }) + 10;
  }

  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text)
     .text('SISTEMA INTEGRAL MULTI-MODO DE AUTOSERVICIO, MONITOR KDS Y FACTURACIÓN FISCAL DGII (LEY 32-23)', 60, y, { align: 'center' });
  y += 22;

  // Cuadro formal de metadatos académicos
  const boxWidth = width - 140;
  const boxX = 70;
  const boxY = y;
  const boxHeight = 150;

  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5)
     .fillAndStroke(COLORS.lightBg, COLORS.codeBorder);

  // Barra lateral naranja
  doc.roundedRect(boxX, boxY, 4, boxHeight, 2)
     .fill(COLORS.accent);

  let metaY = boxY + 14;
  const metaItems = [
    { label: 'Entidad / Empresa:', val: 'Restaurante "Chivo al Campo SRL" (Villa Elisa, Monte Cristi)' },
    { label: 'RNC Institucional:', val: '132-90740-1 (Registro DGII Ley 32-23)' },
    { label: 'Docente Facilitador:', val: 'Prof. Iván Mendoza' },
    { label: 'Sustentante / Autor:', val: 'Jeremi Santos Fabian' },
    { label: 'Matrícula Estudiantil:', val: '1-19-7223' },
    { label: 'Versión del Sistema:', val: '2.4.0 (Cloud Native / Docker / Serverless)' },
    { label: 'Modalidad de Entrega:', val: 'Sustentación Final de Grado / Proyecto Integrador' }
  ];

  metaItems.forEach(item => {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.dark)
       .text(item.label, boxX + 16, metaY, { width: 145 });
    doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text)
       .text(item.val, boxX + 165, metaY, { width: boxWidth - 175 });
    metaY += 18;
  });

  const footerY = height - margin - 38;
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.headerBg)
     .text('Santiago de los Caballeros, República Dominicana', 50, footerY, { align: 'center' });
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted)
     .text('Noviembre 2026', 50, footerY + 14, { align: 'center' });

  // Crear página para la portada y pasar a página 2 (índice reservado)
  doc.addPage();
}

function applyHeadersAndFooters(doc, docTitle) {
  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = 1; i < totalPages; i++) {
    doc.switchToPage(i);
    const { width, height } = doc.page;

    // Encabezado
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.muted)
       .text('UTESA • PROYECTO INTEGRADOR • PROF. IVÁN MENDOZA', 50, 24);

    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.primary)
       .text(docTitle.toUpperCase(), width - 260, 24, { width: 210, align: 'right' });

    doc.moveTo(50, 36).lineTo(width - 50, 36).lineWidth(0.5).strokeColor(COLORS.line).stroke();

    // Pie de página
    doc.moveTo(50, height - 36).lineTo(width - 50, height - 36).lineWidth(0.5).strokeColor(COLORS.line).stroke();

    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted)
       .text('Restaurante Chivo al Campo SRL • Jeremi Santos Fabian (1-19-7223)', 50, height - 28);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.dark)
       .text(`Página ${i + 1} de ${totalPages}`, width - 150, height - 28, { width: 100, align: 'right' });
  }
}

function drawH1(doc, title, tracker) {
  if (doc.y > 660) doc.addPage();

  const currentPage = doc.bufferedPageRange().count;
  if (tracker) {
    tracker.push({ title, page: currentPage, level: 1 });
  }

  doc.moveDown(0.7);
  const startY = doc.y;
  const { width } = doc.page;
  const contentWidth = width - 100;

  // Barra de acento
  doc.rect(50, startY, 4, 20).fill(COLORS.accent);
  doc.rect(56, startY, contentWidth - 6, 20).fill('#f8fafc');

  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLORS.dark)
     .text(title, 64, startY + 4, { width: contentWidth - 20 });

  doc.y = startY + 28;
}

function drawH2(doc, title, tracker) {
  if (doc.y > 690) doc.addPage();
  const currentPage = doc.bufferedPageRange().count;
  if (tracker) {
    tracker.push({ title, page: currentPage, level: 2 });
  }

  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary)
     .text(title, 50, doc.y);
  doc.moveDown(0.3);
}

function drawH3(doc, title) {
  if (doc.y > 700) doc.addPage();
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(9.2).fillColor(COLORS.headerBg)
     .text(title, 50, doc.y);
  doc.moveDown(0.2);
}

function drawParagraph(doc, text, options = {}) {
  if (doc.y > 720) doc.addPage();
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(options.fontSize || 9)
     .fillColor(options.color || COLORS.text)
     .text(text, 50, doc.y, {
       width: 512,
       align: options.align || 'justify',
       lineGap: 2.2,
       ...options
     });
  doc.moveDown(0.35);
}

function drawBullet(doc, boldPrefix, text) {
  if (doc.y > 720) doc.addPage();
  const y = doc.y;
  doc.circle(56, y + 4.5, 2.3).fill(COLORS.accent);

  doc.font('Helvetica-Bold').fontSize(8.8).fillColor(COLORS.dark)
     .text(boldPrefix + ' ', 66, y, { continued: true });
  doc.font('Helvetica').fontSize(8.8).fillColor(COLORS.text)
     .text(text, { width: 494, lineGap: 1.5 });
  doc.moveDown(0.3);
}

function drawCallout(doc, type, title, text) {
  if (doc.y > 670) doc.addPage();
  doc.moveDown(0.4);

  const boxX = 50;
  const boxWidth = 512;
  const startY = doc.y;

  const titleHeight = title ? 14 : 0;
  const textHeight = doc.heightOfString(text, { width: boxWidth - 28, fontSize: 8.5 });
  const boxHeight = titleHeight + textHeight + 16;

  const isWarning = type === 'warning' || type === 'important';
  const bgColor = isWarning ? '#fff7ed' : '#f0fdf4';
  const borderColor = isWarning ? '#f97316' : '#22c55e';

  doc.roundedRect(boxX, startY, boxWidth, boxHeight, 3)
     .fillAndStroke(bgColor, '#fed7aa');

  // Barra izquierda
  doc.roundedRect(boxX, startY, 4, boxHeight, 1.5)
     .fill(borderColor);

  let currentY = startY + 8;
  if (title) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(borderColor)
       .text(title.toUpperCase(), boxX + 14, currentY, { width: boxWidth - 28 });
    currentY += 12;
  }

  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text)
     .text(text, boxX + 14, currentY, { width: boxWidth - 28, lineGap: 1.5 });

  doc.y = startY + boxHeight + 8;
}

function drawCodeBlock(doc, codeText) {
  if (doc.y > 660) doc.addPage();
  doc.moveDown(0.3);

  const boxX = 50;
  const boxWidth = 512;
  const lines = codeText.trim().split('\n');
  const lineHeight = 11;
  const boxHeight = lines.length * lineHeight + 14;

  if (doc.y + boxHeight > 730) doc.addPage();

  const startY = doc.y;
  doc.roundedRect(boxX, startY, boxWidth, boxHeight, 3)
     .fillAndStroke(COLORS.codeBg, COLORS.codeBorder);

  doc.rect(boxX, startY, boxWidth, 3).fill(COLORS.headerBg);

  let textY = startY + 8;
  lines.forEach(line => {
    doc.font('Courier').fontSize(7.5).fillColor(COLORS.dark)
       .text(line, boxX + 10, textY, { width: boxWidth - 20 });
    textY += lineHeight;
  });

  doc.y = startY + boxHeight + 8;
}

function drawTable(doc, headers, rows, colWidths) {
  if (doc.y > 670) doc.addPage();
  doc.moveDown(0.4);

  const tableX = 50;
  let currentY = doc.y;
  const headerHeight = 18;

  doc.rect(tableX, currentY, 512, headerHeight).fill(COLORS.headerBg);

  let colX = tableX;
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(7.8).fillColor('#ffffff')
       .text(h, colX + 4, currentY + 5, { width: colWidths[i] - 8, align: 'left' });
    colX += colWidths[i];
  });

  currentY += headerHeight;

  rows.forEach((row, rowIndex) => {
    let maxCellHeight = 15;
    row.forEach((cell, i) => {
      const h = doc.heightOfString(cell, { width: colWidths[i] - 8, fontSize: 7.6 });
      if (h + 6 > maxCellHeight) maxCellHeight = h + 6;
    });

    if (currentY + maxCellHeight > 730) {
      doc.addPage();
      currentY = 54;
      doc.rect(tableX, currentY, 512, headerHeight).fill(COLORS.headerBg);
      let repeatColX = tableX;
      headers.forEach((h, i) => {
        doc.font('Helvetica-Bold').fontSize(7.8).fillColor('#ffffff')
           .text(h, repeatColX + 4, currentY + 5, { width: colWidths[i] - 8, align: 'left' });
        repeatColX += colWidths[i];
      });
      currentY += headerHeight;
    }

    const rowBg = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(tableX, currentY, 512, maxCellHeight).fill(rowBg);
    doc.rect(tableX, currentY, 512, maxCellHeight).lineWidth(0.5).strokeColor(COLORS.line).stroke();

    let cellX = tableX;
    row.forEach((cell, i) => {
      const isBold = (i === 0 && row.length > 2);
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.6).fillColor(COLORS.dark)
         .text(cell, cellX + 4, currentY + 3.5, { width: colWidths[i] - 8 });
      cellX += colWidths[i];
    });

    currentY += maxCellHeight;
  });

  doc.y = currentY + 8;
}

/**
 * Renderiza la Tabla de Contenido en la página 2
 */
function renderTOCAtPage(doc, targetPageIndex, items) {
  doc.switchToPage(targetPageIndex);
  doc.y = 54;

  // Título de la tabla de contenido
  const startY = doc.y;
  const { width } = doc.page;
  const contentWidth = width - 100;

  doc.rect(50, startY, 4, 20).fill(COLORS.accent);
  doc.rect(56, startY, contentWidth - 6, 20).fill('#f8fafc');
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLORS.dark)
     .text('TABLA DE CONTENIDO', 64, startY + 4, { width: contentWidth - 20 });
  doc.y = startY + 30;

  items.forEach(item => {
    if (doc.y > 720) return; // Mantener dentro de la página reservada
    const y = doc.y;
    const isSub = item.level === 2;
    const indent = isSub ? 68 : 50;
    const titleWidth = isSub ? 385 : 405;

    doc.font(isSub ? 'Helvetica' : 'Helvetica-Bold')
       .fontSize(isSub ? 8.2 : 9)
       .fillColor(isSub ? COLORS.text : COLORS.dark)
       .text(item.title, indent, y, { width: titleWidth });

    // Paginación
    doc.font('Helvetica-Bold')
       .fontSize(isSub ? 8.2 : 9)
       .fillColor(COLORS.primary)
       .text(String(item.page), 515, y, { width: 45, align: 'right' });

    // Puntos de relleno
    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted);
    const textW = doc.widthOfString(item.title, { fontSize: isSub ? 8.2 : 9 });
    const startDots = indent + textW + 6;
    const endDots = 510;
    if (endDots > startDots) {
      let dotStr = '';
      while (doc.widthOfString(dotStr + '. ') < (endDots - startDots)) {
        dotStr += '. ';
      }
      doc.text(dotStr, startDots, y);
    }

    doc.moveDown(isSub ? 0.3 : 0.4);
  });
}

module.exports = {
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
};
