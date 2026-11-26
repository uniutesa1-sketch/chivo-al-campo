# 📖 MANUAL DE USUARIO Y GUÍA DE OPERACIÓN DEL SISTEMA

**Proyecto:** Sistema Interactivo Multi-Modo de Autoservicio, Monitor KDS y Facturación Fiscal DGII  
**Restaurante:** "Chivo al Campo SRL" (Carretera Duarte Km 2, Villa Elisa, Monte Cristi, R.D.)  
**Institución Educativa:** Universidad Tecnológica de Santiago (UTESA) — Recinto Santiago  
**Carrera:** Ingeniería en Sistemas Computacionales  
**Asignatura:** Proyecto Integrador  
**Docente Facilitador:** Prof. Iván Mendoza  
**Estudiante / Autor:** Jeremi Santos Fabian (Matrícula: 1-19-7223)  
**Fecha de Edición:** Noviembre 2026  
**Versión de la Plataforma:** 2.4.0 (Cloud Native / Multi-Rol)  

---

## 📑 ÍNDICE GENERAL

1. [Visión General del Sistema y Roles Operativos](#1-visión-general-del-sistema-y-roles-operativos)
2. [Portal Central de Navegación (PGM_MAIN)](#2-portal-central-de-navegación-pgm_main)
3. [Módulo Comensal: Tablet en Mesa (PGM_CLIENTE)](#3-módulo-comensal-tablet-en-mesa-pgm_cliente)
   - 3.1 Protector de pantalla interactivo
   - 3.2 Exploración del menú gastronómico liniero
   - 3.3 Sugerencias inteligentes con Inteligencia Artificial (Upselling)
   - 3.4 Llamar al mesero desde la mesa
   - 3.5 Solicitud de Comprobante Fiscal (Consumo E32 vs Crédito Fiscal E31)
   - 3.6 Pasarela digital con Código QR PayPal y pago en efectivo
   - 3.7 Visualización y consulta de timbre fiscal QR de la DGII
4. [Módulo de Cocina: Monitor Táctil KDS (PGM_COCINA)](#4-módulo-de-cocina-monitor-táctil-kds-pgm_cocina)
   - 4.1 Pantalla de alta visibilidad y reloj en tiempo real
   - 4.2 Alertas sonoras audibles ante nuevas comandas
   - 4.3 Ciclo de preparación y botón directo "DESPACHAR"
   - 4.4 Diferenciación de comandas de Salón vs Delivery
5. [Módulo Administrativo y Gerencial (PGM_ADMIN)](#5-módulo-administrativo-y-gerencial-pgm_admin)
   - 5.1 Autenticación de usuarios y roles del personal
   - 5.2 Dashboard de Indicadores Clave (KPIs) en vivo
   - 5.3 Plano de Mesas y Salón en vivo (Supervisión y Liberación de Mesas)
   - 5.4 Caja y Gestión de Delivery Telefónico (Mesa Virtual 99)
   - 5.5 Auditoría Fiscal e-NCF DGII (Ley 32-23) y Anulaciones con Nota de Crédito E34
   - 5.6 Centro Maestro de Consultas y Reportes (Catálogo Oficial de 36 Reportes)
   - 5.7 Almacén, Insumos y Kardex con Alertas de Punto de Reorden
   - 5.8 Directorio de Proveedores Locales de Monte Cristi
   - 5.9 Gestión de Personal y Turnos
   - 5.10 Diagnóstico Predictivo Asistido por Google Gemini IA
   - 5.11 Módulo de Suscripción SaaS y Licenciamiento
6. [Preguntas Frecuentes y Solución Rápida de Dudas](#6-preguntas-frecuentes-y-solución-rápida-de-dudas)

---

## 1. VISIÓN GENERAL DEL SISTEMA Y ROLES OPERATIVOS

El sistema del restaurante **"Chivo al Campo"** es una solución integral Cloud SaaS diseñada específicamente para modernizar y certificar las operaciones de un restaurante gastronómico dominicano. Su diseño responde tanto a las exigencias operativas diarias como a la estricta normativa tributaria de la **Dirección General de Impuestos Internos (DGII)** bajo la **Ley 32-23 de Facturación Electrónica**.

### Roles del Ecosistema:
```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           SISTEMA CHIVO AL CAMPO                       │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
   PGM_CLIENTE                   PGM_COCINA                   PGM_ADMIN
 (Tablet en Mesa)            (Monitor KDS Cocina)        (Gerencia, Caja y NCF)
  - Pedidos interactivos      - Comandas en tiempo real   - Facturación Fiscal DGII
  - Sugerencias con IA        - Alertas sonoras audibles  - Cuadre de Caja (Reporte Z)
  - Llamada de mesero         - Tiempos de cocción        - 36 Reportes Gerenciales
  - Pago PayPal QR / Efectivo - Botón directo Despachar   - Almacén, Kardex e IA
```

---

## 2. PORTAL CENTRAL DE NAVEGACIÓN (PGM_MAIN)

Al acceder a la dirección raíz de la plataforma ([http://localhost:8080](http://localhost:8080) o la URL oficial en Cloud Run con HTTPS), el usuario es recibido por el **Portal Central de Enrutamiento**:

```
+-------------------------------------------------------------------------+
|                  RESTAURANTE "CHIVO AL CAMPO"                           |
|       UTESA • PROYECTO INTEGRADOR • PROF. IVÁN MENDOZA                  |
|     Diseñado y Desarrollado por: Jeremi Santos Fabian (1-197223)        |
+-------------------------------------------------------------------------+
|   [ TABLET EN MESA ]     |    [ MONITOR COCINA ]    |   [ GERENCIA ]    |
|   Seleccione Mesa [04]   |    Display táctil KDS    |   Caja, NCF y     |
|   [ Iniciar Modo Tablet] |    [ Abrir Monitor KDS ] |   36 Reportes     |
+-------------------------------------------------------------------------+
```

### Elementos de la Portada:
- **Tema Visual Naranja y Negro Carbón:** Acabado de alto contraste con estética gastronómica rústica inspirada en la preparación del chivo liniero al caldero.
- **Logotipo Centrado:** Emblema oficial enmarcado con borde naranja brillante y destello ámbar.
- **Selector de Mesas del Salón:** Menú desplegable que permite abrir la tablet asignada a la Mesa 01 (Terraza), Mesa 02 (Salón), Mesa 03 (Jardín), Mesa 04 (VIP Principal) o Mesa 05 (Familiar).
- **Tarjetas de Acceso Rápido:** Tres tarjetas con accesos independientes a los módulos de cliente, cocina y administración.

---

## 3. MÓDULO COMENSAL: TABLET EN MESA (PGM_CLIENTE)

**Ruta de acceso:** `/tablet.html?mesa=4` (o seleccionando la mesa desde la portada).

Este módulo está optimizado para dispositivos táctiles (tablets Android, iPad o pantallas táctiles en mesa). Garantiza una experiencia de autoservicio fluida y moderna.

### 3.1 Protector de Pantalla Interactivo (Screen Saver)
Cuando la mesa se encuentra desocupada o en reposo, la tablet proyecta un protector de pantalla con fotografías en alta definición de las especialidades de la casa (Chivo Liniero al Caldero, Chivo Guisado, Tostones y Moro con Coco).  
- Para desbloquear: el cliente simplemente toca la pantalla en cualquier lugar para comenzar a ordenar.

### 3.2 Exploración del Menú Gastronómico Liniero
El catálogo presenta los platos clasificados en cuatro categorías accesibles mediante pestañas superiores:
1. **Carnes de Chivo:** Especialidades insignias como el *Servicio de Chivo Liniero* y el *Chivo Asado Familiar*.
2. **Guarniciones Criollas:** Acompañamientos tradicionales (*Tostones Crujientes Criollos*, *Moro de Guandules con Coco*, *Arroz Blanco y Habichuelas*).
3. **Bebidas:** *Jugo Natural de Chinola*, *Cerveza Presidente Vestida de Novia*, *Refrescos*.
4. **Postres Típicos:** *Majarete Tradicional con Canela*, *Dulce de Leche Cortada*.

Cada plato incluye su fotografía real, descripción de preparación, precio unitario con desglose impositivo y botones `+` y `-` para agregar raciones al carrito.

### 3.3 Sugerencias Inteligentes con Inteligencia Artificial (Upselling)
Al confirmar una orden principal, el motor de Inteligencia Artificial (impulsado por **Google Gemini AI**) analiza los platos seleccionados y sugiere educadamente en pantalla un acompañamiento o bebida complementaria para elevar la experiencia culinaria (ejemplo: *"Para acompañar su Chivo al Caldero, le sugerimos unos crujientes Tostones Linieros recién hechos"*). El comensal puede aceptar la sugerencia con un solo toque o declinarla sin compromiso.

### 3.4 Llamada de Asistencia al Mesero
En la esquina inferior de la tablet, el comensal dispone del botón **"Llamar al Mesero"**:
- Al presionarlo, el botón emite una confirmación visual.
- El servidor activa una alerta sonora en el Panel de Gerencia y marca la mesa en color rojo parpadeante con el estado **"LLAMANDO MESERO"** hasta que el mozo acude y confirma la atención.

### 3.5 Solicitud de Comprobante Fiscal (DGII Ley 32-23)
Al solicitar la cuenta, la tablet permite elegir el tipo de comprobante requerido:
- **Comprobante de Consumo Electrónico (e-CF Serie E32):** Para comensales individuales o familias. Se genera sin necesidad de RNC.
- **Factura de Crédito Fiscal Electrónica (e-CF Serie E31):** Para empresas y deducibilidad de impuestos. La tablet despliega un teclado numérico táctil en pantalla para ingresar el **RNC o Cédula** del cliente. El sistema valida el dígito verificador y asocia la razón social automáticamente.

### 3.6 Pasarela Digital con Código QR PayPal y Pago en Efectivo
El cliente elige su método de pago preferido:
- **Efectivo con el Mesero:** Notifica al personal para acudir con el cambio correspondiente.
- **Pasarela Digital PayPal QR:** La tablet genera un **Código QR interactivo** con el monto exacto convertido a dólares al tipo de cambio oficial. El comensal escanea el QR con su teléfono y liquida la cuenta en segundos.

### 3.7 Visualización del Ticket Fiscal con Código QR Oficial DGII
Tras procesarse el pago, la tablet despliega el comprobante fiscal electrónico con el timbre oficial de la DGII, que incluye:
- RNC Emisor: `132-90740-1` (Restaurante Chivo al Campo SRL).
- Número de Comprobante Fiscal Electrónico (e-NCF E31 o E32).
- Desglose del Subtotal Neto, ITBIS (18%) y Propina Legal de Ley 18-88 (10%).
- **Código QR Fiscal Oficial:** Escaneable con la cámara de cualquier teléfono para consultar el estatus del timbre electrónico en el portal oficial de la DGII.

---

## 4. MÓDULO DE COCINA: MONITOR TÁCTIL KDS (PGM_COCINA)

**Ruta de acceso:** `/cocina.html`

El **Kitchen Display System (KDS)** sustituye las antiguas comandas de papel por una pantalla táctil de alto contraste diseñada para la brigada de cocina y el Chef Ejecutivo.

```
+-------------------------------------------------------------------------+
| MONITOR DE COCINA - CHIVO AL CAMPO              🔔  🔊  12:45 PM        |
+-------------------------------------------------------------------------+
| [ COMANDA: MESA 04 ]             | [ COMANDA: DELIVERY 99 ]             |
| Hora: 12:40 PM • Hace: 5 MINS    | Hora: 12:42 PM • Hace: 3 MINS        |
|----------------------------------|--------------------------------------|
| • 2x Servicio Chivo Liniero      | • 1x Chivo Asado Familiar            |
| • 2x Tostones Crujientes         | • 1x Moro de Guandules con Coco      |
| • 1x Jugo Natural de Chinola     | • 2x Cerveza Presidente              |
|----------------------------------|--------------------------------------|
| [ EN PREPARACIÓN ] [ DESPACHAR ] | [ LISTO / ENTREGAR ] [ DESPACHAR ]   |
+-------------------------------------------------------------------------+
```

### 4.1 Pantalla de Alta Visibilidad y Reloj en Tiempo Real
- Fondo oscuro antirreflejo para visualización clara entre vapores y calor de cocina.
- Reloj digital sincronizado con la hora de República Dominicana (`es-DO`).
- Cada comanda calcula en vivo los minutos transcurridos desde que el cliente la envió desde su tablet.

### 4.2 Alertas Sonoras Audibles
El monitor integra el motor sintetizado **Web Audio API**: ante la llegada de cualquier comanda nueva desde el salón o por teléfono, el monitor emite un repique audible de dos tonos que alerta al personal de cocina inmediatamente.

### 4.3 Ciclo de Cocción y Despacho en un Solo Toque
Cada tarjeta de comanda dispone de dos botones de acción:
1. **Botón de Estado Culinario:**
   - **`EN PREPARACIÓN` (Fuego naranja):** Al presionarlo, actualiza el estado e informa en vivo a la tablet del comensal que su comida se está cocinando.
   - **`LISTO / ENTREGAR` (Campana dorada):** Al terminar la cocción, cambia el estado para avisar al mesero que los platos están listos para servirse en mesa.
2. **Botón Directo `DESPACHAR` (Verde Esmeralda):**
   - Permite al chef o al despachador con **un solo toque** dar por completada y retirada la comanda del monitor KDS, liberando la pantalla sin trabas ni pasos intermedios.

### 4.4 Diferenciación de Salón vs Delivery
Las órdenes para llevar o tomadas vía telefónica se identifican claramente con la cabecera **"DELIVERY (MESA 99)"**, permitiendo empaquetar para motoristas con cubiertos desechables y salsas separadas.

---

## 5. MÓDULO ADMINISTRATIVO Y GERENCIAL (PGM_ADMIN)

**Ruta de acceso:** `/admin.html`

Constituye el centro de mando del restaurante para Gerencia General, Caja, Auditoría NCF, Almacén y Finanzas.

### 5.1 Autenticación de Usuarios y Roles
El acceso está protegido mediante control de credenciales cifradas con hash SHA-256:

| Usuario | Contraseña por Defecto | Rol en el Sistema | Permisos |
|---|---|---|---|
| **`admin`** | `admin123` | Gerente General | Acceso total: Finanzas, Reportes, NCF, Purga, Personal, IA |
| **`caja`** | `admin123` | Cajera Principal | Facturación, Cuadre de Caja, Delivery y Liberación de Mesas |
| **`chef`** | `admin123` | Chef Ejecutivo | Monitoreo de comandas, Almacén de Carnes y Mermas |

### 5.2 Dashboard de Indicadores Clave (KPIs) en Vivo
En la primera pestaña se presentan las métricas financieras acumuladas:
- **Ventas Totales:** Ingresos brutos facturados del día y del período.
- **ITBIS Recaudado (18%):** Impuesto retenido listo para declaración jurada DGII.
- **Propina Legal (10%):** Fondo acumulado de ley para distribución equitativa de mozos.
- **Total de Facturas:** Volumen de comprobantes emitidos.
- **Ticket Promedio:** Gasto medio por factura emitida en el restaurante.

### 5.3 Plano de Mesas y Salón en Vivo
Supervisa el estado de todas las mesas del restaurante:
- **Verde (DISPONIBLE):** Mesa limpia y lista para comensales. Incluye acceso rápido para abrir su tablet.
- **Ámbar (OCUPADA):** Mesa con clientes en consumo. Muestra comanda activa y total acumulado.
- **Rojo Parpadeante (LLAMANDO MESERO):** Requiere atención urgente de un mozo. Botón directo *"Atender Mesero"*.

#### Liberación de Mesas (Sin Reocupación Automática):
- **Liberar Mesa Individual:** Botón *"Liberar"* en la tarjeta de la mesa. Cierra cualquier pedido no pagado, limpia llamadas de mesero y deja la mesa en verde permanente.
- **Liberar Todas las Mesas:** Botón superior rojo *"Liberar Todas las Mesas"*. Con un solo clic limpia todo el salón y resetea las mesas para iniciar un nuevo turno de atención o limpiar comandas huérfanas.

### 5.4 Caja y Delivery Telefónico (Mesa Virtual 99)
Permite al cajero recibir pedidos telefónicos:
1. Ingrese el nombre del cliente, teléfono y dirección de entrega en Villa Elisa o zonas aledañas.
2. Seleccione los platos solicitados del menú digital.
3. El sistema calcula el total (excluyendo automáticamente la propina legal de salón del 10%).
4. Al enviar la comanda, se dispara al monitor KDS de cocina bajo el rótulo *"DELIVERY (MESA 99)"*.

### 5.5 Auditoría Fiscal e-NCF DGII (Ley 32-23)
Módulo homologado con la normativa tributaria dominicana:
- **Catálogo de Facturas:** Muestra el número de factura, e-NCF emitido, fecha, mesa, subtotal, ITBIS, propina y estado de pago.
- **Impresión de Ticket Fiscal:** Genera el ticket térmico formal con código QR tributario y RNC de la empresa.
- **Anulación Formal con Nota de Crédito Electrónica E34:**
  1. Haga clic en el botón rojo *"Cancelar Factura"* en la fila deseada.
  2. El asistente interactivo de 4 pasos le solicitará el motivo oficial DGII (ej: *Error en comanda* o *Corrección de RNC*).
  3. El sistema emite la **Nota de Crédito Electrónica E34**, anula la factura origen, genera el timbre fiscal y **reintegra automáticamente las materias primas al inventario de almacén**.
- **Mantenimiento y Cierre de Ciclos Fiscales:**
  Botón protegido por PIN (`1234`) que permite al gerente de operaciones o auditor cerrar períodos de prueba o realizar cierres anuales autorizados sin generar inconsistencias tributarias.

---

### 5.6 Centro Maestro de Consultas y Reportes (Catálogo de 36 Reportes)

Accesible mediante la pestaña destacada **"Consultas y Reportes"** en la barra superior. Reúne **36 reportes especializados** clasificados en 6 categorías operativas:

```
+-------------------------------------------------------------------------+
| [TODOS (36)]  [VENTAS (7)]  [FISCAL DGII (6)]  [MENÚ (6)]  [COCINA (5)] |
| [ALMACÉN (6)] [CAJA Y FINANZAS (6)]                                     |
|-------------------------------------------------------------------------|
| Desde: [2026-11-01]  Hasta: [2026-11-16]  Buscar: [Chivo Liniero......] |
| [ Exportar CSV (Excel) ]            [ Imprimir / Guardar en PDF ]       |
+-------------------------------------------------------------------------+
```

#### Matriz de los 36 Reportes Disponibles:

#### Categoría 1: Ventas & Facturación (7 Reportes)
- **REP-01:** *Ventas Generales por Período* (Consolidado cronológico de todas las facturas).
- **REP-02:** *Ventas por Método de Pago* (Efectivo vs Tarjeta POS vs PayPal QR con porcentajes).
- **REP-03:** *Facturación por Mesa y Salón* (Rendimiento por cada mesa física del salón).
- **REP-04:** *Facturas Anuladas con Nota de Crédito E34* (Auditoría tributaria de cancelaciones).
- **REP-05:** *Ticket Promedio y Consumo por Mesa* (Valores medios, máximos y mínimos).
- **REP-06:** *Ventas por Turno de Trabajo* (Comparativa turno Mañana vs turno Noche).
- **REP-31:** *Ventas Detalladas por Hora Exacta* (Curva horaria de facturación de 11:00 AM a 11:00 PM).

#### Categoría 2: Fiscales DGII Ley 32-23 (6 Reportes)
- **REP-07:** *Formato 607 DGII Oficial* (Estructura estándar de ventas exigida para declaración jurada).
- **REP-08:** *Resumen Oficial de Comprobantes e-CF* (Conteo y totales de E31, E32 y E34).
- **REP-09:** *Formato 608 DGII: Comprobantes Anulados* (Relación tributaria de facturas canceladas).
- **REP-10:** *Auditoría de ITBIS Recaudado (18%)* (Base imponible y fondos listos para formulario IT-1).
- **REP-11:** *Liquidación de Propina Legal (Ley 18-88)* (Auditoría del 10% obligatorio para mozos).
- **REP-32:** *Directorio de Clientes con RNC Fiscal* (Empresas que solicitaron comprobantes E31).

#### Categoría 3: Menú, Platos & Gastronomía (6 Reportes)
- **REP-12:** *Ranking de Platos Más Vendidos (Top Ventas)* (De mayor a menor volumen).
- **REP-13:** *Ventas por Categoría de Menú* (Carnes de Chivo, Guarniciones, Bebidas, Postres).
- **REP-14:** *Platos de Menor Rotación* (Especialidades de baja demanda para rediseño).
- **REP-15:** *Efectividad del Motor de Upselling con IA* (Tasa de conversión de sugerencias en tablet).
- **REP-16:** *Rentabilidad y Margen Estimado por Plato* (Costos de insumos vs precio de venta).
- **REP-33:** *Consumo de Guarniciones Criollas* (Tostones, Moro con Coco, Yuca al Mojo, Arepitas).

#### Categoría 4: Cocina, Comandas & KDS (5 Reportes)
- **REP-17:** *Eficiencia y Tiempos de Preparación KDS* (Minutos promedio desde orden hasta despacho).
- **REP-18:** *Horas Pico y Concentración de Demanda* (Franjas horarias de máxima afluencia).
- **REP-19:** *Estado de Comandas: Despachadas vs Pendientes* (Auditoría de flujo en monitor KDS).
- **REP-20:** *Canal de Atención: Salón vs Delivery* (Proporción de comensales sentados vs envíos).
- **REP-34:** *Auditoría de Control de Calidad y Mermas en Cocina* (Registro de mermas y pedidos devueltos).

#### Categoría 5: Almacén, Kardex & Suplidores (6 Reportes)
- **REP-21:** *Valorización y Existencias de Almacén* (Stock actual vs stock de seguridad).
- **REP-22:** *Insumos Críticos (Punto de Reorden)* (Materias primas que requieren compra inmediata).
- **REP-23:** *Kardex: Movimientos Históricos de Insumos* (Entradas por compras y salidas por recetas).
- **REP-24:** *Reintegro de Insumos por Anulaciones Fiscales* (Materias primas reincorporadas con E34).
- **REP-25:** *Directorio de Suplidores Locales de Monte Cristi* (Ganaderos y productores agrícolas).
- **REP-35:** *Consumo y Rotación Semanal de Carne de Chivo* (Libras de chivo procesadas por día).

#### Categoría 6: Caja, Finanzas & Personal (6 Reportes)
- **REP-26:** *Cuadre de Caja Diario y Reporte Z Fiscal* (Arqueo oficial, base gravable e impuestos).
- **REP-27:** *Conciliación de Pagos en Efectivo vs PayPal* (Fondos en caja física vs pasarela digital).
- **REP-28:** *Productividad y Turnos de Personal* (Asignación horaria y estado en nómina).
- **REP-29:** *Auditoría de Secuencia y Saltos e-NCF* (Certificación matemática de 0% saltos tributarios).
- **REP-30:** *Resumen Ejecutivo Gerencial y Proyección IA* (Dashboard con KPIs y sugerencias Gemini).
- **REP-36:** *Liquidación y Balance de Propinas por Personal* (Distribución equitativa entre los 4 mozos).

#### Exportación e Impresión:
- **Botón `Exportar CSV (Excel)`:** Descarga instantáneamente la consulta activa en formato compatible con Microsoft Excel.
- **Botón `Imprimir / Guardar PDF`:** Abre la ventana de impresión con membrete formal, cabecera tributaria del restaurante y formato oficial para entregar al docente o archivar.

---

### 5.7 Almacén, Insumos y Kardex
Controla en tiempo real las existencias de materia prima:
- **Alertas Visuales de Stock:** Verde (Normal), Ámbar (Alerta), Rojo (Punto de Reorden Crítico).
- **Kardex Automático:** Cada vez que se factura un plato, el sistema descuenta los ingredientes de la receta (ej: libras de carne de chivo lechal, plátanos, arroz, chinola).
- **Reintegro Automático:** Al anular una factura con E34, los insumos regresan automáticamente al almacén.

### 5.8 Directorio de Proveedores Locales
Mantiene el registro de los productores de la Línea Noroeste:
- *Asociación de Criadores de Chivo de Monte Cristi* (Carne de chivo lechal).
- *Productores Agrícolas de Guayubín* (Plátanos y víveres).
- *Cooperativa Apícola del Noroeste* (Miel y especias linieras).

### 5.9 Gestión de Personal y Turnos
Permite registrar y supervisar a los colaboradores del restaurante (cocineros, mozos, cajera y personal de limpieza) con asignación de turnos (Matutino: 8:00 AM - 4:00 PM / Vespertino: 4:00 PM - 12:00 AM) y estado activo en nómina.

### 5.10 Inteligencia Artificial Predictiva (Google Gemini)
Módulo asistido por IA generativa:
- Analiza las ventas históricas de los últimos 7 días y emite un diagnóstico en lenguaje natural recomendando cuántas libras de chivo lechal comprar antes del fin de semana para evitar quiebres de stock.

### 5.11 Módulo SaaS y Licencia
Supervisa el estado de la suscripción tecnológica del restaurante con botón de renovación mediante pasarela digital de PayPal.

---

## 6. PREGUNTAS FRECUENTES Y SOLUCIÓN RÁPIDA DE DUDAS

### ¿Cómo realizar la apertura de turno y disponibilidad de mesas en el restaurante?
1. Ingrese a `/admin.html` con usuario `admin` y contraseña `admin123`.
2. En la pestaña **Plano de Mesas**, haga clic en **"Liberar Todas las Mesas"** para garantizar que todas estén en verde e iniciar el servicio sin pedidos retenidos.
3. En la pestaña **Auditoría Fiscal NCF**, si se requiere iniciar un nuevo ciclo fiscal autorizado, haga clic en *"Reiniciar Facturas"*, ingrese el PIN `1234` y confirme.

### ¿Qué hacer si una mesa no cambia de color al ordenar?
El sistema utiliza WebSockets (Socket.IO). Si la conexión de red experimentó una interrupción momentánea, haga clic en el botón *"Actualizar Salón"* en el plano de mesas para sincronizar el estado inmediatamente.

### ¿Cómo comprobar que el comprobante fiscal es válido ante la DGII?
Al emitir cualquier factura (E31 o E32), haga clic en *"Ver Ticket"* y escanee el código QR impreso con la cámara de su teléfono móvil. El enlace le dirigirá a la consulta oficial del timbre electrónico en el portal de la DGII.

---

*Manual de Operación elaborado con fines académicos y profesionales para la evaluación final del Proyecto Integrador.*  
**Estudiante:** Jeremi Santos Fabian (1-19-7223) • **Profesor Evaluador:** Iván Mendoza • **UTESA 2026**.
