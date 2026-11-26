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

function generateInstalacionPDF() {
  return new Promise((resolve, reject) => {
    const doc = createBaseDocument();
    const pdfPath = path.join(OUT_DIR, 'MANUAL_DE_INSTALACION.pdf');
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // 1. Portada Académica (Página 1)
    drawAcademicCover(doc, {
      title: 'MANUAL DE INSTALACIÓN Y DESPLIEGUE EN LA NUBE',
      subtitle: 'GUÍA TÉCNICA DE INFRAESTRUCTURA, DOCKER, CLOUD BUILD Y CLOUD RUN HTTPS',
    });

    // Página 2 queda reservada para la Tabla de Contenido (TOC)
    // Pasamos a la Página 3 para iniciar el contenido
    doc.addPage();

    const tracker = [];

    // SECCIÓN 1
    drawH1(doc, '1. INTRODUCCIÓN Y OBJETIVOS DEL MANUAL', tracker);
    drawParagraph(doc, 'El presente documento técnico constituye la Guía Oficial de Instalación, Configuración y Despliegue para el ecosistema informático del restaurante gastronómico "Chivo al Campo SRL", ubicado en Villa Elisa, Monte Cristi, República Dominicana.');
    drawParagraph(doc, 'El propósito fundamental de este manual es suministrar al docente evaluador y al equipo técnico las especificaciones, comandos y directrices requeridas para poner en marcha el sistema en tres modalidades operativas distintas:');
    drawBullet(doc, 'Modo Desarrollo Local:', 'Ejecución directa sobre el motor de ejecución Node.js con recarga rápida y soporte de WebSockets en tiempo real.');
    drawBullet(doc, 'Modo Contenedorizado:', 'Empaquetado ligero y portátil mediante Docker sobre imágenes optimizadas de Alpine Linux.');
    drawBullet(doc, 'Modo Producción Serverless:', 'Despliegue automático de alta disponibilidad en Google Cloud Run con canalización CI/CD en Google Cloud Build y certificación SSL HTTPS gestionada por Google.');

    drawCallout(doc, 'info', 'Compromiso Normativo Dominicano', 'La solución se encuentra completamente homologada con la Ley 32-23 de Facturación Electrónica de la República Dominicana, integrando comprobantes fiscales de Consumo (E32), Crédito Fiscal (E31) y Notas de Crédito (E34).');

    // SECCIÓN 2
    drawH1(doc, '2. ARQUITECTURA DEL SISTEMA Y STACK TECNOLÓGICO', tracker);
    drawParagraph(doc, 'El sistema está concebido bajo el paradigma de arquitectura Single-Instance Serverless Web Application con comunicación reactiva bidireccional basada en WebSockets (Socket.IO):');

    drawCodeBlock(doc, 
`       [ CLIENTES Y SALÓN ]              [ COCINA KDS ]             [ GERENCIA Y CAJA ]
     Tablets en Mesa (PGM_CLIENTE)      Monitor Táctil KDS         Panel Admin (PGM_ADMIN)
                 │                               │                            │
                 └───────────────┬───────────────┴────────────────────────────┘
                                 │ HTTP REST / WebSocket (Socket.IO)
                                 ▼
                     ┌───────────────────────────────────────┐
                     │          GOOGLE CLOUD RUN             │
                     │   Contenedor Node.js 20 LTS (Alpine)  │
                     │   Express 5.3 + Socket.IO + Security  │
                     └───────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
      │   BASE DE DATOS     │ │    DGII / IMECF     │ │  GOOGLE GEMINI AI   │
      │   JSON Data Store   │ │ Facturación e-CF    │ │ Motor de Upselling  │
      │   (data/database)   │ │ Ley 32-23 (E31/E32) │ │ y Proyección Demanda│
      └─────────────────────┘ └─────────────────────┘ └─────────────────────┘`);

    drawH2(doc, 'Componentes del Stack Tecnológico:', tracker);
    const stackHeaders = ['Componente', 'Tecnología Empleada', 'Versión / Estándar', 'Función Principal'];
    const stackRows = [
      ['Runtime Backend', 'Node.js LTS', 'v20.x+', 'Motor de ejecución JavaScript del servidor'],
      ['Framework Web', 'Express.js', 'v5.3+', 'Enrutamiento REST, middleware de compresión y seguridad'],
      ['Tiempo Real', 'Socket.IO', 'v4.8+', 'Sincronización instantánea entre Tablets, KDS y Caja'],
      ['Criptografía', 'Node Crypto API', 'SHA-256', 'Hashing seguro para credenciales administrativas'],
      ['Facturación e-CF', 'API IMECF / DGII', 'Ley 32-23', 'Emisión, timbrado y validación de e-NCF E31/E32/E34'],
      ['Pasarela de Pago', 'PayPal REST API', 'v2 Checkout', 'Cobro digital por código QR dinámico'],
      ['Inteligencia Art.', 'Google Gemini AI', 'Flash 1.5 API', 'Sugerencias de upselling y proyección de compras'],
      ['Contenedores', 'Docker Engine', 'node:20-alpine', 'Empaquetado ligero y despliegue serverless'],
      ['Nube y Hosting', 'Google Cloud Run', 'Serverless', 'Alojamiento escalable con HTTPS automático']
    ];
    drawTable(doc, stackHeaders, stackRows, [85, 110, 85, 232]);

    // SECCIÓN 3
    drawH1(doc, '3. REQUISITOS PREVIOS DEL ENTORNO', tracker);
    drawH2(doc, 'Especificaciones Mínimas de Hardware:', tracker);
    drawBullet(doc, 'Procesador (CPU):', 'Dual-Core a 1.8 GHz o superior (Intel Core i3 / AMD Ryzen 3 o superior).');
    drawBullet(doc, 'Memoria RAM:', 'Mínimo 2 GB de memoria RAM física disponible (Recomendado 4 GB o más).');
    drawBullet(doc, 'Almacenamiento:', 'Mínimo 500 MB de espacio libre en disco rígido o unidad SSD.');
    drawBullet(doc, 'Conectividad:', 'Conexión a Internet activa para resolución de dependencias y timbrado DGII.');

    drawH2(doc, 'Requisitos de Software y Comandos de Verificación:', tracker);
    const reqHeaders = ['Software Requerido', 'Versión Mínima', 'Propósito en el Proyecto', 'Comando de Verificación'];
    const reqRows = [
      ['Git', '2.30.0+', 'Clonado del repositorio y control de versiones', 'git --version'],
      ['Node.js', '20.x LTS', 'Motor de ejecución backend y WebSockets', 'node -v'],
      ['npm', '10.x+', 'Gestor de paquetes y dependencias del proyecto', 'npm -v'],
      ['Docker (Opcional)', '24.0.0+', 'Compilación y ejecución de contenedor local', 'docker --version'],
      ['Google Cloud CLI', '450.0.0+', 'Despliegue y administración en GCP por consola', 'gcloud version']
    ];
    drawTable(doc, reqHeaders, reqRows, [110, 80, 202, 120]);

    // SECCIÓN 4
    drawH1(doc, '4. ESTRUCTURA JERÁRQUICA DEL PROYECTO', tracker);
    drawParagraph(doc, 'El proyecto mantiene una estructura modular, separando estrictamente la lógica de datos, controladores de servidor, documentación formal y aplicaciones frontend de salón, cocina y administración:');

    drawCodeBlock(doc,
`chivo-al-campo/
├── data/
│   └── database.json          # Almacén persistente (Mesas, Platos, Facturas, e-NCF, Empleados)
├── docs/
│   ├── MANUAL_DE_INSTALACION.pdf # Guía técnica oficial de instalación y despliegue (PDF)
│   ├── MANUAL_DE_USUARIO.pdf     # Manual de uso y operación integral del sistema (PDF)
│   ├── MANUAL_DE_INSTALACION.md  # Versión Markdown técnica
│   └── MANUAL_DE_USUARIO.md      # Versión Markdown operativa
├── public/                    # Archivos estáticos servidos por Express
│   ├── assets/                # Imágenes de platos caprinos, logo institucional, iconos
│   ├── css/                   # Hojas de estilo CSS (style.css, kds.css)
│   ├── js/                    # Lógica modular frontend
│   │   ├── admin.js           # Panel de administración, caja, auditoría NCF y mesas
│   │   ├── audio.js           # Web Audio API para alertas audibles
│   │   ├── cocina.js          # Monitor de Cocina KDS y despacho
│   │   ├── reportes30.js      # Catálogo de 36 consultas y reportes con exportación Excel/PDF
│   │   └── tablet.js          # Autoservicio táctil en mesa y asistente IA
│   ├── admin.html             # Módulo PGM_ADMIN (Gerencia, Caja y Reportes)
│   ├── cocina.html            # Módulo PGM_COCINA (Kitchen Display System)
│   ├── index.html             # Módulo PGM_MAIN (Enrutador interactivo con fondo naranja/negro)
│   └── tablet.html            # Módulo PGM_CLIENTE (Modo Tablet para comensales)
├── .dockerignore              # Archivos excluidos de la imagen Docker
├── .env.example               # Plantilla de variables de entorno segura
├── .gitignore                 # Reglas de exclusión de Git (protección de credenciales)
├── cloudbuild.yaml            # Manifiesto de automatización CI/CD para Google Cloud Build
├── Dockerfile                 # Definición de contenedor ligero Alpine Linux
├── package.json               # Definición de dependencias y scripts de arranque
├── README.md                  # Descripción general y acceso rápido
└── server.js                  # Servidor central Express, WebSockets y rutas API REST`);

    // SECCIÓN 5
    drawH1(doc, '5. CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)', tracker);
    drawParagraph(doc, 'El sistema utiliza el paquete dotenv para gestionar parámetros sensibles fuera del repositorio público. La plantilla maestra se encuentra en .env.example.');

    drawH2(doc, 'Comandos para crear el archivo de configuración:', tracker);
    drawCodeBlock(doc,
`# En sistemas Windows PowerShell:
Copy-Item .env.example .env

# En Linux / macOS / Bash:
cp .env.example .env`);

    drawH2(doc, 'Estructura Completa de Variables en .env:', tracker);
    drawCodeBlock(doc,
`# ==============================================================================
# CONFIGURACIÓN GENERAL DEL SERVIDOR
# ==============================================================================
PORT=8080
NODE_ENV=production

# ==============================================================================
# DATOS FISCALES DE LA EMPRESA (DGII REPÚBLICA DOMINICANA)
# ==============================================================================
RESTAURANTE_NOMBRE="Restaurante Chivo al Campo SRL"
RESTAURANTE_RNC="132-90740-1"
RESTAURANTE_DIRECCION="Carretera Duarte Km 2, Villa Elisa, Monte Cristi, R.D."
RESTAURANTE_TELEFONO="(809) 555-0199"
RESTAURANTE_EMAIL="contacto@chivoalcampo.com.do"

# Tasas Impositivas Vigentes
ITBIS_PORCENTAJE=0.18
PROPINA_LEGAL_PORCENTAJE=0.10

# ==============================================================================
# API DE FACTURACIÓN ELECTRÓNICA DGII (PLATAFORMA IMECF)
# ==============================================================================
ECF_API_URL="https://ecf-platform-backend-50801509587.us-central1.run.app"

# ==============================================================================
# GOOGLE GEMINI AI (MOTOR DE UPSELLING Y PREDICCIÓN)
# ==============================================================================
GEMINI_API_KEY=""

# ==============================================================================
# PASARELA DIGITAL PAYPAL (CHECKOUT QR)
# ==============================================================================
PAYPAL_CLIENT_ID=""
PAYPAL_CURRENCY="USD"
TASA_CAMBIO_USD_DOP=60.00`);

    drawCallout(doc, 'important', 'Mecanismo de Resiliencia Autónoma', 'Si el entorno no dispone de credenciales activas de Google Gemini o PayPal, el servidor activa automáticamente algoritmos de contingencia local que simulan pagos y ofrecen recomendaciones de upselling basadas en reglas internas, garantizando una demostración académica 100% libre de bloqueos.');

    // SECCIÓN 6
    drawH1(doc, '6. INSTALACIÓN Y EJECUCIÓN EN ENTORNO LOCAL (NODE.JS)', tracker);
    drawParagraph(doc, 'A continuación se describe el procedimiento para ejecutar la aplicación en el entorno de desarrollo del docente o estudiante:');

    drawH2(doc, 'Paso 6.1: Clonar el Repositorio de GitHub', tracker);
    drawCodeBlock(doc,
`git clone https://github.com/uniutesa1-sketch/chivo-al-campo.git
cd chivo-al-campo`);

    drawH2(doc, 'Paso 6.2: Instalar Dependencias de Node.js', tracker);
    drawCodeBlock(doc, `npm install`);
    drawParagraph(doc, 'Se descargarán e instalarán express (v5.3), socket.io (v4.8), cors y dotenv.');

    drawH2(doc, 'Paso 6.3: Iniciar el Servidor', tracker);
    drawCodeBlock(doc, `npm start`);
    drawParagraph(doc, 'El servidor desplegará en la consola el siguiente banner de inicialización:');
    drawCodeBlock(doc,
`==================================================================
  RESTAURANTE CHIVO AL CAMPO SRL - SISTEMA MULTI-MODO INICIADO
  Normativa Fiscal: e-NCF DGII Ley 32-23 (E31 / E32 / E34)
  Servidor escuchando en: http://localhost:8080
==================================================================`);

    drawH2(doc, 'Paso 6.4: URLs de Acceso Local', tracker);
    const urlHeaders = ['Módulo del Sistema', 'Ruta Local', 'Destinatario / Dispositivo'];
    const urlRows = [
      ['Portada Principal (PGM_MAIN)', 'http://localhost:8080', 'Navegador General / Selección de Modo'],
      ['Modo Tablet (PGM_CLIENTE)', 'http://localhost:8080/tablet.html?mesa=4', 'Tablets de Comensales en Salón'],
      ['Monitor KDS (PGM_COCINA)', 'http://localhost:8080/cocina.html', 'Monitor Táctil de Cocina y Despacho'],
      ['Panel Gerencial (PGM_ADMIN)', 'http://localhost:8080/admin.html', 'Gerencia, Caja, Auditoría NCF y Reportes']
    ];
    drawTable(doc, urlHeaders, urlRows, [140, 200, 172]);

    // SECCIÓN 7
    drawH1(doc, '7. CONTENEDORIZACIÓN Y EJECUCIÓN CON DOCKER', tracker);
    drawParagraph(doc, 'El archivo Dockerfile ha sido diseñado siguiendo las mejores prácticas de la industria con Node.js 20 sobre Alpine Linux, logrando un artefacto ligero de menos de 95 MB de consumo:');

    drawH2(doc, 'Paso 7.1: Construir la Imagen Docker', tracker);
    drawCodeBlock(doc, `docker build -t chivo-al-campo:latest .`);

    drawH2(doc, 'Paso 7.2: Ejecutar el Contenedor', tracker);
    drawCodeBlock(doc, `docker run -d -p 8080:8080 --name chivo-app-container chivo-al-campo:latest`);

    drawH2(doc, 'Paso 7.3: Persistencia de Datos con Volúmenes (Opcional)', tracker);
    drawCodeBlock(doc, `docker run -d -p 8080:8080 -v \${PWD}/data:/usr/src/app/data --name chivo-app-container chivo-al-campo:latest`);

    drawH2(doc, 'Comandos de Monitoreo y Limpieza:', tracker);
    drawCodeBlock(doc,
`# Comprobar estado y puerto del contenedor
docker ps

# Ver registros en tiempo real del servidor
docker logs -f chivo-app-container

# Detener y remover el contenedor
docker stop chivo-app-container && docker rm chivo-app-container`);

    // SECCIÓN 8
    drawH1(doc, '8. DESPLIEGUE CONTINUO EN GOOGLE CLOUD (CLOUD BUILD + CLOUD RUN)', tracker);
    drawParagraph(doc, 'El sistema incluye un pipeline automatizado de Integración y Despliegue Continuo (CI/CD) alojado en la infraestructura global de Google Cloud:');

    drawCodeBlock(doc,
`1. Desarrollador ejecuta: git push origin main
2. GitHub notifica a Google Cloud Build mediante Webhook
3. Cloud Build compila la imagen Docker Alpine y la etiqueta en Google Artifact Registry
4. Cloud Build despliega la nueva revisión sin tiempo de inactividad en Google Cloud Run
5. Google Cloud Run expone el microservicio seguro bajo HTTPS con balanceo global.`);

    drawH2(doc, 'Procedimiento de Configuración Inicial en la Consola Web:', tracker);
    drawBullet(doc, '1. Crear Proyecto GCP:', 'Acceder a console.cloud.google.com y crear el proyecto (ej: proyecto-chivo-al-campo).');
    drawBullet(doc, '2. Acceder a Cloud Run:', 'Navegar al menú lateral y seleccionar "Cloud Run" -> "Crear Servicio".');
    drawBullet(doc, '3. Conectar GitHub:', 'Seleccionar "Implementar continuamente nuevas revisiones desde un repositorio" y vincular https://github.com/uniutesa1-sketch/chivo-al-campo.git.');
    drawBullet(doc, '4. Parámetros de Compilación:', 'Indicar Dockerfile o cloudbuild.yaml en la raíz del repositorio.');
    drawBullet(doc, '5. Configuración del Servicio:', 'Asignar región us-central1, Puerto 8080, 512 MB de RAM y marcar "Permitir invocaciones no autenticadas" para acceso público.');
    drawBullet(doc, '6. Despliegue Final:', 'Hacer clic en "Crear". En aproximadamente 90 segundos el servicio estará activo con URL pública HTTPS.');

    drawH2(doc, 'Despliegue Alternativo por Línea de Comandos (gcloud CLI):', tracker);
    drawCodeBlock(doc,
`# Autenticación y selección de proyecto
gcloud auth login
gcloud config set project TU_PROJECT_ID

# Compilación y despliegue en un solo paso
gcloud run deploy chivo-al-campo \\
  --source . \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --port 8080`);

    // SECCIÓN 9
    drawH1(doc, '9. VERIFICACIÓN DE LA INSTALACIÓN Y PRUEBAS DE HUMO', tracker);
    drawParagraph(doc, 'Para validar que la instalación cumple con los estándares requeridos para la evaluación académica, ejecute las siguientes verificaciones:');

    drawH2(doc, '1. Prueba de Disponibilidad Web:', tracker);
    drawBullet(doc, 'Portada Naranja y Negro:', 'Verificar que la portada cargue el diseño rústico de alto contraste con el logo centrado.');
    drawBullet(doc, 'Navegación de Modos:', 'Comprobar que los accesos directos a PGM_CLIENTE, PGM_COCINA y PGM_ADMIN funcionen.');

    drawH2(doc, '2. Prueba del Monitor de Cocina (KDS):', tracker);
    drawBullet(doc, 'Reloj en Vivo:', 'Comprobar que el segundero avance con la hora local de República Dominicana.');
    drawBullet(doc, 'Audio de Comandas:', 'Hacer clic en el icono de campana sonora para activar el contexto de Web Audio API.');
    drawBullet(doc, 'Botón Despachar:', 'Verificar que las comandas se puedan retirar de pantalla en un solo toque.');

    drawH2(doc, '3. Prueba de Autenticación y Reportes en Gerencia:', tracker);
    drawBullet(doc, 'Credenciales SHA-256:', 'Iniciar sesión con admin / admin123.');
    drawBullet(doc, 'Centro de Reportes:', 'Verificar que la pestaña "Consultas y Reportes" liste los 36 reportes con filtros y exportación.');

    drawH2(doc, '4. Prueba de Emisión Fiscal e-NCF DGII:', tracker);
    drawBullet(doc, 'Catálogo de Facturas:', 'Validar las 25 facturas registradas en la pestaña Auditoría Fiscal NCF.');
    drawBullet(doc, 'Timbre QR:', 'Pulsar "Ver Ticket" y confirmar que el código QR fiscal enlace a la verificación tributaria.');

    // SECCIÓN 10
    drawH1(doc, '10. RESOLUCIÓN DE PROBLEMAS FRECUENTES (TROUBLESHOOTING)', tracker);
    const troubleHeaders = ['Síntoma o Error Detectado', 'Causa Raíz', 'Solución Técnica'];
    const troubleRows = [
      [
        'Error: listen EADDRINUSE: :::8080',
        'El puerto 8080 se encuentra ocupado por otra aplicación o instancia zombie.',
        'En Windows PowerShell ejecutar: Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force. O cambiar PORT=3000 en .env.'
      ],
      [
        'Mesas se liberan pero vuelven a mostrarse ocupadas',
        'Órdenes huérfanas en memoria conservaban el estado ocupado.',
        'Ir a /admin.html -> Plano de Mesas y presionar "Liberar Todas las Mesas". El backend depura pedidos pendientes automáticamente.'
      ],
      [
        'Error de permisos en database.json en Linux/Docker',
        'El usuario del contenedor carece de permisos de escritura en la carpeta data/.',
        'Ejecutar en la máquina anfitriona: chmod -R 777 data.'
      ],
      [
        'Error 503 en Google Cloud Run',
        'El contenedor no enlazó al puerto dinámico provisto por la nube.',
        'Asegúrese de no forzar un puerto rígido distinto de 8080 en Cloud Run.'
      ],
      [
        'Sonido de comanda bloqueado en KDS',
        'Políticas de Autoplay de Chrome o Edge bloquean sonido sin interacción previa.',
        'Hacer un primer clic o toque en cualquier zona de la pantalla de cocina para autorizar la Web Audio API.'
      ]
    ];
    drawTable(doc, troubleHeaders, troubleRows, [140, 160, 212]);

    drawParagraph(doc, 'Certificación de Documentación Técnica conforme a las normativas académicas de UTESA.', { bold: true, align: 'center' });
    drawParagraph(doc, 'Jeremi Santos Fabian (1-19-7223) • Prof. Iván Mendoza • Proyecto Integrador 2026', { align: 'center', color: COLORS.muted });

    // RENDERIZAR TABLA DE CONTENIDO DINÁMICA EN LA PÁGINA 2
    renderTOCAtPage(doc, 1, tracker);

    // Aplicar numeración y encabezados a todas las páginas de contenido
    applyHeadersAndFooters(doc, 'Manual de Instalación y Despliegue');

    doc.end();

    writeStream.on('finish', () => {
      console.log('PDF de Instalación generado con éxito en:', pdfPath);
      resolve(pdfPath);
    });

    writeStream.on('error', err => {
      console.error('Error al generar PDF de Instalación:', err);
      reject(err);
    });
  });
}

module.exports = { generateInstalacionPDF };

if (require.main === module) {
  generateInstalacionPDF();
}
