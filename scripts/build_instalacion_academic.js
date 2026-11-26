const fs = require('fs');
const path = require('path');
const {
  THEME,
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
  drawArchitectureDiagram,
  drawAcademicTOC
} = require('./pdf_academic_engine');

function buildInstalacionContent(doc, pageTracker) {
  // Función auxiliar para registrar página
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

  // 1.0 INTRODUCCIÓN Y JUSTIFICACIÓN
  mark('1.0', 'Introducción y Justificación');
  drawH1(doc, '1.0', 'Introducción y Justificación');
  drawParagraph(doc, 'El presente documento técnico constituye el manual de ingeniería para la instalación, configuración de entorno y despliegue del sistema informático del restaurante gastronómico "Chivo al Campo SRL", ubicado en Villa Elisa, Monte Cristi, República Dominicana.');
  drawParagraph(doc, 'La solución tecnológica surge como respuesta a la necesidad de optimizar los tiempos de atención en mesa, sincronizar la comanda culinaria en cocina y asegurar el estricto cumplimiento tributario exigido por la Dirección General de Impuestos Internos (DGII) bajo la Ley 32-23 de Facturación Electrónica.');
  drawParagraph(doc, 'Este manual proporciona las instrucciones detalladas para desplegar la aplicación en tres escenarios de ejecución: desarrollo local en Node.js, empaquetado en contenedores Docker y despliegue serverless de alta disponibilidad en Google Cloud Run con certificado SSL gestionado por Google.');

  // 2.0 ARQUITECTURA DE LA SOLUCIÓN
  mark('2.0', 'Arquitectura de la Solución');
  drawH1(doc, '2.0', 'Arquitectura de la Solución');
  drawParagraph(doc, 'El sistema se fundamenta en un modelo cliente-servidor reactivo impulsado por WebSockets (Socket.IO) y una API RESTful servida sobre Express.js:');
  
  // Diagrama visual en bloques
  drawArchitectureDiagram(doc);

  drawH2(doc, '2.1', 'Componentes del Stack Tecnológico');
  const stackHeaders = ['Capa del Sistema', 'Tecnología Empleada', 'Versión / Estándar', 'Función Principal'];
  const stackRows = [
    ['Motor de Ejecución', 'Node.js LTS', 'v20.x+', 'Entorno de ejecución JavaScript del servidor backend'],
    ['Servidor Web / API', 'Express.js', 'v5.3+', 'Enrutamiento REST, middleware de compresión y seguridad'],
    ['Protocolo Tiempo Real', 'Socket.IO', 'v4.8+', 'Sincronización bidireccional entre Tablets, Cocina y Caja'],
    ['Criptografía', 'Node Crypto API', 'SHA-256', 'Almacenamiento seguro y verificación de credenciales'],
    ['Facturación Electrónica', 'Plataforma IMECF / DGII', 'Ley 32-23', 'Generación de XML, timbrado fiscal y e-NCF E31/E32/E34'],
    ['Pasarela de Pago', 'PayPal REST API', 'Checkout v2', 'Cobro digital seguro mediante código QR dinámico'],
    ['Inteligencia Artificial', 'Google Gemini AI', 'Flash 1.5 API', 'Motor de upselling culinario y proyección de inventario'],
    ['Contenedores', 'Docker Engine', 'node:20-alpine', 'Imagen ligera con footprint de memoria inferior a 90 MB'],
    ['Hosting en la Nube', 'Google Cloud Run', 'Serverless HTTPS', 'Alojamiento escalable con certificado SSL automático']
  ];
  drawTable(doc, 'Tabla 1: Especificaciones del Stack Tecnológico del Proyecto.', stackHeaders, stackRows, [100, 110, 85, 195]);

  // 3.0 REQUERIMIENTOS DE INFRAESTRUCTURA
  mark('3.0', 'Requerimientos de Infraestructura');
  drawH1(doc, '3.0', 'Requerimientos de Infraestructura');
  drawParagraph(doc, 'Para garantizar un desempeño óptimo tanto en ambiente de desarrollo como en producción, el servidor debe cumplir con las siguientes especificaciones:');

  drawH2(doc, '3.1', 'Requerimientos Mínimos de Hardware');
  drawBullet(doc, 'Procesador:', 'CPU x86_64 o ARM64 Dual-Core a 1.8 GHz o superior (Intel Core i3 / AMD Ryzen 3 / Apple Silicon).');
  drawBullet(doc, 'Memoria RAM:', 'Mínimo 2 GB de memoria RAM física libre (Recomendado 4 GB o superior para Docker).');
  drawBullet(doc, 'Almacenamiento en Disco:', 'Mínimo 500 MB de espacio disponible para código fuente y módulos npm.');
  drawBullet(doc, 'Conectividad a Red:', 'Acceso a Internet con ancho de banda mínimo de 5 Mbps para consultas a la API de DGII.');

  drawH2(doc, '3.2', 'Herramientas de Software y Comandos de Verificación');
  const softHeaders = ['Herramienta', 'Versión Requerida', 'Propósito en la Solución', 'Comando de Verificación'];
  const softRows = [
    ['Git', '2.30.0 o superior', 'Control de versiones y sincronización de código', 'git --version'],
    ['Node.js', '20.x LTS', 'Plataforma de ejecución del backend', 'node -v'],
    ['npm', '10.x o superior', 'Gestor de dependencias y paquetes de software', 'npm -v'],
    ['Docker (Opcional)', '24.0.0 o superior', 'Creación y ejecución de contenedores locales', 'docker --version'],
    ['Google Cloud SDK', '450.0.0 o superior', 'Administración y despliegue en Google Cloud', 'gcloud version']
  ];
  drawTable(doc, 'Tabla 2: Requerimientos de Software y Comandos de Verificación.', softHeaders, softRows, [105, 85, 185, 115]);

  // 4.0 ORGANIZACIÓN DEL DIRECTORIO DEL PROYECTO
  mark('4.0', 'Organización del Directorio del Proyecto');
  drawH1(doc, '4.0', 'Organización del Directorio del Proyecto');
  drawParagraph(doc, 'La solución se estructura en módulos desacoplados para facilitar el mantenimiento y la escalabilidad del sistema:');

  drawCodeBlock(doc,
`chivo-al-campo/
├── data/
│   └── database.json          # Almacén atómico persistente (Mesas, Facturas, e-NCF, Empleados)
├── docs/
│   ├── MANUAL_DE_INSTALACION.pdf # Guía técnica de instalación y despliegue (Este documento)
│   └── MANUAL_DE_USUARIO.pdf     # Manual integral de operación del sistema
├── public/                    # Recursos web servidos estáticamente por Express
│   ├── assets/images/         # Banco fotográfico de especialidades gastronómicas linieras
│   ├── css/                   # Hojas de estilo modular (kds.css, style.css)
│   ├── js/                    # Lógica JavaScript frontend (admin.js, cocina.js, tablet.js)
│   ├── admin.html             # Interfaz de Gerencia, Caja y Centro de 36 Reportes
│   ├── cocina.html            # Interfaz de Cocina táctil KDS con alertas sonoras
│   ├── index.html             # Portal central de enrutamiento y selección de mesas
│   └── tablet.html            # Interfaz táctil de comensales para autoservicio
├── Dockerfile                 # Definición de contenedor ligero sobre Alpine Linux
├── cloudbuild.yaml            # Pipeline de CI/CD automatizado para Google Cloud Build
├── package.json               # Dependencias del servidor y scripts de arranque
└── server.js                  # Servidor Express central, WebSockets y controladores REST`);

  // 5.0 PARAMETRIZACIÓN Y VARIABLES DE ENTORNO (.env)
  mark('5.0', 'Parametrización y Variables de Entorno');
  drawH1(doc, '5.0', 'Parametrización y Variables de Entorno');
  drawParagraph(doc, 'La parametrización del sistema se administra mediante variables de entorno cargadas con la librería dotenv. Esto garantiza que las credenciales no se expongan en repositorios públicos.');

  drawH2(doc, '5.1', 'Configuración del Archivo .env');
  drawParagraph(doc, 'Genere una copia del archivo .env.example ubicado en la raíz del proyecto y renómbrelo como .env:');

  drawCodeBlock(doc,
`# En terminal Windows PowerShell:
Copy-Item .env.example .env

# En terminal Linux o macOS:
cp .env.example .env`);

  drawH2(doc, '5.2', 'Estructura Completa de Variables');
  drawCodeBlock(doc,
`# Parámetros del Servidor
PORT=8080
NODE_ENV=production

# Identificación Fiscal de la Empresa (DGII República Dominicana)
RESTAURANTE_NOMBRE="Restaurante Chivo al Campo SRL"
RESTAURANTE_RNC="132-90740-1"
RESTAURANTE_DIRECCION="Carretera Duarte Km 2, Villa Elisa, Monte Cristi, R.D."
RESTAURANTE_TELEFONO="(809) 555-0199"

# Tasas Impositivas Vigentes
ITBIS_PORCENTAJE=0.18
PROPINA_LEGAL_PORCENTAJE=0.10

# Plataforma de Facturación Electrónica e-CF
ECF_API_URL="https://ecf-platform-backend-50801509587.us-central1.run.app"

# Integraciones de Terceros (Opcionales con fallback automático)
GEMINI_API_KEY=""
PAYPAL_CLIENT_ID=""
PAYPAL_CURRENCY="USD"
TASA_CAMBIO_USD_DOP=60.00`);

  drawCallout(doc, 'info', 'Resiliencia del Sistema', 'El software implementa controladores de contingencia local. Si las credenciales de Gemini IA o PayPal no se configuran, el sistema opera con reglas heurísticas internas y simulación de transacciones fiscales sin interrumpir el servicio.');

  // 6.0 PUESTA EN MARCHA EN ENTORNO LOCAL (NODE.JS)
  mark('6.0', 'Puesta en Marcha en Entorno Local');
  drawH1(doc, '6.0', 'Puesta en Marcha en Entorno Local');
  drawParagraph(doc, 'Procedimiento estándar para clonar, instalar dependencias e iniciar el sistema en una máquina local:');

  drawH2(doc, '6.1', 'Clonar el Repositorio de GitHub');
  drawCodeBlock(doc,
`git clone https://github.com/uniutesa1-sketch/chivo-al-campo.git
cd chivo-al-campo`);

  drawH2(doc, '6.2', 'Instalación de Dependencias');
  drawCodeBlock(doc, `npm install`);

  drawH2(doc, '6.3', 'Arranque del Servidor Backend');
  drawCodeBlock(doc, `npm start`);
  drawParagraph(doc, 'Al inicializar, el servidor registrará en la consola el siguiente mensaje de conformidad:');
  drawCodeBlock(doc,
`==================================================================
  RESTAURANTE CHIVO AL CAMPO SRL - SISTEMA MULTI-MODO INICIADO
  Normativa Fiscal: e-NCF DGII Ley 32-23 (E31 / E32 / E34)
  Servidor escuchando en: http://localhost:8080
==================================================================`);

  drawH2(doc, '6.4', 'Puntos de Acceso Web Local');
  const urlHeaders = ['Módulo', 'Ruta Web', 'Destinatario Operativo'];
  const urlRows = [
    ['Portal de Acceso General', 'http://localhost:8080/', 'Pantalla de selección de perfiles del restaurante'],
    ['Tablet Autoservicio', 'http://localhost:8080/tablet.html?mesa=4', 'Dispositivo en mesa para comensales'],
    ['Monitor de Cocina KDS', 'http://localhost:8080/cocina.html', 'Display táctil del Chef Ejecutivo y cocineros'],
    ['Panel Gerencial y Caja', 'http://localhost:8080/admin.html', 'Administración, Auditoría NCF y 36 Reportes']
  ];
  drawTable(doc, 'Tabla 3: Puntos de Acceso del Ecosistema en Entorno Local.', urlHeaders, urlRows, [140, 180, 170]);

  // 7.0 EMPAQUETADO Y DESPLIEGUE CON DOCKER
  mark('7.0', 'Empaquetado y Despliegue con Docker');
  drawH1(doc, '7.0', 'Empaquetado y Despliegue con Docker');
  drawParagraph(doc, 'El archivo Dockerfile compila una imagen contenerizada basada en Alpine Linux, asegurando aislamiento total y portabilidad multiplataforma:');

  drawH2(doc, '7.1', 'Compilación de la Imagen Docker');
  drawCodeBlock(doc, `docker build -t chivo-al-campo:latest .`);

  drawH2(doc, '7.2', 'Ejecución del Contenedor');
  drawCodeBlock(doc, `docker run -d -p 8080:8080 --name chivo-app chivo-al-campo:latest`);

  drawH2(doc, '7.3', 'Persistencia de Datos con Volúmenes');
  drawParagraph(doc, 'Para asegurar que los registros de facturas y el inventario se conserven al reiniciar el contenedor:');
  drawCodeBlock(doc, `docker run -d -p 8080:8080 -v \${PWD}/data:/usr/src/app/data --name chivo-app chivo-al-campo:latest`);

  // 8.0 CANALIZACIÓN CI/CD Y DESPLIEGUE EN GOOGLE CLOUD RUN
  mark('8.0', 'Canalización CI/CD y Despliegue en Google Cloud');
  drawH1(doc, '8.0', 'Canalización CI/CD y Despliegue en Google Cloud');
  drawParagraph(doc, 'El proyecto integra una tubería de integración continua y despliegue continuo (CI/CD) alojada en la infraestructura de Google Cloud Platform (GCP):');

  drawBullet(doc, '1. Disparo Automático:', 'Cada confirmación enviada a la rama main activa un Webhook de GitHub hacia Cloud Build.');
  drawBullet(doc, '2. Compilación de Contenedor:', 'Cloud Build ejecuta los pasos de cloudbuild.yaml, construyendo la imagen Alpine.');
  drawBullet(doc, '3. Registro de Artefactos:', 'La imagen se almacena en Google Artifact Registry (gcr.io/$PROJECT_ID/chivo-al-campo).');
  drawBullet(doc, '4. Despliegue en Cloud Run:', 'Se crea una nueva revisión serverless sin interrupción de servicio (Zero-Downtime).');
  drawBullet(doc, '5. Encriptación HTTPS:', 'Google Cloud aprovisiona de forma nativa un certificado SSL con renovación automática.');

  drawH2(doc, '8.1', 'Despliegue Alternativo por Consola (Google Cloud SDK)');
  drawCodeBlock(doc,
`# Iniciar sesión en GCP y seleccionar proyecto
gcloud auth login
gcloud config set project TU_PROJECT_ID

# Compilar y desplegar con un solo comando
gcloud run deploy chivo-al-campo \\
  --source . \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --port 8080`);

  // 9.0 VALIDACIÓN DE SERVICIOS Y MONITOREO
  mark('9.0', 'Validación de Servicios y Monitoreo');
  drawH1(doc, '9.0', 'Validación de Servicios y Monitoreo');
  drawParagraph(doc, 'Para verificar la correcta puesta en marcha del sistema en producción, ejecute la siguiente lista de comprobaciones:');

  drawBullet(doc, 'Disponibilidad Web:', 'Acceda a la URL raíz y verifique que la portada cargue el diseño naranja y negro con el logo centrado.');
  drawBullet(doc, 'Sincronización WebSockets:', 'Abra una tablet y el monitor de cocina en dos pestañas; compruebe que al emitir un pedido el KDS reaccione al instante.');
  drawBullet(doc, 'Sintetizador Web Audio:', 'Presione la campana en el monitor KDS y verifique la reproducción del doble tono acústico.');
  drawBullet(doc, 'Autenticación Criptográfica:', 'Ingrese al panel administrativo con admin / admin123 y valide el acceso al Dashboard.');
  drawBullet(doc, 'Emisión Fiscal e-NCF:', 'Desde Auditoría Fiscal, pulse "Ver Ticket" y compruebe que el código QR fiscal enlace a la plataforma de DGII.');

  // 10.0 DIAGNÓSTICO DE FALLAS (TROUBLESHOOTING)
  mark('10.0', 'Diagnóstico de Fallas (Troubleshooting)');
  drawH1(doc, '10.0', 'Diagnóstico de Fallas (Troubleshooting)');
  drawParagraph(doc, 'Matriz de resolución para las incidencias técnicas más comunes durante la instalación y operación:');

  const errHeaders = ['Síntoma o Error', 'Causa Probable', 'Solución Técnica'];
  const errRows = [
    [
      'Error: listen EADDRINUSE: :::8080',
      'El puerto 8080 está tomado por otro proceso o instancia previa en ejecución.',
      'En Windows PowerShell ejecutar: Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force. O cambiar PORT=3000 en .env.'
    ],
    [
      'Mesas se liberan pero vuelven a mostrarse ocupadas',
      'Órdenes huérfanas en memoria conservaban el estado ocupado.',
      'Ir a /admin.html -> Plano de Mesas y presionar "Liberar Todas las Mesas". El backend depura pedidos pendientes automáticamente.'
    ],
    [
      'Permiso denegado en database.json en Docker',
      'El usuario del contenedor carece de privilegios de escritura en data/.',
      'Ejecutar en la máquina anfitriona: chmod -R 777 data.'
    ],
    [
      'Error 503 en Google Cloud Run',
      'El puerto no coincide con el provisto dinámicamente por la nube.',
      'Asegúrese de no forzar un puerto rígido distinto de 8080 en Cloud Run.'
    ],
    [
      'Alerta sonora bloqueada en KDS',
      'Las políticas de Autoplay del navegador bloquean audio no iniciado por usuario.',
      'Hacer un primer clic o toque en cualquier zona de la pantalla de cocina para autorizar la Web Audio API.'
    ]
  ];
  drawTable(doc, 'Tabla 4: Matriz de Diagnóstico y Resolución de Incidencias Técnicas.', errHeaders, errRows, [130, 160, 200]);

  drawParagraph(doc, 'Documento técnico oficial conforme a los requerimientos de la asignatura Proyecto Integrador de UTESA.', { bold: true, align: 'center' });
  drawParagraph(doc, 'Jeremi Santos Fabian (1-19-7223) • Prof. Iván Mendoza • UTESA Recinto Santiago 2026', { align: 'center', color: THEME.muted });
}

/**
 * Genera el archivo MANUAL_DE_INSTALACION.pdf final con 2 pasadas exactas
 */
async function generateInstalacionAcademicPDF() {
  const pdfPath = path.join(OUT_DIR, 'MANUAL_DE_INSTALACION.pdf');

  // Pasada 1: Simulación en memoria para calcular páginas reales de cada sección
  const simDoc = createAcademicDoc('Simulación Instalación');
  drawAcademicCover(simDoc, {
    title: 'MANUAL TÉCNICO DE INSTALACIÓN Y DESPLIEGUE EN LA NUBE',
    subtitle: 'INFRAESTRUCTURA SERVERLESS EN GOOGLE CLOUD RUN, CONTENEDORES DOCKER Y WEBSOCKETS'
  });
  simDoc.addPage(); // Reserva de TOC

  const tracker = [];
  buildInstalacionContent(simDoc, tracker);
  simDoc.end();

  // Pasada 2: Renderizado final en disco con TOC exacta y sin páginas en blanco
  return new Promise((resolve, reject) => {
    const doc = createAcademicDoc('Manual de Instalación y Despliegue');
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Página 1: Portada Académica
    drawAcademicCover(doc, {
      title: 'MANUAL TÉCNICO DE INSTALACIÓN Y DESPLIEGUE EN LA NUBE',
      subtitle: 'INFRAESTRUCTURA SERVERLESS EN GOOGLE CLOUD RUN, CONTENEDORES DOCKER Y WEBSOCKETS'
    });

    // Página 2: Índice General Académico
    doc.addPage();
    drawAcademicTOC(doc, tracker);

    // Página 3 en adelante: Contenido real
    doc.addPage();
    buildInstalacionContent(doc, null);

    // Finalizar aplicando encabezados y pies de página
    finalizeDocument(doc, 'Manual de Instalación y Despliegue');

    const total = doc.bufferedPageRange().count;
    doc.end();

    stream.on('finish', () => {
      console.log(`[OK] MANUAL_DE_INSTALACION.pdf generado exitosamente con ${total} páginas totales.`);
      resolve({ path: pdfPath, totalPages: total });
    });

    stream.on('error', err => reject(err));
  });
}

module.exports = { generateInstalacionAcademicPDF, buildInstalacionContent };

if (require.main === module) {
  generateInstalacionAcademicPDF();
}
