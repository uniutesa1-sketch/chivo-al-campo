// =========================================================
// PGM_CLIENTE: LÓGICA DE LA TABLET DE AUTOSERVICIO (PDF FORMATO 1 & PAGO)
// =========================================================

let socket;
try {
  socket = (typeof io !== 'undefined') ? io() : { on: () => {}, emit: () => {} };
} catch (e) {
  console.warn('Socket.IO no disponible:', e);
  socket = { on: () => {}, emit: () => {} };
}

// Variables de Memoria (RAM) especificadas en Sección 17.4 del diseño
let M_Carrito_Items = []; // Todos los items acumulados en la sesión del cliente
let M_Items_Pendientes = []; // Items recién agregados pendientes de enviar a cocina
let M_Subtotal = 0;
let M_ITBIS = 0;
let M_Propina = 0;
let M_Total_Final = 0;
let M_Sugerencia_IA = null;
let M_Pedido_Activo = null;

let mesaId = 4;
let mesaNombre = "Mesa 04";
let catalogoPlatos = [];
let tipoComprobante = 'E32'; // E32 (Consumo) o E31 (Crédito Fiscal)
let ncfPreviewE32 = "E3200000001";
let ncfPreviewE31 = "E3100000001";

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const m = urlParams.get('mesa');
  if (m) {
    mesaId = parseInt(m) || 4;
    mesaNombre = mesaId < 10 ? `Mesa 0${mesaId}` : `Mesa ${mesaId}`;
  }

  // Actualizar títulos en UI
  document.getElementById('tabletHeaderTitle').innerText = `CHIVO AL CAMPO - ${mesaNombre.toUpperCase()}`;
  document.getElementById('screensaverMesaBadge').innerText = `MESA ASIGNADA: ${mesaNombre.toUpperCase()}`;
  document.getElementById('summaryOrderTag').innerText = mesaNombre;
  document.getElementById('modalPagoHeaderTitle').innerText = `${mesaNombre.toUpperCase()} - PROCESO DE PAGO Y FACTURACIÓN`;

  // Iniciar reloj
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // Cargar datos
  cargarPlatos();
  cargarPedidoActivo();
  cargarNCFPreview();

  // Socket.IO
  socket.emit('unirse_dispositivo', 'mesa');

  // Sincronización en vivo con Cocina KDS
  socket.on('estatus_pedido_actualizado', (data) => {
    if (data.mesaId === mesaId) {
      aplicarEstatusCocina(data.estatus, data.mensaje);
    }
  });

  socket.on('catalogo_actualizado', (platos) => {
    catalogoPlatos = platos;
    renderizarCategoriasMenu();
    renderizarMenu(categoriaSeleccionadaActual);
  });

  // Sincronización en vivo cuando el comensal paga escaneando el QR con su móvil o en pasarela
  socket.on('pago_procesado', (data) => {
    if (data.mesaId === mesaId) {
      cerrarModalPago();
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      if (typeof mostrarTicketTermico === 'function') {
        mostrarTicketTermico(data.factura);
      }
      reiniciarMesaCompleta();
    }
  });
});

function actualizarReloj() {
  const clk = document.getElementById('tabletClock');
  if (clk) clk.innerText = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
}

// Control del Protector de Pantalla
function despertarTablet() {
  try {
    if (window.AudioEngine) window.AudioEngine.playClick();
  } catch(e) {}
  const sc = document.getElementById('screensaver');
  if (sc) {
    sc.classList.add('hidden');
    sc.style.display = 'none';
  }
}

function bloquearTablet() {
  try {
    if (window.AudioEngine) window.AudioEngine.playClick();
  } catch(e) {}
  const sc = document.getElementById('screensaver');
  if (sc) {
    sc.style.display = 'flex';
    sc.classList.remove('hidden');
  }
}

// Catálogo de contingencia local si el servidor tarda en responder
// Catálogo de contingencia local con todas las imágenes dedicadas
const platosDefault = [
  { id: 1, nombre: "Servicio de Chivo Liniero", descripcion: "Chivo tierno estofado al estilo tradicional de Monte Cristi con orégano silvestre, ají gustoso y salsa criolla reducida.", precio: 650.00, categoria: "Carnes", imagen: "/assets/images/chivo_liniero.jpg" },
  { id: 2, nombre: "Chivo Asado Familiar", descripcion: "Cortes selectos de chivo marinados 24 horas y dorados lentamente a fuego de leña hasta obtener costra crujiente.", precio: 720.00, categoria: "Carnes", imagen: "/assets/images/chivo_asado.jpg" },
  { id: 3, nombre: "Tostones Crujientes Criollos", descripcion: "Ración de plátanos verdes fritos en dos tiempos, sazonados con sal marina y servidos con mojo especial de ajo y perejil.", precio: 150.00, categoria: "Guarniciones", imagen: "/assets/images/tostones.jpg" },
  { id: 4, nombre: "Arroz Blanco y Habichuelas", descripcion: "La clásica bandera dominicana con arroz grano largo brillante y habichuelas rojas guisadas con auyama y sofrito criollo.", precio: 180.00, categoria: "Guarniciones", imagen: "/assets/images/arroz_habichuelas.jpg" },
  { id: 5, nombre: "Moro de Guandules con Coco", descripcion: "Arroz cocido con guandules frescos, leche de coco y verduras aromáticas de los campos de Monte Cristi.", precio: 200.00, categoria: "Guarniciones", imagen: "/assets/images/moro_guandules.jpg" },
  { id: 6, nombre: "Jugo Natural de Chinola", descripcion: "Extracto 100% natural de maracuyá / chinola campesina, servido bien frío con hielo picado.", precio: 120.00, categoria: "Bebidas", imagen: "/assets/images/jugo_chinola.jpg" },
  { id: 7, nombre: "Cerveza Presidente Vestida de Novia", descripcion: "Cerveza nacional dominicana servida a punto de escarcha (650ml).", precio: 220.00, categoria: "Bebidas", imagen: "/assets/images/cerveza_presidente.jpg" },
  { id: 8, nombre: "Refresco Embotellado", descripcion: "Refrescos variados (Coca Cola, Sprite, Country Club Frambuesa).", precio: 75.00, categoria: "Bebidas", imagen: "/assets/images/refresco_embotellado.jpg" },
  { id: 9, nombre: "Majarete Tradicional con Canela", descripcion: "Cremoso postre de maíz tierno molido en leche con canela molida, vainilla y nuez moscada.", precio: 160.00, categoria: "Postres", imagen: "/assets/images/majarete.jpg" },
  { id: 10, nombre: "Dulce de Leche Cortada", descripcion: "Dulce artesanal en almíbar especiado con canela y limón al estilo campesino liniero.", precio: 150.00, categoria: "Postres", imagen: "/assets/images/dulce_leche.jpg" }
];

// Cargar Platos
async function cargarPlatos() {
  try {
    const res = await fetch('/api/platos');
    if (!res.ok) throw new Error('Servidor no disponible');
    catalogoPlatos = await res.json();
    if (!catalogoPlatos || catalogoPlatos.length === 0) {
      catalogoPlatos = platosDefault;
    }
  } catch (err) {
    console.warn('Usando catálogo local de platos:', err);
    catalogoPlatos = platosDefault;
  }
  renderizarCategoriasMenu();
  renderizarMenu(categoriaSeleccionadaActual);
}

let categoriaSeleccionadaActual = 'Todos';

// Renderizar dinámicamente las pestañas de categorías según los platos disponibles
function renderizarCategoriasMenu() {
  const container = document.getElementById('categoriesTabsContainer');
  if (!container) return;

  const lista = (catalogoPlatos && catalogoPlatos.length > 0) ? catalogoPlatos : platosDefault;
  
  // Extraer categorías únicas preservando el orden o mayúsculas
  const catSet = new Set();
  lista.forEach(p => {
    if (p.categoria && p.categoria.trim()) {
      catSet.add(p.categoria.trim());
    }
  });

  const categorias = ['Todos', ...Array.from(catSet)];

  container.innerHTML = '';
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    const esActivo = cat.toLowerCase() === categoriaSeleccionadaActual.toLowerCase();
    btn.className = `pdf-category-tab ${esActivo ? 'active' : ''}`;
    btn.innerText = cat === 'Todos' ? 'Todo el Menú' : cat;
    btn.onclick = () => {
      filtrarCategoria(cat, btn);
    };
    container.appendChild(btn);
  });
}

let ipServidorDetectada = '';
let ipManualOverride = localStorage.getItem('chivo_ip_override') || '';

async function cargarNCFPreview() {
  try {
    const res = await fetch('/api/info');
    const data = await res.json();
    if (data.servidor && data.servidor.ipLocal) {
      ipServidorDetectada = data.servidor.ipLocal;
    }
    if (data.ncfConfig) {
      const secE32 = (data.ncfConfig.E32_secuencia != null ? data.ncfConfig.E32_secuencia : data.ncfConfig.B02_secuencia) || 0;
      const secE31 = (data.ncfConfig.E31_secuencia != null ? data.ncfConfig.E31_secuencia : data.ncfConfig.B01_secuencia) || 0;
      const prefE32 = data.ncfConfig.E32_prefijo || 'E32';
      const prefE31 = data.ncfConfig.E31_prefijo || 'E31';
      ncfPreviewE32 = `${prefE32}${String(secE32 + 1).padStart(10, '0')}`;
      ncfPreviewE31 = `${prefE31}${String(secE31 + 1).padStart(10, '0')}`;
      const prevElem = document.getElementById('pdfComprobantePreview');
      if (prevElem) {
        prevElem.innerText = (tipoComprobante === 'E31' || tipoComprobante === 'B01') ? ncfPreviewE31 : ncfPreviewE32;
      }
    }
  } catch (err) {
    console.error('Error cargando NCF preview:', err);
  }
}

// Renderizar Menú de Platos
function renderizarMenu(categoria = 'Todos') {
  const container = document.getElementById('dishesGrid');
  if (!container) return;
  container.innerHTML = '';

  const lista = (catalogoPlatos && catalogoPlatos.length > 0) ? catalogoPlatos : platosDefault;

  const filtrados = (categoria === 'Todos' || !categoria)
    ? lista
    : lista.filter(p => p.categoria && p.categoria.toLowerCase().trim() === categoria.toLowerCase().trim());

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-utensils" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
        <h4 style="color: #fff; font-size: 1.2rem; margin-bottom: 0.4rem;">No hay platos en la categoría "${categoria}"</h4>
        <p style="font-size: 0.9rem;">Seleccione otra categoría o "Todo el Menú" para ordenar.</p>
      </div>
    `;
    return;
  }

  filtrados.forEach(plato => {
    const card = document.createElement('div');
    card.className = 'dish-card-compact';
    card.style = 'cursor: pointer; position: relative; user-select: none;';
    
    // Tocar cualquier parte de la tarjeta agrega el plato a la orden
    card.onclick = () => {
      agregarAlPedido(plato.id);
    };

    const precioFormateado = Number(plato.precio).toFixed(2);
    const imgUrl = (plato.imagen && plato.imagen.trim()) ? plato.imagen.trim() : '/assets/images/logo.jpg';

    card.innerHTML = `
      <div class="dish-card-img-wrap">
        <img src="${imgUrl}" alt="${plato.nombre}" loading="lazy" onerror="this.onerror=null; this.src='/assets/images/logo.jpg';">
        <!-- Badge de Precio con ITBIS incluido sobre la Foto -->
        <div class="dish-card-price-badge">
          <div style="font-size: 0.95rem; font-weight: 800;">RD$ ${precioFormateado}</div>
          <div style="font-size: 0.62rem; color: #10b981; font-weight: 700;">ITBIS INCLUIDO</div>
        </div>
      </div>
      <div class="dish-card-compact-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
          <h4 class="dish-title">${plato.nombre}</h4>
        </div>
        <div style="margin-bottom: 0.4rem;">
          <span style="font-size: 0.7rem; background: rgba(245, 158, 11, 0.15); color: var(--accent-gold); border: 1px solid rgba(245, 158, 11, 0.3); padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 600;">
            ${plato.categoria || 'Menú'}
          </span>
        </div>
        <p class="dish-desc">${plato.descripcion || ''}</p>
        <div class="dish-foot" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.6rem; margin-top: auto;">
          <div>
            <span class="dish-price" style="font-size: 1.25rem; font-weight: 800; color: #f59e0b; display: block; line-height: 1.1;">
              <small style="font-size: 0.75rem; color: #94a3b8;">RD$</small> ${precioFormateado}
            </span>
            <span style="font-size: 0.72rem; color: #10b981; font-weight: 600;">ITBIS (18%) Incluido</span>
          </div>
          <button class="btn btn-primary btn-sm" style="pointer-events: none; padding: 0.4rem 0.9rem;">
            <i class="fa-solid fa-plus"></i> Agregar
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filtrarCategoria(cat, btn) {
  try {
    if (window.AudioEngine) window.AudioEngine.playClick();
  } catch(e) {}
  categoriaSeleccionadaActual = cat;
  document.querySelectorAll('.pdf-category-tab').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  }
  renderizarMenu(cat);
}

// =========================================================
// GESTIÓN DEL PEDIDO Y CUENTA EN PANTALLA (PERMANENTE)
// =========================================================
function agregarAlPedido(platoId) {
  try {
    if (window.AudioEngine) window.AudioEngine.playClick();
  } catch(e) {}

  const lista = (catalogoPlatos && catalogoPlatos.length > 0) ? catalogoPlatos : platosDefault;
  const plato = lista.find(p => p.id == platoId);
  if (!plato) {
    console.warn('Plato no encontrado con ID:', platoId);
    return;
  }

  // Agregar al listado acumulado de la sesión
  const found = M_Carrito_Items.find(i => i.id == platoId);
  if (found) {
    found.cantidad++;
    found.subtotal = found.cantidad * found.precio;
  } else {
    M_Carrito_Items.push({
      id: plato.id,
      nombre: plato.nombre,
      precio: Number(plato.precio),
      categoria: plato.categoria,
      cantidad: 1,
      subtotal: Number(plato.precio)
    });
  }

  // Registrar como ítem nuevo pendiente de transmitir a cocina
  const foundPend = M_Items_Pendientes.find(i => i.id == platoId);
  if (foundPend) {
    foundPend.cantidad++;
    foundPend.subtotal = foundPend.cantidad * foundPend.precio;
  } else {
    M_Items_Pendientes.push({
      id: plato.id,
      nombre: plato.nombre,
      precio: Number(plato.precio),
      categoria: plato.categoria,
      cantidad: 1,
      subtotal: Number(plato.precio)
    });
  }

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();
}

function recalcularTotalesRAM() {
  const totalMenuConItbis = M_Carrito_Items.reduce((acc, i) => acc + i.subtotal, 0);
  // Base imponible gravable (Precios de menú con ITBIS dividido entre 1.18)
  M_Subtotal = Math.round((totalMenuConItbis / 1.18) * 100) / 100;
  // ITBIS desglosado (18% exacto)
  M_ITBIS = Math.round((totalMenuConItbis - M_Subtotal) * 100) / 100;
  // Propina legal de ley 5432 (10% sobre la base imponible)
  M_Propina = Math.round((M_Subtotal * 0.10) * 100) / 100;
  // Total final a pagar (Consumo con ITBIS + Propina legal)
  M_Total_Final = Math.round((totalMenuConItbis + M_Propina) * 100) / 100;

  // Actualizar pantalla izquierda
  document.getElementById('sumSubtotal').innerText = `RD$ ${M_Subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('sumItbis').innerText = `RD$ ${M_ITBIS.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('sumPropina').innerText = `RD$ ${M_Propina.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('sumTotal').innerText = `RD$ ${M_Total_Final.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

  // Actualizar pantalla de pago (Página 18)
  document.getElementById('pdfSubtotalVal').innerText = `RD$ ${M_Subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('pdfItbisVal').innerText = `RD$ ${M_ITBIS.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('pdfPropinaVal').innerText = `RD$ ${M_Propina.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  document.getElementById('pdfGrandTotalVal').innerText = `RD$ ${M_Total_Final.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

function renderizarResumenPedido() {
  const container = document.getElementById('summaryItemsList');
  const btnVaciar = document.getElementById('btnVaciarPedido');

  if (M_Carrito_Items.length === 0) {
    if (btnVaciar) btnVaciar.style.display = 'none';
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem; font-size: 0.9rem;">
        <i class="fa-solid fa-utensils" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.75rem; display: block;"></i>
        Seleccione platos del menú para armar su orden.
      </div>
    `;
    return;
  }

  if (btnVaciar) btnVaciar.style.display = 'inline-block';
  container.innerHTML = '';

  M_Carrito_Items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'summary-item-row';
    row.innerHTML = `
      <div style="flex: 1; min-width: 0;">
        <div class="summary-item-desc" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nombre}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span>RD$ ${item.precio.toFixed(2)} c/u</span>
          <div class="item-qty-controls">
            <button onclick="disminuirCantidadItem(${item.id})" class="btn-qty" title="Reducir">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span style="font-weight: 700; color: #fff; padding: 0 0.25rem;">${item.cantidad}x</span>
            <button onclick="aumentarCantidadItem(${item.id})" class="btn-qty" title="Aumentar">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <div class="summary-item-val">RD$ ${item.subtotal.toFixed(2)}</div>
        <button onclick="eliminarItemDelPedido(${item.id})" class="btn-delete-item" title="Eliminar este plato">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

// Disminuir cantidad de un plato o eliminar si llega a 0
async function disminuirCantidadItem(platoId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const item = M_Carrito_Items.find(i => i.id == platoId);
  if (!item) return;

  if (item.cantidad > 1) {
    item.cantidad--;
    item.subtotal = item.cantidad * item.precio;

    // Si había pendientes de este plato, ajustar también
    const pend = M_Items_Pendientes.find(i => i.id == platoId);
    if (pend) {
      pend.cantidad--;
      if (pend.cantidad <= 0) {
        M_Items_Pendientes = M_Items_Pendientes.filter(i => i.id != platoId);
      } else {
        pend.subtotal = pend.cantidad * pend.precio;
      }
    }

    // Si ya existe comanda enviada a cocina, sincronizar ajuste con el servidor
    if (M_Pedido_Activo) {
      try {
        await fetch(`/api/pedidos/${M_Pedido_Activo.id}/item/${platoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: -1 })
        });
      } catch (e) {
        console.warn('Error sincronizando reducción con cocina:', e);
      }
    }
  } else {
    // Si la cantidad es 1, eliminar el plato directamente
    await eliminarItemDelPedido(platoId);
    return;
  }

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();
}

// Aumentar cantidad de un plato
async function aumentarCantidadItem(platoId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const item = M_Carrito_Items.find(i => i.id == platoId);
  if (!item) return;

  item.cantidad++;
  item.subtotal = item.cantidad * item.precio;

  // Registrar como adicional para enviar a cocina si ya hay orden activa
  const pend = M_Items_Pendientes.find(i => i.id == platoId);
  if (pend) {
    pend.cantidad++;
    pend.subtotal = pend.cantidad * pend.precio;
  } else {
    M_Items_Pendientes.push({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      categoria: item.categoria,
      cantidad: 1,
      subtotal: item.precio
    });
  }

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();
}

// Eliminar un plato por completo de la orden
async function eliminarItemDelPedido(platoId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const item = M_Carrito_Items.find(i => i.id == platoId);
  if (!item) return;

  // Quitar de memoria local
  M_Carrito_Items = M_Carrito_Items.filter(i => i.id != platoId);
  M_Items_Pendientes = M_Items_Pendientes.filter(i => i.id != platoId);

  // Si ya existía pedido enviado a cocina, sincronizar la eliminación con backend y KDS
  if (M_Pedido_Activo) {
    try {
      const res = await fetch(`/api/pedidos/${M_Pedido_Activo.id}/item/${platoId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.cancelado || M_Carrito_Items.length === 0) {
        M_Pedido_Activo = null;
        const banner = document.getElementById('kitchenStatusBanner');
        if (banner) banner.style.display = 'none';
        const badge = document.getElementById('tabletStatusBadge');
        if (badge) {
          badge.className = 'status-pill-pdf';
          document.getElementById('tabletStatusText').innerText = 'ESTATUS: EN ESPERA';
        }
      } else if (data.pedido) {
        M_Pedido_Activo = data.pedido;
      }
    } catch (e) {
      console.warn('Error eliminando item del servidor:', e);
    }
  }

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();
}

// Vaciar o cancelar toda la comanda de la mesa
async function confirmarVaciarPedido() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  if (!confirm(`¿Desea vaciar los platos seleccionados en la ${mesaNombre} y reiniciar la cuenta?`)) {
    return;
  }

  if (M_Pedido_Activo) {
    try {
      await fetch(`/api/pedidos/${M_Pedido_Activo.id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Error al vaciar comanda en servidor:', e);
    }
  }

  M_Carrito_Items = [];
  M_Items_Pendientes = [];
  M_Pedido_Activo = null;

  const banner = document.getElementById('kitchenStatusBanner');
  if (banner) banner.style.display = 'none';
  const badge = document.getElementById('tabletStatusBadge');
  if (badge) {
    badge.className = 'status-pill-pdf';
    document.getElementById('tabletStatusText').innerText = 'ESTATUS: EN ESPERA';
  }

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();

  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
}

function actualizarBotonCocina() {
  const btn = document.getElementById('btnEnviarCocina');
  if (M_Items_Pendientes.length > 0) {
    if (M_Pedido_Activo) {
      btn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Enviar ${M_Items_Pendientes.length} Adicional(es) a Cocina`;
      btn.className = 'btn btn-primary';
    } else {
      btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar a Cocina con IA`;
      btn.className = 'btn btn-primary';
    }
    btn.disabled = false;
  } else if (M_Pedido_Activo) {
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Comanda en Cocina (Al Día)`;
    btn.className = 'btn btn-outline';
    btn.disabled = false;
  } else {
    btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar a Cocina con IA`;
    btn.className = 'btn btn-primary';
    btn.disabled = false;
  }
}

// =========================================================
// IA DE UPSELLING Y ENVÍO A COCINA
// =========================================================
async function abrirModalUpsellingIA() {
  if (M_Items_Pendientes.length === 0 && M_Carrito_Items.length === 0) {
    alert('Agregue platos del menú antes de enviar a cocina.');
    return;
  }

  // Si no hay ítems pendientes nuevos pero quiere enviar
  const itemsParaAnalizar = M_Items_Pendientes.length > 0 ? M_Items_Pendientes : M_Carrito_Items;

  if (window.AudioEngine) window.AudioEngine.playClick();

  try {
    const res = await fetch('/api/ia/upselling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: itemsParaAnalizar })
    });
    const data = await res.json();
    M_Sugerencia_IA = data.sugerencia;

    if (M_Sugerencia_IA && M_Sugerencia_IA.plato) {
      document.getElementById('iaPlatoNombre').innerText = M_Sugerencia_IA.plato.nombre;
      document.getElementById('iaMensaje').innerText = M_Sugerencia_IA.mensaje;
      document.getElementById('iaPlatoPrecio').innerText = `RD$ ${M_Sugerencia_IA.plato.precio.toFixed(2)}`;
      if (M_Sugerencia_IA.plato.imagen) {
        document.getElementById('iaPlatoImg').src = M_Sugerencia_IA.plato.imagen;
      }
      document.getElementById('modalUpselling').classList.add('active');
    } else {
      enviarComandaReal();
    }
  } catch (err) {
    console.error('Error IA upselling:', err);
    enviarComandaReal();
  }
}

function aceptarUpselling() {
  if (M_Sugerencia_IA && M_Sugerencia_IA.plato) {
    agregarAlPedido(M_Sugerencia_IA.plato.id);
  }
  document.getElementById('modalUpselling').classList.remove('active');
  enviarComandaReal();
}

function rechazarUpsellingYEnviar() {
  document.getElementById('modalUpselling').classList.remove('active');
  enviarComandaReal();
}

async function enviarComandaReal() {
  const itemsAEnviar = M_Items_Pendientes.length > 0 ? M_Items_Pendientes : M_Carrito_Items;
  if (itemsAEnviar.length === 0) return;

  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesaId,
        mesaNombre,
        origen: 'MESA',
        items: itemsAEnviar
      })
    });
    const result = await res.json();

    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      M_Pedido_Activo = result.pedido;
      M_Items_Pendientes = []; // Se limpian los pendientes enviados, pero el pedido acumulado SIGUE en pantalla

      // Sincronizar items de la comanda completa
      M_Carrito_Items = result.pedido.items;
      recalcularTotalesRAM();
      renderizarResumenPedido();
      actualizarBotonCocina();

      aplicarEstatusCocina('en_preparacion', '¡Su orden está en cocina! El chef está preparando su comida.');
    }
  } catch (err) {
    console.error('Error enviando comanda:', err);
    alert('Error al comunicar con la cocina.');
  }
}

// Cargar si ya hay pedido activo en la mesa
async function cargarPedidoActivo() {
  try {
    const res = await fetch(`/api/pedidos/mesa/${mesaId}`);
    const pedido = await res.json();
    if (pedido && !pedido.pagado && pedido.items && pedido.items.length > 0) {
      M_Pedido_Activo = pedido;
      M_Carrito_Items = pedido.items;
      recalcularTotalesRAM();
      renderizarResumenPedido();
      actualizarBotonCocina();
      aplicarEstatusCocina(pedido.estatus);
    } else {
      reiniciarMesaCompleta();
    }
  } catch (err) {
    console.error('Error al verificar pedido activo:', err);
    reiniciarMesaCompleta();
  }
}

// Sincronización exacta de estado de cocina en Tablet
function aplicarEstatusCocina(estatus, customMsg) {
  const badge = document.getElementById('tabletStatusBadge');
  const txt = document.getElementById('tabletStatusText');
  const banner = document.getElementById('kitchenStatusBanner');
  const bannerMsg = document.getElementById('kitchenStatusMsg');
  const bannerIcon = document.getElementById('kitchenIcon');

  banner.style.display = 'flex';

  if (estatus === 'en_preparacion') {
    badge.className = 'status-pill-pdf status-prep';
    txt.innerText = 'ESTATUS: EN PREPARACIÓN';
    banner.style.background = '#0284c7';
    bannerIcon.className = 'fa-solid fa-fire-burner';
    bannerMsg.innerText = customMsg || 'El chef está preparando su comida en cocina';
  } else if (estatus === 'listo' || estatus === 'despachado') {
    badge.className = 'status-pill-pdf status-ready';
    txt.innerText = 'ESTATUS: LISTO / EN CAMINO';
    banner.style.background = '#059669';
    bannerIcon.className = 'fa-solid fa-bell';
    bannerMsg.innerText = '¡Su comida está lista y va en camino a su mesa!';
    if (window.AudioEngine) window.AudioEngine.playOrderAlert();
  } else {
    badge.className = 'status-pill-pdf';
    txt.innerText = 'ESTATUS: ORDEN RECIBIDA';
    bannerMsg.innerText = 'Orden recibida en espera de preparación';
  }
}

// =========================================================
// MÓDULO DE PAGO Y FACTURACIÓN EXACTO A LA PÁGINA 18 DEL PDF
// =========================================================
function obtenerIPHostMovil() {
  if (ipManualOverride && ipManualOverride.trim()) {
    return ipManualOverride.trim();
  }
  const host = window.location.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }
  return ipServidorDetectada || '127.0.0.1';
}

function generarQRPagoMovil() {
  const ipHost = obtenerIPHostMovil();
  const port = window.location.port ? `:${window.location.port}` : '';
  const urlMovil = `http://${ipHost}${port}/paypal-movil.html?mesa=${mesaId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(urlMovil)}`;
  
  const qrElem = document.getElementById('pdfQrPayPalImg');
  if (qrElem) qrElem.src = qrUrl;

  const ipDisplay = document.getElementById('pdfQrIpDisplay');
  if (ipDisplay) ipDisplay.innerText = ipHost;

  const urlDisplay = document.getElementById('pdfQrUrlDisplay');
  if (urlDisplay) urlDisplay.innerText = urlMovil;
}

function editarIpManual() {
  const actual = obtenerIPHostMovil();
  const nueva = prompt('Ingrese la dirección IP de esta computadora en la red Wi-Fi actual:\n(Escriba "auto" para que el sistema la detecte solo)', actual);
  if (nueva !== null) {
    if (nueva.trim() === '' || nueva.trim().toLowerCase() === 'auto') {
      localStorage.removeItem('chivo_ip_override');
      ipManualOverride = '';
      alert('Modo automático restaurado: el sistema detectará la IP de la red Wi-Fi actual.');
    } else {
      ipManualOverride = nueva.trim();
      localStorage.setItem('chivo_ip_override', ipManualOverride);
      alert(`IP asignada manualmente a: ${ipManualOverride}`);
    }
    generarQRPagoMovil();
  }
}

function iniciarProcesoPago() {
  if (M_Carrito_Items.length === 0) {
    alert('No hay consumos registrados en esta mesa para facturar.');
    return;
  }

  if (window.AudioEngine) window.AudioEngine.playClick();
  recalcularTotalesRAM();

  // Generar QR dinámico hacia la pasarela móvil oficial con la IP de la red actual
  generarQRPagoMovil();

  document.getElementById('modalPagoPDF').classList.add('active');
}

function cerrarModalPago() {
  document.getElementById('modalPagoPDF').classList.remove('active');
}

function setFiscalType(tipo) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  let tipoNorm = (tipo || 'E32').toUpperCase();
  if (tipoNorm === 'B01') tipoNorm = 'E31';
  if (tipoNorm === 'B02') tipoNorm = 'E32';
  tipoComprobante = tipoNorm;

  const btnE32 = document.getElementById('pdfBtnE32') || document.getElementById('pdfBtnB02');
  const btnE31 = document.getElementById('pdfBtnE31') || document.getElementById('pdfBtnB01');
  const preview = document.getElementById('pdfComprobantePreview');

  if (tipoNorm === 'E31') {
    if (btnE31) btnE31.classList.add('active');
    if (btnE32) btnE32.classList.remove('active');
    if (preview) preview.innerText = ncfPreviewE31;
  } else {
    if (btnE32) btnE32.classList.add('active');
    if (btnE31) btnE31.classList.remove('active');
    if (preview) preview.innerText = ncfPreviewE32;
  }
}

let razonSocialValidada = '';
let debounceRncTimer = null;

// Teclado numérico táctil de la página 18
function pressNumpad(num) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const input = document.getElementById('pdfRncInput');
  if (input.value.length < 11) {
    input.value += num;
    verificarRncEnVivo();
  }
}

function backspaceNumpad() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const input = document.getElementById('pdfRncInput');
  input.value = input.value.slice(0, -1);
  verificarRncEnVivo();
}

// Consulta automática en vivo del RNC digitado
async function verificarRncEnVivo() {
  const rnc = document.getElementById('pdfRncInput').value.trim();
  const box = document.getElementById('pdfRncValidadoBox');
  const txt = document.getElementById('pdfRazonSocialTxt');

  if (rnc.length !== 9 && rnc.length !== 11) {
    if (box) box.style.display = 'none';
    razonSocialValidada = '';
    return;
  }

  if (box && txt) {
    box.style.display = 'block';
    txt.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Consultando en DGII...`;
  }

  clearTimeout(debounceRncTimer);
  debounceRncTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/dgii/consultar-rnc/${rnc}`);
      const data = await res.json();
      if (data.success && data.razonSocial) {
        razonSocialValidada = data.razonSocial;
        if (txt) {
          txt.innerText = `${data.razonSocial} (${data.estado || 'ACTIVO'})`;
        }
      } else {
        razonSocialValidada = `Contribuyente RNC ${rnc}`;
        if (txt) txt.innerText = razonSocialValidada;
      }
    } catch (err) {
      razonSocialValidada = `Contribuyente RNC ${rnc}`;
      if (txt) txt.innerText = razonSocialValidada;
    }
  }, 250);
}

// Confirmar Pago y Emisión Fiscal
async function confirmarPagoFinal(metodo) {
  const rnc = document.getElementById('pdfRncInput').value.trim();

  // Validación estricta para Crédito Fiscal (E31)
  if (tipoComprobante === 'E31' || tipoComprobante === 'B01') {
    if (rnc.length !== 9 && rnc.length !== 11) {
      alert('Para Factura de Crédito Fiscal Electrónica (E31) debe digitar un RNC o Cédula válido de 9 u 11 dígitos.');
      return;
    }
  }

  // Si aún no se había enviado el pedido a cocina antes de pagar, se crea
  let pedidoId = M_Pedido_Activo ? M_Pedido_Activo.id : null;
  if (!pedidoId) {
    const resPed = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesaId,
        mesaNombre,
        origen: 'MESA',
        items: M_Carrito_Items
      })
    });
    const dataPed = await resPed.json();
    pedidoId = dataPed.pedido.id;
  }

  try {
    const tipoFinal = (tipoComprobante === 'E31' || tipoComprobante === 'B01') ? 'E31' : 'E32';
    const res = await fetch('/api/facturas/pagar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedidoId,
        tipoComprobante: tipoFinal,
        rncCliente: rnc || null,
        razonSocial: tipoFinal === 'E31' ? (razonSocialValidada || 'Cliente Corporativo') : 'Consumidor Final',
        metodoPago: metodo
      })
    });

    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cerrarModalPago();
      mostrarTicketTermico(result.factura);
      reiniciarMesaCompleta();
    } else {
      alert(result.error || 'Error procesando la factura fiscal.');
    }
  } catch (err) {
    console.error('Error pagando factura:', err);
    alert('Error al contactar el servidor fiscal.');
  }
}

// Renderizar Ticket Térmico Oficial (Página 18 del PDF)
function mostrarTicketTermico(factura) {
  document.getElementById('recTipoComprobante').innerText = factura.descripcionComprobante.toUpperCase();
  document.getElementById('recNCF').innerText = factura.encf || factura.ncf;
  document.getElementById('recFecha').innerText = new Date(factura.fecha).toLocaleString('es-DO');
  document.getElementById('recMesa').innerText = factura.mesaNombre.replace('Mesa ', '');
  document.getElementById('recMetodoPago').innerText = factura.metodoPago.toUpperCase();

  if (factura.tipoComprobante === 'E31' || factura.tipoComprobante === 'B01') {
    document.getElementById('recRncClienteRow').style.display = 'block';
    document.getElementById('recRncCliente').innerText = factura.rncCliente;
    document.getElementById('recRazonSocialRow').style.display = 'block';
    document.getElementById('recRazonSocial').innerText = factura.razonSocial;
  } else {
    document.getElementById('recRncClienteRow').style.display = 'none';
    document.getElementById('recRazonSocialRow').style.display = 'none';
  }

  // Items formateados exactamente como en el ticket del PDF
  const tbody = document.getElementById('recItemsTbody');
  tbody.innerHTML = '';
  factura.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding: 2px 0;">${item.cantidad}x ${item.nombre}</td>
      <td style="text-align: right; padding: 2px 0;">RD$ ${item.subtotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('recSubtotal').innerText = `RD$ ${factura.subtotal.toFixed(2)}`;
  document.getElementById('recItbis').innerText = `RD$ ${factura.itbis.toFixed(2)}`;
  document.getElementById('recPropina').innerText = `RD$ ${factura.propina.toFixed(2)}`;
  document.getElementById('recTotal').innerText = `RD$ ${factura.total.toFixed(2)}`;

  // Datos de Timbre Electrónico e-CF DGII
  const ecfBox = document.getElementById('recEcfBox');
  const qrFiscalImg = document.getElementById('recQrFiscalImg');
  const rncEmisorLimpio = (factura.restaurante?.rnc || '132907401').replace(/\D/g, '');
  const urlDGII = factura.ecf?.qrFiscalURL || `https://ecf.dgii.gov.do/testecf/consultatimbre?rncemisor=${rncEmisorLimpio}&encf=${factura.ecf?.encf || factura.ncf}&monto=${factura.total}`;

  if (qrFiscalImg) {
    qrFiscalImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(urlDGII)}`;
  }

  if (ecfBox) {
    if (factura.ecf) {
      document.getElementById('recEncfVal').innerText = factura.ecf.encf || factura.ncf;
      document.getElementById('recCodigoSeguridad').innerText = factura.ecf.codigoSeguridad || 'N/A';
      document.getElementById('recTrackId').innerText = factura.ecf.trackId || 'TRK-OFFICIAL';
      ecfBox.style.display = 'block';
    } else {
      document.getElementById('recEncfVal').innerText = factura.ncf;
      document.getElementById('recCodigoSeguridad').innerText = 'SEC-OK';
      document.getElementById('recTrackId').innerText = 'TRK-LOCAL';
    }
  }

  document.getElementById('modalFactura').classList.add('active');
}

// Reiniciar completamente la mesa (RAM, DOM, Totales, Estatus y Pedido Activo)
function reiniciarMesaCompleta() {
  M_Carrito_Items = [];
  M_Items_Pendientes = [];
  M_Pedido_Activo = null;
  M_Subtotal = 0;
  M_ITBIS = 0;
  M_Propina = 0;
  M_Total_Final = 0;
  M_Sugerencia_IA = null;

  recalcularTotalesRAM();
  renderizarResumenPedido();
  actualizarBotonCocina();

  const kitchenBanner = document.getElementById('kitchenStatusBanner');
  if (kitchenBanner) kitchenBanner.style.display = 'none';

  const statusBadge = document.getElementById('tabletStatusBadge');
  if (statusBadge) statusBadge.className = 'status-pill-pdf';

  const statusText = document.getElementById('tabletStatusText');
  if (statusText) statusText.innerText = 'ESTATUS: ORDEN ABIERTA';

  const rncInput = document.getElementById('pdfRncInput');
  if (rncInput) rncInput.value = '';

  const rncFeedback = document.getElementById('pdfRncFeedback');
  if (rncFeedback) {
    rncFeedback.style.display = 'none';
    rncFeedback.innerText = '';
  }

  cargarNCFPreview();
}

function finalizarTurnoCliente() {
  const modalFac = document.getElementById('modalFactura');
  if (modalFac) modalFac.classList.remove('active');
  reiniciarMesaCompleta();
  bloquearTablet();
}

async function solicitarMesero() {
  try {
    if (window.AudioEngine) window.AudioEngine.playClick();
  } catch(e) {}

  const payload = {
    mesaId,
    mesaNombre,
    fecha: new Date().toISOString()
  };

  // 1. Notificar en vivo por WebSocket a gerencia y cocina
  if (socket && typeof socket.emit === 'function') {
    socket.emit('llamar_mesero', payload);
  }

  // 2. Registrar en la base de datos
  try {
    await fetch('/api/llamadas-mesero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(e) {
    console.warn('Error registrando llamada:', e);
  }

  alert(`🔔 Solicitud enviada: Se ha activado la alerta con sonido en la caja y gerencia para atender a la ${mesaNombre}. En breve se acercará un mesero.`);
}
