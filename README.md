# 🐐 Restaurante "Chivo al Campo" — Sistema Interactivo Multi-Modo

**Asignatura:** Proyecto Integrador  
**Universidad:** Universidad Tecnológica de Santiago (UTESA) — Recinto Santiago  
**Estudiante:** Jeremi Santos Fabian (Matrícula: 1-19-7223)  
**Profesor:** Iván Mendoza  
**Ubicación de Despliegue Operativo:** Carretera Duarte Km 2, Villa Elisa, Provincia Monte Cristi, República Dominicana  

---

## 📖 Descripción del Sistema

Plataforma Web Cloud (SaaS) diseñada para la transformación operativa y fiscal del restaurante gastronómico dominicano **"Chivo al Campo"**. El ecosistema integra autoservicio en mesa, monitor KDS en cocina y facturación electrónica fiscal certificada bajo la **Ley 32-23 de la República Dominicana (DGII / IMECF)**:

1. **`PGM_MAIN` (Portal y Enrutador Inicial):** Selector central que da acceso a los tres roles del restaurante (`PGM_CLIENTE`, `PGM_COCINA` y `PGM_ADMIN`).
2. **`PGM_CLIENTE` (Modo Tablet en Mesa):**
   - Menú interactivo con fotografías gastronómicas de platos tradicionales linieros.
   - **Motor de Upselling / Venta Cruzada con IA:** Sugerencias inteligentes para incrementar el ticket promedio en mesa.
   - Cálculo en vivo del desglose impositivo: **18% ITBIS + 10% Propina Legal (Ley 18-88)**.
   - Teclado virtual táctil para validación de RNC o Cédula Dominicana.
   - Pasarela digital con **Código QR para PayPal** y pago en efectivo con mesero.
   - Emisión de Factura Fiscal Electrónica con código QR oficial de consulta DGII.
3. **`PGM_COCINA` (Kitchen Display System - KDS):**
   - Monitor táctil en tiempo real para el personal de cocina sincronizado con WebSockets.
   - **Alerta sonora (Web Audio API):** Timbre de campana de dos tonos ante comandas entrantes.
   - Control de avance táctil: *Pendiente* ➔ *En Cocción* (notifica en vivo a la tablet) ➔ *Listo para Servir*.
4. **`PGM_ADMIN` (Gerencia, Caja, Auditoría NCF e Inventario):**
   - Dashboard de ventas diarias y reporte 607.
   - **Facturación Electrónica e-CF (Ley 32-23):**
     - **E31:** Factura de Crédito Fiscal Electrónica.
     - **E32:** Factura de Consumo Electrónica.
     - **E34:** Nota de Crédito Electrónica para anulación fiscal con reintegro automático de insumos al almacén.
   - **Purga y Reinicio Fiscal:** Botón seguro con PIN para demostraciones académicas limpias sin saltos de secuencia.
   - **Kardex de Inventario Predictivo con IA:** Diagnóstico en lenguaje natural sobre la demanda de carne e insumos para el fin de semana.

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js 20 LTS, Express, Socket.IO (WebSockets), CORS, Dotenv.
- **Frontend:** HTML5 semántico, CSS3 moderno (Glassmorphism, Variables CSS, Responsive Design), Vanilla JavaScript modular.
- **Audio:** Web Audio API nativo sintetizado.
- **Facturación Electrónica:** Plataforma IMECF / DGII con timbrado XML, firma digital y generación de código QR tributario.
- **Contenedores:** Dockerfile multi-arquitectura optimizado (`node:20-alpine`).
- **CI/CD & Cloud:** Google Cloud Build + Google Cloud Run (HTTPS con certificado SSL gestionado por Google).

---

## 🐳 Despliegue con Docker (Local)

Para construir y ejecutar el contenedor en cualquier máquina con Docker:

```bash
# 1. Construir la imagen Docker
docker build -t chivo-al-campo .

# 2. Ejecutar el contenedor mapeando el puerto
docker run -d -p 8080:8080 --name chivo-app chivo-al-campo

# 3. Abrir en el navegador
# http://localhost:8080
```

---

## ☁️ Despliegue en Google Cloud (Cloud Build + Cloud Run HTTPS)

Este proyecto está 100% preparado para desplegarse en **Google Cloud Run** con **Cloud Build**:

### Opción A: Despliegue Directo vía Google Cloud CLI
```bash
# Autenticarse en Google Cloud
gcloud auth login
gcloud config set project TU_PROJECT_ID

# Desplegar directamente desde el código fuente usando Cloud Build
gcloud run deploy chivo-al-campo \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Opción B: Integración Continua (CI/CD con GitHub)
1. Sube este repositorio a **GitHub**.
2. En la consola de **Google Cloud Run**, haz clic en **"Crear Servicio"** ➔ **"Implementar continuamente nuevas revisiones desde un repositorio de código fuente"**.
3. Selecciona tu repositorio de GitHub.
4. Cloud Build detectará automáticamente el archivo `Dockerfile` o `cloudbuild.yaml` incluido en el proyecto, compilará el contenedor en la nube y publicará la URL oficial con **HTTPS** (ej: `https://chivo-al-campo-xxxx-uc.a.run.app`).

---

## 🚀 Ejecución en Desarrollo Local (Sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor
npm start
```

Acceso a los módulos en local:
- **Portal Principal:** `http://localhost:8080/`
- **Tablet Comensal:** `http://localhost:8080/tablet.html?mesa=4`
- **Monitor de Cocina KDS:** `http://localhost:8080/cocina.html`
- **Panel Administrativo & Auditoría NCF:** `http://localhost:8080/admin.html`

---

## 📚 Documentación y Manuales Oficiales (UTESA)

El proyecto cuenta con manuales completos en formato Markdown y HTML con diseño institucional para la evaluación docente:

1. **[Manual de Instalación y Despliegue en la Nube](docs/MANUAL_DE_INSTALACION.md):**
   - Requisitos de hardware y software.
   - Configuración de variables de entorno `.env`.
   - Instalación local con Node.js 20 LTS.
   - Contenedorización con Dockerfile Alpine Linux.
   - Despliegue continuo en **Google Cloud Build** y **Google Cloud Run (HTTPS)**.
   - Verificación de instalación y troubleshooting.

2. **[Manual de Usuario y Guía de Operación](docs/MANUAL_DE_USUARIO.md):**
   - Operación del Modo Tablet en Mesa (`PGM_CLIENTE`) y sugerencias con IA Google Gemini.
   - Operación del Monitor de Cocina KDS (`PGM_COCINA`) con alertas sonoras y botón Despachar.
   - Panel de Gerencia (`PGM_ADMIN`), Caja, Delivery ("Mesa 99") y Plano de Mesas en vivo.
   - Auditoría Fiscal DGII Ley 32-23 (Comprobantes E31, E32 y Notas de Crédito E34).
   - Catálogo Maestro de las **36 Consultas y Reportes** con exportación a Excel e impresión en PDF.
   - Inventario, Kardex, Suplidores de Monte Cristi y Personal.
