const { generateInstalacionAcademicPDF } = require('./build_instalacion_academic');
const { generateUsuarioAcademicPDF } = require('./build_usuario_academic');

async function main() {
  console.log('Compilando manuales académicos oficiales de UTESA en formato PDF...');
  try {
    const inst = await generateInstalacionAcademicPDF();
    const user = await generateUsuarioAcademicPDF();
    console.log('--------------------------------------------------------------');
    console.log(`[EXITO] Manual de Instalación: ${inst.path} (${inst.totalPages} páginas)`);
    console.log(`[EXITO] Manual de Usuario:     ${user.path} (${user.totalPages} páginas)`);
    console.log('--------------------------------------------------------------');
    console.log('Compilación finalizada sin errores ni páginas en blanco.');
  } catch (err) {
    console.error('Error fatal al compilar manuales:', err);
    process.exit(1);
  }
}

main();
