const { generateInstalacionPDF } = require('./build_instalacion_pdf');
const { generateUsuarioPDF } = require('./build_usuario_pdf');

async function main() {
  console.log('Iniciando compilación de manuales en PDF para UTESA...');
  try {
    const instPdf = await generateInstalacionPDF();
    console.log('[OK] Manual de Instalación compilado:', instPdf);
    const userPdf = await generateUsuarioPDF();
    console.log('[OK] Manual de Usuario compilado:', userPdf);
    console.log('TODOS LOS MANUALES FUERON COMPILADOS EXITOSAMENTE.');
  } catch (err) {
    console.error('Error fatal al compilar los PDFs:', err);
    process.exit(1);
  }
}

main();
