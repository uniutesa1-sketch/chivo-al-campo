# 🛠️ MANUAL DE INSTALACIÓN Y DESPLIEGUE EN LA NUBE

**Proyecto:** Sistema Interactivo Multi-Modo de Autoservicio, Monitor KDS y Facturación Fiscal DGII  
**Entidad / Empresa:** Restaurante "Chivo al Campo SRL" (Villa Elisa, Monte Cristi, R.D.)  
**Institución Educativa:** Universidad Tecnológica de Santiago (UTESA) — Recinto Santiago  
**Carrera:** Ingeniería en Sistemas Computacionales  
**Asignatura:** Proyecto Integrador  
**Docente Facilitador:** Prof. Iván Mendoza  
**Estudiante / Autor:** Jeremi Santos Fabian (Matrícula: 1-19-7223)  
**Fecha de Publicación:** Noviembre 2026  
**Versión del Sistema:** 2.4.0 (Cloud Native / Docker / Serverless)  

---

## 📋 TABLA DE CONTENIDO

1. [Introducción y Objetivos del Manual](#1-introducción-y-objetivos-del-manual)
2. [Arquitectura del Sistema y Stack Tecnológico](#2-arquitectura-del-sistema-y-stack-tecnológico)
3. [Requisitos Previos del Entorno](#3-requisitos-previos-del-entorno)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Configuración de Variables de Entorno (.env)](#5-configuración-de-variables-de-entorno-env)
6. [Instalación y Ejecución en Entorno Local (Node.js)](#6-instalación-y-ejecución-en-entorno-local-nodejs)
7. [Contenedorización y Ejecución con Docker](#7-contenedorización-y-ejecución-con-docker)
8. [Despliegue Continuo en Google Cloud (Cloud Build + Cloud Run HTTPS)](#8-despliegue-continuo-en-google-cloud-cloud-build--cloud-run-https)
9. [Verificación de la Instalación y Pruebas de Humo](#9-verificación-de-la-instalación-y-pruebas-de-humo)
10. [Resolución de Problemas Frecuentes (Troubleshooting)](#10-resolución-de-problemas-frecuentes-troubleshooting)

---

## 1. INTRODUCCIÓN Y OBJETIVOS DEL MANUAL

Este documento técnico constituye la **Guía Oficial de Instalación, Configuración y Despliegue** para el ecosistema tecnológico del restaurante gastronómico **"Chivo al Campo"**.

El propósito fundamental de este manual es suministrar al docente evaluador y al equipo de infraestructura técnica todas las directrices, comandos y especificaciones requeridas para poner en marcha el sistema en tres modalidades distintas:
- **Modo Desarrollo Local:** Ejecución directa sobre el motor Node.js.
- **Modo Contenedorizado:** Despliegue en contenedor Docker multiplataforma.
- **Modo Producción en la Nube:** Despliegue automático de alta disponibilidad en **Google Cloud Run** con integración continua mediante **Google Cloud Build** y certificado digital **HTTPS** administrado por Google.

---

## 2. ARQUITECTURA DEL SISTEMA Y STACK TECNOLÓGICO

El sistema está construido bajo el paradigma de arquitectura **Single-Instance Serverless Web Application** con comunicación bidireccional reactiva impulsada por WebSockets.

```
       [ CLIENTES Y SALÓN ]              [ COCINA KDS ]             [ GERENCIA Y CAJA ]
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
      └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### Componentes de Software:
- **Entorno de Ejecución:** Node.js versión 20.x LTS o superior.
- **Servidor Web y API:** Express.js 5.3 con middleware de compresión y seguridad CORS.
- **Protocolo en Tiempo Real:** Socket.IO v4.8 (sincronización instantánea mesa-cocina-caja).
- **Criptografía y Seguridad:** Algoritmo SHA-256 (`crypto`) para almacenamiento de credenciales administrativas.
- **Facturación Fiscal Electrónica:** Plataforma API e-CF certificada bajo la **Ley 32-23 de la República Dominicana**.
- **Pasarela de Pago Digital:** PayPal REST SDK & Checkout QR dinámico.
- **Inteligencia Artificial:** Google Gemini Flash API (`generativelanguage.googleapis.com`).
- **Contenedores:** Dockerfile optimizado con base Alpine Linux (`node:20-alpine`).
- **Nube:** Google Cloud Build (CI/CD) + Google Cloud Run (Hosting Serverless HTTPS).

---

## 3. REQUISITOS PREVIOS DEL ENTORNO

Antes de iniciar la instalación, asegúrese de disponer de las siguientes herramientas en el equipo anfitrión:

### Requisitos Mínimos de Hardware:
- **Procesador:** CPU Dual-Core a 1.8 GHz o superior (Intel Core i3 / AMD Ryzen 3 o superior).
- **Memoria RAM:** Mínimo 2 GB de RAM (Recomendado 4 GB o más).
- **Almacenamiento Libre:** Mínimo 500 MB de espacio en disco disponible.
- **Conectividad:** Conexión a Internet para descarga de paquetes npm y comunicación con la API fiscal de DGII.

### Requisitos de Software:
| Herramienta | Versión Requerida | Propósito | Comando de Verificación |
|---|---|---|---|
| **Git** | 2.30+ | Clonado y control de versiones del repositorio | `git --version` |
| **Node.js** | 20.x LTS | Motor de ejecución JavaScript del servidor | `node -v` |
| **npm** | 10.x+ | Gestor de paquetes y dependencias | `npm -v` |
| **Docker** *(Opcional)* | 24.0+ | Creación y ejecución de contenedores locales | `docker --version` |
| **Google Cloud CLI** *(Opcional)* | 450.0+ | Despliegue en Cloud Run por consola | `gcloud version` |

---

## 4. ESTRUCTURA DEL PROYECTO

El código fuente del proyecto se organiza de la siguiente manera:

```
chivo-al-campo/
├── data/
│   └── database.json          # Almacén persistente (Mesas, Platos, Facturas, e-NCF, Empleados)
├── docs/
│   ├── MANUAL_DE_INSTALACION.md # Guía técnica de instalación y despliegue (Este documento)
│   └── MANUAL_DE_USUARIO.md     # Manual de uso y operación por módulos
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
└── server.js                  # Servidor central Express, WebSockets y rutas API REST
```

---

## 5. CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)

El sistema utiliza la librería `dotenv` para cargar variables seguras. En la raíz del proyecto se incluye una plantilla denominada `.env.example`.

### Pasos para configurar el archivo de entorno:
1. Copie el archivo `.env.example` y renómbrelo como `.env`:
   ```bash
   # En Windows PowerShell:
   Copy-Item .env.example .env

   # En Linux / macOS / Bash:
   cp .env.example .env
   ```

2. Abra el archivo `.env` con su editor de preferencia y configure los valores:

```ini
# ==============================================================================
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
TASA_CAMBIO_USD_DOP=60.00
```

> [!IMPORTANT]
> El sistema cuenta con mecanismos de contingencia local autónoma. Si no se configuran las llaves de PayPal o Gemini, el sistema continuará funcionando al 100% utilizando respuestas inteligentes locales y simulación de transacciones fiscales.

---

## 6. INSTALACIÓN Y EJECUCIÓN EN ENTORNO LOCAL (NODE.JS)

Siga estos pasos para clonar y ejecutar el restaurante en su máquina local:

### Paso 6.1: Clonar el Repositorio de GitHub
Abra una terminal (PowerShell o Bash) y clone el repositorio oficial:
```bash
git clone https://github.com/uniutesa1-sketch/chivo-al-campo.git
cd chivo-al-campo
```

### Paso 6.2: Instalar Dependencias de Node.js
Ejecute el comando de instalación de paquetes:
```bash
npm install
```
Este comando instalará las dependencias requeridas:
- `express`: Framework backend.
- `socket.io`: Motor de WebSockets en tiempo real.
- `cors`: Habilitador de intercambio de recursos de origen cruzado.
- `dotenv`: Administrador de variables de entorno.

### Paso 6.3: Iniciar el Servidor (Consola o Script .BAT)

El sistema ofrece dos alternativas de arranque:

#### Opción A: Ejecución con Doble Clic (`iniciar_sistema.bat` - Recomendado en Windows)
En la raíz del proyecto se incluye el script ejecutable `iniciar_sistema.bat`. Una vez instaladas las dependencias (`npm install`), simplemente haga **doble clic sobre `iniciar_sistema.bat`**:
- El script levantará de inmediato el servidor Node.js.
- Abrirá automáticamente su navegador web en el portal de autoservicio del restaurante sin necesidad de escribir comandos adicionales.

#### Opción B: Arranque por Consola de Comandos
Inicie la aplicación con el comando estándar:
```bash
npm start
```

Verá en consola un mensaje similar al siguiente:
```
==================================================================
  RESTAURANTE CHIVO AL CAMPO SRL - SISTEMA MULTI-MODO INICIADO
  Normativa Fiscal: e-NCF DGII Ley 32-23 (E31 / E32 / E34)
  Servidor escuchando en: http://localhost:8080
==================================================================
```

### Paso 6.4: Acceder a la Aplicación
Abra su navegador web e ingrese a las siguientes rutas:
- **Portal Principal / Portada:** [http://localhost:8080](http://localhost:8080)
- **Modo Tablet Comensal:** [http://localhost:8080/tablet.html?mesa=4](http://localhost:8080/tablet.html?mesa=4)
- **Monitor de Cocina KDS:** [http://localhost:8080/cocina.html](http://localhost:8080/cocina.html)
- **Panel de Gerencia y Caja:** [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 7. CONTENEDORIZACIÓN Y EJECUCIÓN CON DOCKER

El proyecto incluye un `Dockerfile` optimizado con Node.js 20 sobre Alpine Linux, diseñado para un consumo inferior a 90 MB de memoria RAM.

### Paso 7.1: Construir la Imagen Docker
Desde la raíz del proyecto, ejecute:
```bash
docker build -t chivo-al-campo:latest .
```

### Paso 7.2: Ejecutar el Contenedor
Ejecute el contenedor mapeando el puerto 8080 del host con el del contenedor:
```bash
docker run -d -p 8080:8080 --name chivo-app-container chivo-al-campo:latest
```

### Paso 7.3: Persistencia de Datos (Opcional)
Para persistir los cambios de facturas e inventario fuera del contenedor, monte la carpeta `data/`:
```bash
docker run -d -p 8080:8080 -v ${PWD}/data:/usr/src/app/data --name chivo-app-container chivo-al-campo:latest
```

### Comandos de Utilidad Docker:
```bash
# Ver estado del contenedor
docker ps

# Ver logs en vivo del servidor
docker logs -f chivo-app-container

# Detener y eliminar el contenedor
docker stop chivo-app-container
docker rm chivo-app-container
```

---

## 8. DESPLIEGUE CONTINUO EN GOOGLE CLOUD (CLOUD BUILD + CLOUD RUN HTTPS)

El proyecto cuenta con integración continua (CI/CD) completamente configurada para **Google Cloud Run** a través de **Google Cloud Build** y **GitHub**.

### Arquitectura de Despliegue en la Nube:
1. El desarrollador ejecuta `git push origin main`.
2. GitHub notifica a Google Cloud Build mediante un Webhook.
3. Cloud Build ejecuta las directrices de `cloudbuild.yaml`:
   - Descarga el código y compila la imagen Docker ligera.
   - Sube la imagen a Google Container Registry (`gcr.io/$PROJECT_ID/chivo-al-campo`).
   - Despliega automáticamente la nueva revisión en Google Cloud Run.
4. Cloud Run aprovisiona el contenedor serverless, le asigna un certificado SSL gestionado y expone la URL oficial con **HTTPS**.

### Procedimiento de Configuración Inicial en Google Cloud:

#### Método 1: A través de la Consola Web de Google Cloud (Recomendado)
1. Ingrese a la consola de [Google Cloud Platform](https://console.cloud.google.com/).
2. Cree o seleccione un proyecto (ej: `proyecto-chivo-al-campo`).
3. Vaya a **Cloud Run** ➔ Haga clic en **"Crear Servicio"**.
4. Seleccione **"Implementar continuamente nuevas revisiones desde un repositorio de código fuente"**.
5. Conecte su cuenta de GitHub y seleccione el repositorio:
   `https://github.com/uniutesa1-sketch/chivo-al-campo.git`
6. En tipo de compilación, seleccione **Dockerfile** o **cloudbuild.yaml**.
7. En configuración del servicio:
   - **Región:** `us-central1 (Iowa)` o la más cercana.
   - **Autenticación:** Marcar *"Permitir invocaciones no autenticadas"* (Acceso público web).
   - **Puerto:** `8080`.
   - **Asignación de Memoria:** 512 MB (suficiente para serverless de alto rendimiento).
8. Haga clic en **"Crear"**. En menos de 2 minutos, Google Cloud emitirá la URL HTTPS pública del restaurante.

#### Método 2: Despliegue Directo por Google Cloud SDK (CLI)
Si dispone de `gcloud` instalado y autenticado en su terminal:
```bash
# 1. Autenticar en GCP
gcloud auth login

# 2. Establecer el proyecto activo
gcloud config set project TU_PROJECT_ID

# 3. Compilar y desplegar con un solo comando
gcloud run deploy chivo-al-campo \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

---

## 9. VERIFICACIÓN DE LA INSTALACIÓN Y PRUEBAS DE HUMO

Para certificar que el despliegue se ha completado satisfactoriamente, realice las siguientes pruebas de verificación:

### 1. Prueba de Disponibilidad Web:
Acceda desde el navegador a la URL del servicio (local o Cloud Run):
- [ ] La portada principal carga con su tema **Naranja y Negro Carbón**.
- [ ] El logotipo de "Chivo al Campo" se muestra centrado y con dimensiones equilibradas.
- [ ] Los 3 botones de acceso (`PGM_CLIENTE`, `PGM_COCINA`, `PGM_ADMIN`) responden correctamente.

### 2. Prueba del Monitor de Cocina (KDS):
Abra `/cocina.html`:
- [ ] El reloj digital en la esquina superior derecha se actualiza cada segundo.
- [ ] El icono de sonido emite el tono de prueba al hacer clic sobre la campana.
- [ ] Si existen comandas activas, se visualiza el botón verde **"DESPACHAR"** para liberar la orden de inmediato.

### 3. Prueba de Autenticación en Gerencia:
Abra `/admin.html`:
- [ ] Ingrese con el usuario `admin` y contraseña `admin123`.
- [ ] El sistema valida el hash SHA-256 y concede acceso al Dashboard gerencial.
- [ ] En la barra superior, la pestaña **"Consultas y Reportes"** abre el centro con los **36 reportes** del sistema.

### 4. Prueba de Emisión Fiscal e-NCF:
Desde `/admin.html` ➔ pestaña **"Auditoría Fiscal NCF"**:
- [ ] Se listan las 25 facturas registradas en el sistema.
- [ ] Al pulsar **"Ver Ticket"**, se genera el comprobante oficial con código QR fiscal verificable ante la DGII.

---

## 10. RESOLUCIÓN DE PROBLEMAS FRECUENTES (TROUBLESHOOTING)

| Síntoma / Error | Causa Probable | Solución Recomendada |
|---|---|---|
| **`Error: listen EADDRINUSE: address already in use :::8080`** | El puerto 8080 está siendo utilizado por otra aplicación o una instancia previa. | En Windows ejecute: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force`. O cambie `PORT=3000` en el archivo `.env`. |
| **Las mesas se liberan pero vuelven a mostrarse ocupadas** | Comandas antiguas con `pagado: false` retenían la mesa en memoria. | Vaya a `/admin.html` ➔ Plano de Mesas ➔ Haga clic en el botón rojo **"Liberar Todas las Mesas"**. El backend limpiará automáticamente los pedidos huérfanos. |
| **`Permission denied: database.json` en Docker o Linux** | El contenedor no tiene permisos de escritura en la carpeta `data/`. | Ejecute en el anfitrión: `chmod -R 777 data` para garantizar lectura y escritura. |
| **Cloud Run devuelve error 503 o no inicia** | La variable `PORT` fue forzada a un valor distinto de 8080 en Cloud Run. | Asegúrese de que en Cloud Run el contenedor use la variable `PORT=8080` inyectada automáticamente por Google Cloud. |
| **El sonido de alerta en KDS no suena al primer clic** | Las políticas de Autoplay de los navegadores (Chrome / Edge) bloquean audio sin interacción previa. | Haga un primer clic en cualquier parte de la pantalla de cocina para activar el contexto de Web Audio API. |

---

*Manual elaborado y certificado conforme a los requerimientos de la asignatura Proyecto Integrador de UTESA.*  
**Autor:** Jeremi Santos Fabian (Matrícula: 1-19-7223) • **Profesor:** Iván Mendoza.
