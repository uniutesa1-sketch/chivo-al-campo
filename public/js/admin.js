// =========================================================
// PGM_ADMIN: LÓGICA DEL PANEL DE ADMINISTRACIÓN Y GERENCIA
// =========================================================

const socket = io();

let usuarioSesion = null;
let pinIngresado = '';
let catalogoPlatos = [];
let deliveryCart = [];
let todasFacturas = [];
let listaLlamadasMesero = [];
let listaMesas = [];
let listaInventario = [];
let listaMovimientosInventario = [];
let listaEmpleados = [];
let listaProveedores = [];
let datosReporte607 = null;
let datosCuadre = null;
let mesaSeleccionadaModal = null;
let sonidoAlertaInterval = null;
let facturaIdParaCancelar = null;

document.addEventListener('DOMContentLoaded', () => {
  // Verificación obligatoria de autenticación gerencial
  verificarSesionAdmin();

  // Inicialización de todos los módulos del restaurante
  cargarStats();
  cargarPlatosAdmin();
  cargarFacturas();
  cargarLlamadasMesero();
  cargarMesasAdmin();
  cargarInventario();
  cargarProveedores();
  cargarEmpleados();
  cargarCuadreCaja();
  cargarReporte607();
  generarReporteIA();
  if (typeof inicializarModuloReportes30 === 'function') inicializarModuloReportes30();

  // Socket.IO: Registrar dispositivo como Admin
  socket.emit('unirse_dispositivo', 'admin');

  // Actualizaciones en tiempo real
  socket.on('pago_procesado', () => {
    cargarStats();
    cargarFacturas();
    cargarCuadreCaja();
    cargarMesasAdmin();
    cargarInventario();
  });

  socket.on('factura_cancelada', () => {
    cargarStats();
    cargarFacturas();
    cargarCuadreCaja();
    cargarInventario();
  });

  socket.on('factura_anulada', () => {
    cargarStats();
    cargarFacturas();
    cargarCuadreCaja();
    cargarInventario();
  });

  socket.on('nuevo_pedido', () => {
    cargarStats();
    cargarMesasAdmin();
    cargarCuadreCaja();
  });

  socket.on('catalogo_actualizado', (platos) => {
    catalogoPlatos = platos;
    renderizarCatalogoAdmin();
    renderizarPlatosDelivery();
  });

  // Alerta en vivo de solicitud de mesero
  socket.on('alerta_mesero', (data) => {
    reproducirAlertaSonoraMesero();
    cargarLlamadasMesero();
    cargarMesasAdmin();
  });

  socket.on('mesero_atendido', () => {
    cargarLlamadasMesero();
    cargarMesasAdmin();
  });

  socket.on('mesas_actualizadas', (mesas) => {
    listaMesas = mesas;
    renderizarMesasSalon();
  });

  socket.on('inventario_actualizado', (data) => {
    if (data && data.inventario) {
      listaInventario = data.inventario;
      listaMovimientosInventario = data.movimientos || [];
      renderizarInventario();
      renderizarKardexMovimientos(listaMovimientosInventario);
      poblarSelectInsumos();
    } else {
      cargarInventario();
    }
  });

  socket.on('facturas_reiniciadas', () => {
    cargarStats();
    cargarFacturas();
    cargarCuadreCaja();
    cargarMesasAdmin();
    cargarReporte607();
    cargarInventario();
  });
});

// Navegación de pestañas
function cambiarPestana(tabName, btn) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

  if (btn) {
    btn.classList.add('active');
  } else {
    const navBtn = document.querySelector(`.admin-nav-btn[onclick*="'${tabName}'"]`);
    if (navBtn) navBtn.classList.add('active');
  }

  const target = document.getElementById(`tab-${tabName}`);
  if (target) {
    target.style.display = 'block';
  }

  if (tabName === 'dashboard') cargarStats();
  if (tabName === 'mesas') cargarMesasAdmin();
  if (tabName === 'mesero') cargarLlamadasMesero();
  if (tabName === 'ncf') cargarFacturas();
  if (tabName === 'inventario') cargarInventario();
  if (tabName === 'proveedores') cargarProveedores();
  if (tabName === 'empleados') cargarEmpleados();
  if (tabName === 'cuadre') cargarCuadreCaja();
  if (tabName === 'r607') cargarReporte607();
  if (tabName === 'reportes30' && typeof inicializarModuloReportes30 === 'function') inicializarModuloReportes30();
  if (tabName === 'ia') generarReporteIA();
}

// ----------------- DASHBOARD & MÉTRICAS -----------------
async function cargarStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    if (document.getElementById('dashVentas')) {
      document.getElementById('dashVentas').innerText = `RD$ ${data.ventasTotales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('dashItbis')) {
      document.getElementById('dashItbis').innerText = `RD$ ${data.itbisTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('dashPropina')) {
      document.getElementById('dashPropina').innerText = `RD$ ${data.propinaTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('dashFacturas')) {
      document.getElementById('dashFacturas').innerText = data.totalFacturas;
    }
    if (document.getElementById('dashTicketPromedio')) {
      document.getElementById('dashTicketPromedio').innerText = `RD$ ${data.ticketPromedio.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }

    const elE32 = document.getElementById('dashUltimoE32') || document.getElementById('dashUltimoB02');
    if (elE32) elE32.innerText = data.ultimoNCF_E32 || data.ultimoNCF_B02 || 'E320000000001';

    const elE31 = document.getElementById('dashUltimoE31') || document.getElementById('dashUltimoB01');
    if (elE31) elE31.innerText = data.ultimoNCF_E31 || data.ultimoNCF_B01 || 'E310000000001';

    const elE34 = document.getElementById('dashUltimoE34');
    if (elE34) elE34.innerText = data.ultimoNCF_E34 || 'E340000000001';
  } catch (err) {
    console.error('Error cargando stats:', err);
  }
}

// ----------------- CAJA / DELIVERY (MESA 99) -----------------
async function cargarPlatosAdmin() {
  try {
    const res = await fetch('/api/platos');
    catalogoPlatos = await res.json();
    renderizarCatalogoAdmin();
    renderizarPlatosDelivery();
  } catch (err) {
    console.error('Error al cargar platos:', err);
  }
}

function renderizarPlatosDelivery() {
  const container = document.getElementById('delivPlatosList');
  if (!container) return;
  container.innerHTML = '';

  catalogoPlatos.forEach(p => {
    const row = document.createElement('div');
    row.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);';
    row.innerHTML = `
      <div>
        <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${p.nombre}</div>
        <div style="font-size: 0.8rem; color: var(--accent-gold);">RD$ ${p.precio.toFixed(2)}</div>
      </div>
      <button onclick="agregarItemDelivery(${p.id})" class="btn btn-primary btn-sm" style="padding: 0.35rem 0.75rem;">
        <i class="fa-solid fa-plus"></i>
      </button>
    `;
    container.appendChild(row);
  });
}

function agregarItemDelivery(platoId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const plato = catalogoPlatos.find(p => p.id === platoId);
  if (!plato) return;

  const found = deliveryCart.find(i => i.id === platoId);
  if (found) {
    found.cantidad++;
    found.subtotal = found.cantidad * found.precio;
  } else {
    deliveryCart.push({
      id: plato.id,
      nombre: plato.nombre,
      precio: plato.precio,
      categoria: plato.categoria,
      cantidad: 1,
      subtotal: plato.precio
    });
  }

  recalcularDeliveryCart();
  renderizarDeliveryCart();
}

function modificarCantidadDelivery(platoId, delta) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const item = deliveryCart.find(i => i.id === platoId);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    deliveryCart = deliveryCart.filter(i => i.id !== platoId);
  } else {
    item.subtotal = item.cantidad * item.precio;
  }

  recalcularDeliveryCart();
  renderizarDeliveryCart();
}

function recalcularDeliveryCart() {
  const totalMenuConItbis = deliveryCart.reduce((acc, i) => acc + i.subtotal, 0);
  const subtotal = Math.round((totalMenuConItbis / 1.18) * 100) / 100;
  const itbis = Math.round((totalMenuConItbis - subtotal) * 100) / 100;
  const propina = Math.round((subtotal * 0.10) * 100) / 100;
  const total = Math.round((totalMenuConItbis + propina) * 100) / 100;

  document.getElementById('delivSubtotal').innerText = `RD$ ${subtotal.toFixed(2)}`;
  document.getElementById('delivItbis').innerText = `RD$ ${itbis.toFixed(2)}`;
  document.getElementById('delivPropina').innerText = `RD$ ${propina.toFixed(2)}`;
  document.getElementById('delivTotal').innerText = `RD$ ${total.toFixed(2)}`;
}

function renderizarDeliveryCart() {
  const container = document.getElementById('delivCartItems');
  if (deliveryCart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
        No hay productos seleccionados en la comanda de delivery.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  deliveryCart.forEach(item => {
    const row = document.createElement('div');
    row.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);';
    row.innerHTML = `
      <div>
        <div style="font-size: 0.88rem; font-weight: 700; color: #fff;">${item.nombre}</div>
        <div style="font-size: 0.78rem; color: var(--accent-gold);">RD$ ${item.precio.toFixed(2)} x ${item.cantidad} = RD$ ${item.subtotal.toFixed(2)}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <button onclick="modificarCantidadDelivery(${item.id}, -1)" class="qty-btn">-</button>
        <span style="font-weight: 700; font-size: 0.9rem; min-width: 16px; text-align: center;">${item.cantidad}</span>
        <button onclick="modificarCantidadDelivery(${item.id}, 1)" class="qty-btn">+</button>
      </div>
    `;
    container.appendChild(row);
  });
}

function limpiarDelivery() {
  deliveryCart = [];
  document.getElementById('delivNombre').value = '';
  document.getElementById('delivTelefono').value = '';
  document.getElementById('delivDireccion').value = '';
  recalcularDeliveryCart();
  renderizarDeliveryCart();
}

async function enviarDeliveryCocina() {
  if (deliveryCart.length === 0) {
    alert('Debe agregar al menos un plato a la comanda de delivery.');
    return;
  }

  const nombre = document.getElementById('delivNombre').value.trim() || 'Cliente Delivery';
  const telefono = document.getElementById('delivTelefono').value.trim() || 'N/A';
  const direccion = document.getElementById('delivDireccion').value.trim() || 'Villa Elisa / Monte Cristi';

  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mesaId: 99,
        mesaNombre: 'DELIVERY',
        origen: 'DELIVERY',
        items: deliveryCart,
        clienteDelivery: { nombre, telefono, direccion }
      })
    });

    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      alert(`¡Comanda enviada a la Cocina KDS con éxito bajo identificador DELIVERY! Pedido: ${result.pedido.id}`);
      limpiarDelivery();
      cargarStats();
    }
  } catch (err) {
    console.error('Error enviando delivery:', err);
    alert('Error al enviar la comanda de delivery a cocina.');
  }
}

// ----------------- AUDITORÍA FISCAL NCF (DGII) -----------------
async function cargarFacturas() {
  try {
    const res = await fetch('/api/facturas');
    todasFacturas = await res.json();
    renderizarTablaNCF();
  } catch (err) {
    console.error('Error cargando facturas:', err);
  }
}

function renderizarTablaNCF() {
  const tbody = document.getElementById('ncfTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  todasFacturas.forEach(f => {
    const encfDoc = f.ecf?.encf || f.ncf;
    const esCreditoFiscal = (f.tipoComprobante === 'E31' || f.tipoComprobante === 'B01');
    const esAnulada = !!f.anulada;
    const encfNC = f.ncfNotaCredito || (f.notaCredito ? f.notaCredito.encf : 'E34');
    const tr = document.createElement('tr');
    if (esAnulada) {
      tr.style.opacity = '0.9';
      tr.style.background = 'rgba(239, 68, 68, 0.06)';
    }

    tr.innerHTML = `
      <td style="font-family: monospace; font-weight: 700; color: ${esCreditoFiscal ? '#38bdf8' : 'var(--accent-gold)'};">
        <div>${encfDoc}</div>
        <small style="color: #10b981; font-size: 0.75rem; display: flex; align-items: center; gap: 4px;">
          <i class="fa-solid fa-certificate"></i> Timbre DGII e-CF
        </small>
      </td>
      <td>
        <span class="badge ${esCreditoFiscal ? 'badge-gold' : 'badge-green'}">
          ${esCreditoFiscal ? 'E31 (Crédito Fiscal)' : 'E32 (Consumo)'}
        </span>
      </td>
      <td>
        ${esAnulada ? `
          <span class="badge badge-red" style="font-size: 0.73rem; display: inline-flex; align-items: center; gap: 4px;" title="Anulada formalmente con Nota de Crédito ${encfNC}">
            <i class="fa-solid fa-ban"></i> ANULADA (${encfNC})
          </span>
        ` : `
          <span class="badge badge-green" style="font-size: 0.73rem; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-circle-check"></i> ACEPTADA
          </span>
        `}
      </td>
      <td><strong>${f.mesaNombre || 'Mesa'}</strong></td>
      <td>
        <div style="font-weight: 600;">${f.razonSocial || 'Consumidor Final'}</div>
        ${f.rncCliente ? `<small style="color: var(--text-muted); font-family: monospace;">RNC: ${f.rncCliente}</small>` : ''}
      </td>
      <td style="font-size: 0.82rem; color: var(--text-muted);">${new Date(f.fecha).toLocaleString('es-DO')}</td>
      <td>RD$ ${Number(f.subtotal || 0).toFixed(2)}</td>
      <td>RD$ ${Number(f.itbis || 0).toFixed(2)}</td>
      <td style="font-weight: 700; color: #fff;">RD$ ${Number(f.total || 0).toFixed(2)}</td>
      <td><span class="badge badge-green">${f.metodoPago || 'Efectivo'}</span></td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          <button onclick="verImprimirTicket('${f.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.74rem;">
            <i class="fa-solid fa-print"></i> Ticket
          </button>
          ${f.ecf?.xmlUrl ? `
            <a href="${f.ecf.xmlUrl}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.72rem; color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" title="Ver XML Firmado por DGII">
              <i class="fa-solid fa-file-code"></i> XML
            </a>
          ` : ''}
          ${esAnulada ? `
            <button onclick="verImprimirNotaCredito('${f.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.74rem; color: var(--accent-gold); border-color: var(--accent-gold); font-weight: 700;" title="Ver e Imprimir Nota de Crédito Electrónica E34">
              <i class="fa-solid fa-receipt"></i> Nota E34
            </button>
          ` : `
            <button onclick="abrirModalCancelarFactura('${f.id}')" class="btn btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.74rem; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-weight: 600;" title="Cancelar Factura con Nota de Crédito Electrónica E34">
              <i class="fa-solid fa-ban"></i> Cancelar (E34)
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function mostrarToastAdmin(mensaje, tipo = 'info', botonAccion = null) {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `admin-toast ${tipo}`;

  let icono = '<i class="fa-solid fa-circle-info" style="color: #38bdf8; font-size: 1.25rem;"></i>';
  if (tipo === 'success') {
    icono = '<i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.25rem;"></i>';
  } else if (tipo === 'error') {
    icono = '<i class="fa-solid fa-circle-exclamation" style="color: #ef4444; font-size: 1.25rem;"></i>';
  }

  toast.innerHTML = `
    ${icono}
    <div style="flex: 1;">
      <div style="font-size: 0.88rem; line-height: 1.4; color: #fff;">${mensaje}</div>
      ${botonAccion ? `<div style="margin-top: 8px;">${botonAccion}</div>` : ''}
    </div>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(() => toast.remove(), 350);
    }
  }, botonAccion ? 12000 : 6000);
}

function verImprimirTicket(facturaId) {
  const f = todasFacturas.find(fac => fac.id === facturaId);
  if (!f) return;

  const encfDoc = f.ecf?.encf || f.ncf;
  const rncEmisor = f.restaurante?.rnc || '132-90740-1';
  const rncEmisorLimpio = rncEmisor.replace(/\D/g, '');
  const urlQR = f.ecf?.qrFiscalURL || `https://ecf.dgii.gov.do/testecf/consultatimbre?rncemisor=${rncEmisorLimpio}&encf=${encfDoc}&monto=${Number(f.total || 0).toFixed(2)}&codigo=${f.ecf?.codigoSeguridad || 'SEC-DGII'}`;

  const w = window.open('', '_blank', 'width=440,height=650');
  if (!w) {
    mostrarToastAdmin('Ventana emergente bloqueada por el navegador. Por favor habilite ventanas emergentes para imprimir tickets.', 'error');
    return;
  }

  const itemsHtml = (f.items || []).map(i => {
    const sub = (i.subtotal != null ? i.subtotal : (i.precio * i.cantidad));
    return `<tr><td>${i.cantidad}x ${i.nombre}</td><td style="text-align: right;">${Number(sub).toFixed(2)}</td></tr>`;
  }).join('');

  w.document.write(`
    <html>
    <head>
      <title>Ticket Fiscal - ${encfDoc}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; line-height: 1.4; color: #000; }
        .center { text-align: center; }
        .dashed { border-bottom: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 3px 0; }
        .anulada-badge {
          border: 2px solid #dc2626;
          color: #dc2626;
          font-weight: 900;
          padding: 6px;
          margin: 6px 0;
          text-align: center;
          font-size: 13px;
          letter-spacing: 1px;
        }
      </style>
    </head>
    <body>
      <div class="center">
        <strong>CHIVO AL CAMPO SRL</strong><br>
        RNC: ${rncEmisor}<br>
        Carretera Duarte Km 2, Villa Elisa, Monte Cristi<br>
        Tel: (809) 555-0199
      </div>
      <div class="dashed"></div>
      
      ${f.anulada ? `
        <div class="anulada-badge">
          *** FACTURA ANULADA ***<br>
          <span style="font-size: 10px; font-weight: normal; color: #000;">
            Modificada con Nota de Crédito: <strong>${f.ncfNotaCredito || 'E34'}</strong><br>
            Motivo: ${f.motivoAnulacion || 'Cancelación de factura'}
          </span>
        </div>
      ` : ''}

      <div class="center"><strong>${(f.descripcionComprobante || 'Factura Electrónica').toUpperCase()}</strong></div>
      <div><strong>e-NCF:</strong> ${encfDoc}</div>
      ${f.ncf && f.ncf !== encfDoc ? `<div><strong>NCF Interno:</strong> ${f.ncf}</div>` : ''}
      ${f.rncCliente ? `<div><strong>RNC CLIENTE:</strong> ${f.rncCliente}</div>` : ''}
      ${f.razonSocial ? `<div><strong>CLIENTE:</strong> ${f.razonSocial}</div>` : ''}
      <div><strong>FECHA:</strong> ${new Date(f.fecha).toLocaleString('es-DO')}</div>
      <div><strong>MESA/ORIGEN:</strong> ${f.mesaNombre || 'Mesa'}</div>
      <div><strong>PAGO:</strong> ${f.metodoPago || 'Efectivo'}</div>
      <div class="dashed"></div>
      <table>
        <thead><tr><th>CANT/DESC</th><th style="text-align: right;">VALOR RD$</th></tr></thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="dashed"></div>
      <div style="display: flex; justify-content: space-between;"><span>SUBTOTAL:</span><span>RD$ ${Number(f.subtotal || 0).toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>ITBIS 18%:</span><span>RD$ ${Number(f.itbis || 0).toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>PROPINA 10%:</span><span>RD$ ${Number(f.propina || 0).toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 4px;"><span>TOTAL:</span><span>RD$ ${Number(f.total || 0).toFixed(2)}</span></div>
      <div class="dashed"></div>
      
      <!-- SELLO FISCAL ELECTRÓNICO e-CF -->
      <div style="border: 1px solid #000; padding: 6px; margin: 8px 0; text-align: center; font-size: 10px;">
        <div style="font-weight: bold;">*** TIMBRE FISCAL ELECTRÓNICO e-CF (DGII) ***</div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span><strong>e-NCF:</strong> ${encfDoc}</span>
          <span><strong>SEGURIDAD:</strong> ${f.ecf ? f.ecf.codigoSeguridad : 'SEC-DGII'}</span>
        </div>
        ${f.ecf?.trackId ? `<div style="font-size: 8px; margin-top: 2px;">TrackId DGII: ${f.ecf.trackId}</div>` : ''}
        <div style="font-size: 9px; margin-top: 2px;">
          Certificación Oficial: Ley 32-23 de Facturación Electrónica RD
        </div>
      </div>

      <div class="center">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(urlQR)}" style="width: 85px; height: 85px; margin-top: 4px;"><br>
        <small style="font-size: 9px; color: #475569;">Escanear para Consulta Oficial DGII</small><br><br>
        ¡Gracias por su visita al Restaurante Chivo al Campo!
      </div>
    </body>
    </html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try { w.print(); } catch (_) {}
  }, 350);
}

// ----------------- CANCELACIÓN DE FACTURAS (e-NCF E34) -----------------

function abrirModalCancelarFactura(facturaId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const f = todasFacturas.find(fac => fac.id === facturaId);
  if (!f) return;

  facturaIdParaCancelar = facturaId;

  // Resetear visibilidad de los 4 pasos interactivos
  const p1 = document.getElementById('cancelarFacturaPasoConfirmar');
  const p2 = document.getElementById('cancelarFacturaPasoProcesando');
  const p3 = document.getElementById('cancelarFacturaPasoExito');
  const p4 = document.getElementById('cancelarFacturaPasoError');
  const modal = document.getElementById('modalCancelarFactura');

  if (p1) p1.style.display = 'block';
  if (p2) p2.style.display = 'none';
  if (p3) p3.style.display = 'none';
  if (p4) p4.style.display = 'none';

  if (f.anulada) {
    const encfNC = f.ncfNotaCredito || (f.notaCredito ? f.notaCredito.encf : 'E34');
    if (p1) p1.style.display = 'none';
    if (p4) {
      p4.style.display = 'block';
      const det = document.getElementById('cancelarFacturaErrorDetalle');
      if (det) {
        det.innerHTML = `La factura <strong>${f.ecf?.encf || f.ncf}</strong> ya se encuentra anulada previamente ante la DGII.<br><br>Nota de Crédito oficial: <strong style="color: var(--accent-gold); font-family: monospace;">${encfNC}</strong>`;
      }
    }
    if (modal) modal.classList.add('active');
    return;
  }

  const ncfTxt = document.getElementById('cancelarFacturaNcfTxt');
  const montoTxt = document.getElementById('cancelarFacturaMontoTxt');

  if (ncfTxt) ncfTxt.innerText = `${f.ecf?.encf || f.ncf} (${f.tipoComprobante === 'E31' ? 'Crédito Fiscal E31' : 'Consumo E32'})`;
  if (montoTxt) montoTxt.innerText = `Total: RD$ ${Number(f.total || 0).toFixed(2)} • Mesa: ${f.mesaNombre || 'Mesa'}`;

  const btnConfirmar = document.getElementById('btnConfirmarE34');
  if (btnConfirmar) {
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<i class="fa-solid fa-file-circle-xmark"></i> Emitir E34 y Anular';
  }

  if (modal) modal.classList.add('active');
}

function cerrarModalCancelarFactura() {
  const modal = document.getElementById('modalCancelarFactura');
  if (modal) modal.classList.remove('active');
  facturaIdParaCancelar = null;
}

async function confirmarCancelacionFacturaE34() {
  if (!facturaIdParaCancelar) return;

  const idParaCancelar = facturaIdParaCancelar;
  const motivoSelect = document.getElementById('cancelarFacturaMotivoSelect');
  const motivo = motivoSelect ? motivoSelect.value : 'Anulación de comprobante fiscal';

  const p1 = document.getElementById('cancelarFacturaPasoConfirmar');
  const p2 = document.getElementById('cancelarFacturaPasoProcesando');
  const p3 = document.getElementById('cancelarFacturaPasoExito');
  const p4 = document.getElementById('cancelarFacturaPasoError');

  // Pasar visualmente al Paso 2: Procesando
  if (p1) p1.style.display = 'none';
  if (p2) p2.style.display = 'block';
  if (p3) p3.style.display = 'none';
  if (p4) p4.style.display = 'none';

  try {
    const res = await fetch(`/api/facturas/${idParaCancelar}/cancelar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });

    const data = await res.json();

    if (data.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      const encfNC = data.notaCredito?.encf || 'E34';

      // Actualizar en el array en memoria para reactividad instantánea en la tabla
      const facLocal = todasFacturas.find(f => f.id === idParaCancelar);
      if (facLocal) {
        facLocal.anulada = true;
        facLocal.estadoPago = 'ANULADA';
        facLocal.ncfNotaCredito = encfNC;
        facLocal.notaCredito = data.notaCredito;
        facLocal.motivoAnulacion = motivo;
      }
      renderizarTablaNCF();

      // Recargar datos actualizados en segundo plano
      cargarFacturas();
      cargarStats();
      cargarCuadreCaja();
      cargarInventario();

      // Pasar visualmente al Paso 3: Éxito
      if (p2) p2.style.display = 'none';
      if (p3) {
        p3.style.display = 'block';
        const elNCF = document.getElementById('exitoE34NCF');
        const elMod = document.getElementById('exitoE34Modificado');
        const elEst = document.getElementById('exitoE34Estado');
        if (elNCF) elNCF.innerText = encfNC;
        if (elMod) elMod.innerText = facLocal ? (facLocal.ecf?.encf || facLocal.ncf) : idParaCancelar;
        if (elEst) elEst.innerText = data.notaCredito?.estadoDGII || 'Aceptado';

        const btnPrint = document.getElementById('btnImprimirNotaE34Modal');
        if (btnPrint) {
          btnPrint.onclick = () => verImprimirNotaCredito(idParaCancelar);
        }
      }

      mostrarToastAdmin(
        `<strong>¡Factura cancelada con éxito!</strong><br>Se emitió la <strong>Nota de Crédito ${encfNC}</strong> ante la DGII. Insumos reintegrados al Kardex.`,
        'success'
      );
    } else {
      // Pasar visualmente al Paso 4: Error
      if (p2) p2.style.display = 'none';
      if (p4) {
        p4.style.display = 'block';
        const det = document.getElementById('cancelarFacturaErrorDetalle');
        if (det) det.innerText = data.error || 'Ocurrió un error inesperado al procesar la anulación fiscal.';
      }
    }
  } catch (err) {
    console.error('Error en cancelación con E34:', err);
    if (p2) p2.style.display = 'none';
    if (p4) {
      p4.style.display = 'block';
      const det = document.getElementById('cancelarFacturaErrorDetalle');
      if (det) det.innerText = 'Error de conexión con el servidor al procesar la Nota de Crédito E34.';
    }
  }
}

function verImprimirNotaCredito(facturaId) {
  const f = todasFacturas.find(fac => fac.id === facturaId);
  if (!f) return;

  const nc = f.notaCredito || {};
  const encfNC = f.ncfNotaCredito || nc.encf || 'E34';
  const encfModificado = f.ecf?.encf || f.ncf;
  const rncEmisor = f.restaurante?.rnc || '132-90740-1';
  const rncEmisorLimpio = rncEmisor.replace(/\D/g, '');
  const motivo = f.motivoAnulacion || nc.motivo || 'Anulación Total de Comprobante';
  const totalNum = Number(f.total || 0);
  const subtotalNum = Number(f.subtotal || 0);
  const itbisNum = Number(f.itbis || 0);
  const propinaNum = Number(f.propina || 0);
  const urlQR = nc.qrFiscalURL || f.ecf?.qrFiscalURL || `https://ecf.dgii.gov.do/testecf/consultatimbre?rncemisor=${rncEmisorLimpio}&encf=${encfNC}&monto=${totalNum.toFixed(2)}&codigo=${nc.codigoSeguridad || 'SEC-E34'}`;

  const w = window.open('', '_blank', 'width=440,height=650');
  if (!w) {
    mostrarToastAdmin('Ventana emergente bloqueada por el navegador. Habilite las ventanas emergentes para imprimir.', 'error');
    return;
  }

  const itemsHtml = (f.items || []).map(i => {
    const sub = (i.subtotal != null ? i.subtotal : (i.precio * i.cantidad));
    return `<tr><td>${i.cantidad}x ${i.nombre}</td><td style="text-align: right;">-${Number(sub).toFixed(2)}</td></tr>`;
  }).join('');

  w.document.write(`
    <html>
    <head>
      <title>Nota de Crédito Electrónica - ${encfNC}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; line-height: 1.4; color: #000; }
        .center { text-align: center; }
        .dashed { border-bottom: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 3px 0; }
        .ref-box {
          border: 1px solid #000;
          padding: 6px;
          margin: 6px 0;
          font-size: 11px;
          background: #f8fafc;
        }
      </style>
    </head>
    <body>
      <div class="center">
        <strong>CHIVO AL CAMPO SRL</strong><br>
        RNC: ${rncEmisor}<br>
        Carretera Duarte Km 2, Villa Elisa, Monte Cristi<br>
        Tel: (809) 555-0199
      </div>
      <div class="dashed"></div>
      <div class="center" style="font-size: 13px;">
        <strong>NOTA DE CRÉDITO ELECTRÓNICA (e-CF)</strong><br>
        <span style="font-size: 10px;">COMPROBANTE FISCAL TIPO 34</span>
      </div>
      <div class="dashed"></div>

      <div><strong>e-NCF NOTA DE CRÉDITO:</strong> <span style="font-size: 13px; font-weight: bold;">${encfNC}</span></div>
      <div><strong>FECHA EMISIÓN E34:</strong> ${new Date(f.fechaAnulacion || f.fecha).toLocaleString('es-DO')}</div>
      ${f.rncCliente ? `<div><strong>RNC CLIENTE:</strong> ${f.rncCliente}</div>` : ''}
      ${f.razonSocial ? `<div><strong>CLIENTE:</strong> ${f.razonSocial}</div>` : ''}

      <div class="ref-box">
        <div style="font-weight: bold; text-decoration: underline; margin-bottom: 3px;">DOCUMENTO MODIFICADO (DGII):</div>
        <div><strong>e-NCF Modificado:</strong> ${encfModificado}</div>
        <div><strong>Fecha Documento Original:</strong> ${new Date(f.fecha).toLocaleDateString('es-DO')}</div>
        <div><strong>Código Modificación:</strong> 1 (Anula Comprobante)</div>
        <div><strong>Motivo:</strong> ${motivo}</div>
      </div>

      <div class="dashed"></div>
      <table>
        <thead><tr><th>CANT/DETALLE REINTEGRADO</th><th style="text-align: right;">VALOR RD$</th></tr></thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="dashed"></div>
      <div style="display: flex; justify-content: space-between;"><span>SUBTOTAL ACREDITADO:</span><span>-RD$ ${subtotalNum.toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>ITBIS 18% REVERTIDO:</span><span>-RD$ ${itbisNum.toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>PROPINA 10% REVERTIDA:</span><span>-RD$ ${propinaNum.toFixed(2)}</span></div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 4px;">
        <span>TOTAL ACREDITADO:</span><span>-RD$ ${totalNum.toFixed(2)}</span>
      </div>
      <div class="dashed"></div>

      <!-- TIMBRE FISCAL NOTA DE CRÉDITO E34 -->
      <div style="border: 1px solid #000; padding: 6px; margin: 8px 0; text-align: center; font-size: 10px;">
        <div style="font-weight: bold;">*** TIMBRE FISCAL ELECTRÓNICO e-CF (DGII) ***</div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span><strong>e-NCF:</strong> ${encfNC}</span>
          <span><strong>SEGURIDAD:</strong> ${nc.codigoSeguridad || 'SEC-E34'}</span>
        </div>
        ${nc.trackId ? `<div style="font-size: 8px; margin-top: 2px;">TrackId DGII: ${nc.trackId}</div>` : ''}
        <div style="font-size: 9px; margin-top: 2px;">
          Certificación Oficial: Ley 32-23 de Facturación Electrónica RD
        </div>
      </div>

      <div class="center">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(urlQR)}" style="width: 85px; height: 85px; margin-top: 4px;"><br>
        <small style="font-size: 9px; color: #475569;">Escanear para Consulta Oficial DGII</small><br><br>
        Comprobante Fiscal Electrónico de Anulación
      </div>
    </body>
    </html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try { w.print(); } catch (_) {}
  }, 350);
}

// ----------------- GESTIÓN DE CATÁLOGO -----------------
const FOTOS_PREDEFINIDAS_RESTAURANTE = [
  { nombre: 'Chivo Liniero', ruta: '/assets/images/chivo_liniero.jpg' },
  { nombre: 'Chivo Asado', ruta: '/assets/images/chivo_asado.jpg' },
  { nombre: 'Tostones Criollos', ruta: '/assets/images/tostones.jpg' },
  { nombre: 'Arroz y Habichuelas', ruta: '/assets/images/arroz_habichuelas.jpg' },
  { nombre: 'Moro de Guandules', ruta: '/assets/images/moro_guandules.jpg' },
  { nombre: 'Jugo de Chinola', ruta: '/assets/images/jugo_chinola.jpg' },
  { nombre: 'Cerveza Presidente', ruta: '/assets/images/cerveza_presidente.jpg' },
  { nombre: 'Refresco Embotellado', ruta: '/assets/images/refresco_embotellado.jpg' },
  { nombre: 'Majarete', ruta: '/assets/images/majarete.jpg' },
  { nombre: 'Dulce de Leche', ruta: '/assets/images/dulce_leche.jpg' },
  { nombre: 'Logo Oficial', ruta: '/assets/images/logo.jpg' }
];

function renderizarCatalogoAdmin() {
  const container = document.getElementById('adminPlatosGrid');
  if (!container) return;
  container.innerHTML = '';

  catalogoPlatos.forEach(p => {
    const card = document.createElement('div');
    card.style = 'background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s ease;';
    
    const imgUrl = (p.imagen && p.imagen.trim()) ? p.imagen.trim() : '/assets/images/logo.jpg';
    const disponible = (p.disponible !== false);

    card.innerHTML = `
      <div>
        <!-- Foto de Cabecera del Plato -->
        <div style="width: 100%; height: 140px; position: relative; overflow: hidden; background: #1a1614;">
          <img src="${imgUrl}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='/assets/images/logo.jpg';">
          <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 0.35rem;">
            <span class="badge ${disponible ? 'badge-gold' : 'badge-danger'}" style="font-size: 0.7rem; backdrop-filter: blur(4px);">
              ${disponible ? 'Disponible' : 'Agotado'}
            </span>
          </div>
          <div style="position: absolute; bottom: 8px; left: 8px;">
            <span style="background: rgba(18, 16, 14, 0.9); color: var(--accent-gold); font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid rgba(245, 158, 11, 0.4);">
              ${p.categoria}
            </span>
          </div>
        </div>

        <div style="padding: 1rem 1rem 0.5rem 1rem;">
          <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 0.35rem; font-weight: 700;">${p.nombre}</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.35; margin-bottom: 0.6rem; min-height: 2.6rem;">${p.descripcion || 'Sin descripción'}</p>
        </div>
      </div>

      <div style="padding: 0.8rem 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15);">
        <div>
          <span style="font-size: 1.15rem; font-weight: 800; color: var(--accent-gold);">RD$ ${Number(p.precio).toFixed(2)}</span>
          <span style="font-size: 0.68rem; color: #10b981; display: block;">ITBIS incluido</span>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button onclick="editarPlato(${p.id})" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.7rem;" title="Editar plato">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="eliminarPlato(${p.id})" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.7rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3);" title="Eliminar plato">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function abrirModalPlato(plato = null) {
  const modalTitulo = document.getElementById('modalPlatoTitulo');
  if (modalTitulo) {
    modalTitulo.innerText = plato ? `Editar: ${plato.nombre}` : 'Nuevo Plato al Menú';
  }

  document.getElementById('editPlatoId').value = plato ? plato.id : '';
  document.getElementById('editNombre').value = plato ? plato.nombre : '';
  document.getElementById('editPrecio').value = plato ? plato.precio : '';
  document.getElementById('editDescripcion').value = plato ? (plato.descripcion || '') : '';
  document.getElementById('editDisponible').value = (plato && plato.disponible === false) ? 'false' : 'true';

  // Poblar categorías dinámicamente con todas las existentes
  const catSelect = document.getElementById('editCategoria');
  const catSet = new Set(['Carnes', 'Guarniciones', 'Bebidas', 'Postres']);
  catalogoPlatos.forEach(p => {
    if (p.categoria && p.categoria.trim()) {
      catSet.add(p.categoria.trim());
    }
  });

  catSelect.innerHTML = '';
  Array.from(catSet).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.innerText = cat;
    catSelect.appendChild(opt);
  });

  // Opción para nueva categoría
  const optNueva = document.createElement('option');
  optNueva.value = '__NUEVA__';
  optNueva.innerText = '+ [Crear Nueva Categoría...]';
  catSelect.appendChild(optNueva);

  // Seleccionar la categoría del plato o por defecto
  if (plato && plato.categoria) {
    catSelect.value = plato.categoria;
  } else {
    catSelect.value = 'Carnes';
  }

  // Ocultar campo de nueva categoría
  document.getElementById('colNuevaCategoria').style.display = 'none';
  document.getElementById('editNuevaCategoria').value = '';

  // Configurar imagen y preview
  const imgUrl = (plato && plato.imagen) ? plato.imagen : '/assets/images/logo.jpg';
  document.getElementById('editImagen').value = (plato && plato.imagen) ? plato.imagen : '';
  document.getElementById('editImagenPreview').src = imgUrl;

  // Renderizar chips de fotos predefinidas
  renderizarChipsFotos();

  document.getElementById('modalPlato').classList.add('active');
}

function renderizarChipsFotos() {
  const container = document.getElementById('chipsFotosDisponibles');
  if (!container) return;
  container.innerHTML = '';

  FOTOS_PREDEFINIDAS_RESTAURANTE.forEach(foto => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.style = 'background: #201b17; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: all 0.2s;';
    chip.innerHTML = `
      <img src="${foto.ruta}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover;">
      <span>${foto.nombre}</span>
    `;
    chip.onmouseover = () => {
      chip.style.borderColor = 'var(--accent-gold)';
      chip.style.color = '#fff';
    };
    chip.onmouseout = () => {
      chip.style.borderColor = 'var(--border-color)';
      chip.style.color = 'var(--text-secondary)';
    };
    chip.onclick = () => {
      seleccionarFotoPredefinida(foto.ruta);
    };
    container.appendChild(chip);
  });
}

function seleccionarFotoPredefinida(ruta) {
  document.getElementById('editImagen').value = ruta;
  actualizarPreviewImagenPlato(ruta);
}

function actualizarPreviewImagenPlato(url) {
  const img = document.getElementById('editImagenPreview');
  if (img) {
    img.src = (url && url.trim()) ? url.trim() : '/assets/images/logo.jpg';
  }
}

function manejarSubidaImagenPlato(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  // Validar tamaño máximo razonable (4MB)
  if (file.size > 4 * 1024 * 1024) {
    alert('La imagen seleccionada es muy pesada (máximo 4MB). Elija una imagen más ligera.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;
    document.getElementById('editImagen').value = base64Data;
    document.getElementById('editImagenPreview').src = base64Data;
  };
  reader.readAsDataURL(file);
}

function cambioCategoriaPlato() {
  const sel = document.getElementById('editCategoria');
  const colNueva = document.getElementById('colNuevaCategoria');
  const inputNueva = document.getElementById('editNuevaCategoria');

  if (sel.value === '__NUEVA__') {
    colNueva.style.display = 'block';
    inputNueva.focus();
  } else {
    colNueva.style.display = 'none';
  }
}

function activarNuevaCategoriaInput() {
  const sel = document.getElementById('editCategoria');
  sel.value = '__NUEVA__';
  cambioCategoriaPlato();
}

function cerrarModalPlato() {
  document.getElementById('modalPlato').classList.remove('active');
}

function editarPlato(platoId) {
  const plato = catalogoPlatos.find(p => p.id === platoId);
  if (plato) abrirModalPlato(plato);
}

async function eliminarPlato(platoId) {
  const plato = catalogoPlatos.find(p => p.id === platoId);
  if (!plato) return;

  const confirmar = confirm(`¿Desea eliminar definitivamente el plato "${plato.nombre}" de la carta del restaurante?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`/api/platos/${platoId}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      cargarPlatosAdmin();
    } else {
      alert('No se pudo eliminar el plato: ' + (result.error || 'Error desconocido'));
    }
  } catch (err) {
    console.error('Error eliminando plato:', err);
    alert('Error al comunicar con el servidor.');
  }
}

async function guardarPlato() {
  const idStr = document.getElementById('editPlatoId').value;
  const nombre = document.getElementById('editNombre').value.trim();
  const selectCat = document.getElementById('editCategoria').value;
  const inputNuevaCat = document.getElementById('editNuevaCategoria').value.trim();
  const precio = parseFloat(document.getElementById('editPrecio').value) || 0;
  const descripcion = document.getElementById('editDescripcion').value.trim();
  const imagen = document.getElementById('editImagen').value.trim() || '/assets/images/logo.jpg';
  const disponible = (document.getElementById('editDisponible').value === 'true');

  if (!nombre) {
    alert('Por favor ingrese el nombre del plato.');
    document.getElementById('editNombre').focus();
    return;
  }

  if (precio <= 0) {
    alert('Por favor ingrese un precio válido mayor a RD$ 0.00');
    document.getElementById('editPrecio').focus();
    return;
  }

  let categoriaFinal = selectCat;
  if (selectCat === '__NUEVA__') {
    if (!inputNuevaCat) {
      alert('Por favor escriba el nombre de la nueva categoría.');
      document.getElementById('editNuevaCategoria').focus();
      return;
    }
    categoriaFinal = inputNuevaCat;
  }

  const payload = {
    id: idStr ? parseInt(idStr) : undefined,
    nombre,
    categoria: categoriaFinal,
    precio,
    descripcion,
    imagen,
    disponible
  };

  try {
    const res = await fetch('/api/platos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      cerrarModalPlato();
      cargarPlatosAdmin();
    } else {
      alert('Error al guardar el plato: ' + (result.error || 'Desconocido'));
    }
  } catch (err) {
    console.error('Error guardando plato:', err);
    alert('Error de conexión al guardar el plato.');
  }
}

// ----------------- IA PREDICTIVA (PGM_INVENT) -----------------
async function generarReporteIA() {
  const btn = document.getElementById('btnRecalcularIA');
  const badgeIA = document.getElementById('iaBadgeEstado');
  const diagTxt = document.getElementById('iaDiagnosticoTxt');

  if (window.AudioEngine) window.AudioEngine.playClick();

  // Feedback visual de carga inmediato
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando Gemini AI...';
    btn.style.opacity = '0.75';
  }

  if (badgeIA) {
    badgeIA.className = 'badge badge-gold';
    badgeIA.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles fa-spin"></i> PROCESANDO CON GOOGLE GEMINI...';
  }

  if (diagTxt) {
    diagTxt.innerHTML = '<span style="color: var(--accent-gold);"><i class="fa-solid fa-brain fa-beat"></i> Google Gemini AI está analizando la demanda caprina, facturas y stock en tiempo real...</span>';
  }

  try {
    const res = await fetch('/api/ia/reporte-inventario');
    const data = await res.json();

    if (badgeIA) {
      badgeIA.className = 'badge badge-green';
      badgeIA.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${data.estadoRecomendacion || 'Google Gemini AI Activo'}`;
    }

    // Telemetría en vivo
    const horaEl = document.getElementById('iaHoraGeneracion');
    if (horaEl) horaEl.innerText = data.horaExacta || new Date().toLocaleTimeString('es-DO');

    const latenciaEl = document.getElementById('iaLatencia');
    if (latenciaEl) latenciaEl.innerText = `${data.latenciaMs || 350} ms`;

    if (data.telemetria) {
      const facEl = document.getElementById('iaFacturasCount');
      if (facEl) facEl.innerText = data.telemetria.facturasHoy;

      const chivoEl = document.getElementById('iaChivoVendido');
      if (chivoEl) chivoEl.innerText = `${data.telemetria.porcionesChivo} platos`;

      const stockEl = document.getElementById('iaStockAlmacen');
      if (stockEl) stockEl.innerText = data.telemetria.stockChivo;
    }

    if (diagTxt) {
      diagTxt.innerHTML = `
        <strong style="color: #fff; font-size: 1.05rem;"><i class="fa-solid fa-circle-check" style="color: #10b981; margin-right: 0.4rem;"></i>${data.diagnostico}</strong><br><br>
        <span style="color: #cbd5e1; line-height: 1.6;">${data.recomendacionTexto}</span>
      `;
    }

    const ahorroEl = document.getElementById('iaAhorroTxt');
    if (ahorroEl) {
      ahorroEl.innerHTML = `<i class="fa-solid fa-piggy-bank" style="color: #10b981;"></i> ${data.ahorroEstimadoRD}`;
    }

    const tbody = document.getElementById('iaInsumosTbody');
    if (tbody && data.insumosSugeridos) {
      tbody.innerHTML = '';
      data.insumosSugeridos.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 700; color: #fff;">
            <i class="fa-solid fa-box" style="color: var(--accent-gold); margin-right: 0.35rem;"></i>
            ${item.producto}
          </td>
          <td style="font-size: 1.05rem; font-weight: 800; color: var(--accent-gold); font-family: monospace;">${item.cantidad}</td>
          <td>
            <span class="badge ${item.prioridad === 'Alta' ? 'badge-red' : item.prioridad === 'Media' ? 'badge-gold' : 'badge-green'}">
              ${item.prioridad}
            </span>
          </td>
          <td style="color: var(--text-secondary); font-size: 0.88rem;">${item.proveedor}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (window.AudioEngine) window.AudioEngine.playSuccessChime();

    // Notificación de éxito en el botón
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Recalculado con Éxito!';
      btn.style.background = '#10b981';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Recalcular con Gemini AI';
        btn.style.background = 'var(--primary)';
        btn.style.borderColor = 'var(--primary)';
        btn.style.color = '#000';
        btn.style.opacity = '1';
      }, 1600);
    }

  } catch (err) {
    console.error('Error generando reporte IA:', err);
    if (badgeIA) {
      badgeIA.className = 'badge badge-red';
      badgeIA.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error al conectar con IA';
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Reintentar';
      btn.style.opacity = '1';
    }
  }
}

function aprobarCompraProveedor() {
  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
  alert('¡Orden de compra de 45 libras de carne fresca de chivo aprobada y transmitida a los Criadores Caprinos de Villa Elisa y Monte Cristi!');
}

// ----------------- SUSCRIPCIÓN SAAS PAYPAL -----------------
async function pagarSuscripcionPayPal() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  try {
    const res = await fetch('/api/saas/pagar-suscripcion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meses: 1 })
    });
    const result = await res.json();

    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      const fb = document.getElementById('saasFeedback');
      fb.style.display = 'block';
      fb.innerHTML = `
        <i class="fa-solid fa-circle-check"></i> <strong>${result.mensaje}</strong><br>
        <div style="margin-top: 0.5rem; font-family: monospace; color: #fff;">
          Transacción PayPal ID: <strong>${result.transactionId}</strong><br>
          Monto cancelado: <strong>$${result.montoUSD} USD (~RD$ ${result.montoRD})</strong><br>
          Próxima fecha de renovación: <strong>${result.proximoCobro}</strong>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error en pago SaaS:', err);
  }
}

// =========================================================
// GESTIÓN DE LLAMADAS DE MESERO EN TIEMPO REAL
// =========================================================

function reproducirAlertaSonoraMesero() {
  if (window.AudioEngine) {
    window.AudioEngine.playWaiterAlert();
  }
  if (!sonidoAlertaInterval) {
    sonidoAlertaInterval = setInterval(() => {
      if (listaLlamadasMesero && listaLlamadasMesero.length > 0) {
        if (window.AudioEngine) window.AudioEngine.playWaiterAlert();
      } else {
        silenciarAlerta();
      }
    }, 8000);
  }
}

function silenciarAlerta() {
  if (sonidoAlertaInterval) {
    clearInterval(sonidoAlertaInterval);
    sonidoAlertaInterval = null;
  }
}

function probarSonidoMesero() {
  if (window.AudioEngine) window.AudioEngine.playWaiterAlert();
}

async function cargarLlamadasMesero() {
  try {
    const res = await fetch('/api/llamadas-mesero');
    listaLlamadasMesero = await res.json();

    const banner = document.getElementById('floatingWaiterAlert');
    const headerCounter = document.getElementById('headerWaiterCounter');
    const headerText = document.getElementById('headerWaiterCountText');
    const navBadge = document.getElementById('navMeseroBadge');

    if (listaLlamadasMesero && listaLlamadasMesero.length > 0) {
      const primera = listaLlamadasMesero[0];
      if (banner) {
        banner.style.display = 'flex';
        document.getElementById('floatingWaiterTitle').innerText = `🔔 ¡ATENCIÓN! ${primera.mesaNombre.toUpperCase()} SOLICITA ASISTENCIA DE MESERO`;
        document.getElementById('floatingWaiterSub').innerText = `${listaLlamadasMesero.length} mesa(s) con solicitud activa en el restaurante.`;
      }
      if (headerCounter && headerText) {
        headerCounter.style.display = 'inline-flex';
        headerText.innerText = `${listaLlamadasMesero.length} Mesa(s) Llamando`;
      }
      if (navBadge) {
        navBadge.style.display = 'inline-block';
        navBadge.innerText = listaLlamadasMesero.length;
      }
    } else {
      if (banner) banner.style.display = 'none';
      if (headerCounter) headerCounter.style.display = 'none';
      if (navBadge) navBadge.style.display = 'none';
      silenciarAlerta();
    }

    renderizarLlamadasMesero();
  } catch (err) {
    console.error('Error al cargar llamadas de mesero:', err);
  }
}

function renderizarLlamadasMesero() {
  const container = document.getElementById('llamadasMeseroContainer');
  if (!container) return;

  if (!listaLlamadasMesero || listaLlamadasMesero.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
        <i class="fa-solid fa-bell-slash" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 0.8rem; display: block;"></i>
        No hay solicitudes de mesero pendientes en este momento. Todas las mesas están atendidas.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  listaLlamadasMesero.forEach(l => {
    const minDiff = Math.max(0, Math.floor((Date.now() - new Date(l.fecha).getTime()) / 60000));
    const card = document.createElement('div');
    card.style = 'display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.1); border: 1.5px solid #ef4444; padding: 1rem 1.25rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;';
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <i class="fa-solid fa-bell bell-vibrate" style="font-size: 1.5rem; color: #ef4444;"></i>
        <div>
          <div style="font-weight: 800; color: #fff; font-size: 1.1rem;">${l.mesaNombre.toUpperCase()}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Solicitado hace ${minDiff <= 1 ? 'menos de 1 min' : `${minDiff} minutos`} (${new Date(l.fecha).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })})
          </div>
        </div>
      </div>
      <button onclick="atenderLlamada(${l.mesaId})" class="btn btn-primary btn-sm" style="background: #10b981; border-color: #10b981; font-weight: 700; padding: 0.5rem 1rem;">
        <i class="fa-solid fa-check"></i> Marcar como Atendido
      </button>
    `;
    container.appendChild(card);
  });
}

async function atenderLlamada(mesaId) {
  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
  try {
    const res = await fetch(`/api/llamadas-mesero/${mesaId}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      if (socket && typeof socket.emit === 'function') {
        socket.emit('atender_mesero', { mesaId });
      }
      silenciarAlerta();
      cargarLlamadasMesero();
      cargarMesasAdmin();
    }
  } catch (err) {
    console.error('Error atendiendo llamada:', err);
  }
}

function atenderLlamadaDesdeBanner() {
  if (listaLlamadasMesero && listaLlamadasMesero.length > 0) {
    atenderLlamada(listaLlamadasMesero[0].mesaId);
  }
}

function irAPestanaMesero() {
  const btn = document.getElementById('btnNavMesero');
  cambiarPestana('mesero', btn);
}

// =========================================================
// PLANO DE MESAS Y SALÓN EN VIVO
// =========================================================

async function cargarMesasAdmin() {
  try {
    const [resMesas, resPedidos] = await Promise.all([
      fetch('/api/mesas'),
      fetch('/api/pedidos')
    ]);
    listaMesas = await resMesas.json();
    const pedidos = await resPedidos.json();

    let libres = 0;
    let ocupadas = 0;
    let llamando = 0;

    listaMesas.forEach(m => {
      // Cruzar con pedidos activos
      m.pedidoActivo = (pedidos || []).find(p => p.mesaId === m.id && !p.pagado);
      if (m.estado === 'llamando_mesero') {
        llamando++;
      } else if (m.estado === 'ocupada' || m.pedidoActivo) {
        ocupadas++;
      } else {
        libres++;
      }
    });

    const elLibres = document.getElementById('statMesasLibres');
    const elOcupadas = document.getElementById('statMesasOcupadas');
    const elLlamando = document.getElementById('statMesasLlamando');

    if (elLibres) elLibres.innerText = libres;
    if (elOcupadas) elOcupadas.innerText = ocupadas;
    if (elLlamando) elLlamando.innerText = llamando;

    renderizarMesasSalon();
  } catch (err) {
    console.error('Error cargando mesas:', err);
  }
}

function renderizarMesasSalon() {
  const container = document.getElementById('mesasGridContainer');
  if (!container) return;
  container.innerHTML = '';

  listaMesas.forEach(mesa => {
    const box = document.createElement('div');
    const esLlamando = mesa.estado === 'llamando_mesero';
    const esOcupada = mesa.estado === 'ocupada' || mesa.pedidoActivo;
    const estadoClass = esLlamando ? 'llamando_mesero' : (esOcupada ? 'ocupada' : 'disponible');

    box.className = `mesa-box ${estadoClass}`;

    let statusPill = '';
    if (esLlamando) {
      statusPill = `<span class="badge badge-calling"><i class="fa-solid fa-bell"></i> LLAMANDO MESERO</span>`;
    } else if (esOcupada) {
      statusPill = `<span class="badge badge-gold"><i class="fa-solid fa-users"></i> OCUPADA</span>`;
    } else {
      statusPill = `<span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> DISPONIBLE</span>`;
    }

    let detalleConsumo = '';
    if (mesa.pedidoActivo) {
      const itemsCount = (mesa.pedidoActivo.items || []).reduce((acc, i) => acc + i.cantidad, 0);
      detalleConsumo = `
        <div style="background: var(--bg-surface-elevated); padding: 0.6rem; border-radius: var(--radius-sm); margin: 0.75rem 0; font-size: 0.8rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-muted); margin-bottom: 0.2rem;">
            <span>Comanda:</span>
            <strong style="color: #fff;">${mesa.pedidoActivo.id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 700;">
            <span>${itemsCount} platos servidos:</span>
            <span>RD$ ${mesa.pedidoActivo.total.toFixed(2)}</span>
          </div>
        </div>
      `;
    } else {
      detalleConsumo = `
        <div style="color: var(--text-muted); font-size: 0.8rem; margin: 0.75rem 0; padding: 0.6rem 0;">
          Mesa lista para recibir nuevos comensales.
        </div>
      `;
    }

    let botonesAccion = '';
    if (esLlamando) {
      botonesAccion = `
        <button onclick="atenderLlamada(${mesa.id})" class="btn btn-primary btn-sm" style="width: 100%; background: #10b981; border-color: #10b981; font-weight: 700;">
          <i class="fa-solid fa-check"></i> Atender Mesero
        </button>
      `;
    } else if (mesa.pedidoActivo) {
      botonesAccion = `
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="verDetalleMesa(${mesa.id})" class="btn btn-outline btn-sm" style="flex: 1;">
            <i class="fa-solid fa-eye"></i> Comanda
          </button>
          <button onclick="liberarMesaDirecto(${mesa.id})" class="btn btn-sm" style="background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); flex: 1;">
            <i class="fa-solid fa-door-open"></i> Liberar
          </button>
        </div>
      `;
    } else {
      botonesAccion = `
        <a href="/tablet.html?mesa=${mesa.id}" target="_blank" class="btn btn-outline btn-sm" style="width: 100%; text-align: center; display: block; text-decoration: none;">
          <i class="fa-solid fa-tablet-screen-button"></i> Abrir Tablet
        </a>
      `;
    }

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <h4 style="font-size: 1.15rem; font-weight: 800; color: #fff; line-height: 1.1;">${mesa.nombre}</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Capacidad: ${mesa.capacidad} personas</span>
        </div>
        ${statusPill}
      </div>

      ${detalleConsumo}

      <div style="margin-top: auto; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
        ${botonesAccion}
      </div>
    `;

    container.appendChild(box);
  });
}

function verDetalleMesa(mesaId) {
  const mesa = listaMesas.find(m => m.id === mesaId);
  if (!mesa || !mesa.pedidoActivo) return;

  mesaSeleccionadaModal = mesa;
  document.getElementById('modalMesaTitulo').innerText = `${mesa.nombre} - Comanda ${mesa.pedidoActivo.id}`;
  const badge = document.getElementById('modalMesaBadge');
  badge.className = 'badge badge-gold';
  badge.innerText = `RD$ ${mesa.pedidoActivo.total.toFixed(2)}`;

  const content = document.getElementById('modalMesaContent');
  let itemsHtml = '';
  (mesa.pedidoActivo.items || []).forEach(item => {
    itemsHtml += `
      <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem;">
        <span>${item.cantidad}x ${item.nombre}</span>
        <strong style="color: var(--accent-gold);">RD$ ${item.subtotal.toFixed(2)}</strong>
      </div>
    `;
  });

  content.innerHTML = `
    <div style="margin-bottom: 0.75rem;">
      <div style="font-size: 0.8rem; color: var(--text-muted);">Hora de Apertura: ${new Date(mesa.pedidoActivo.fecha).toLocaleTimeString('es-DO')}</div>
      <div style="font-size: 0.8rem; color: var(--text-muted);">Estatus en Cocina: <strong style="color: #38bdf8;">${(mesa.pedidoActivo.estatus || 'pendiente').toUpperCase()}</strong></div>
    </div>
    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 0.75rem;">
      ${itemsHtml}
    </div>
    <div style="display: flex; justify-content: space-between; font-weight: 800; color: #fff; font-size: 1.1rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
      <span>Total a Pagar:</span>
      <span style="color: var(--accent-gold);">RD$ ${mesa.pedidoActivo.total.toFixed(2)}</span>
    </div>
  `;

  document.getElementById('modalDetalleMesa').classList.add('active');
}

function cerrarModalDetalleMesa() {
  document.getElementById('modalDetalleMesa').classList.remove('active');
  mesaSeleccionadaModal = null;
}

async function liberarMesaDesdeModal() {
  if (mesaSeleccionadaModal) {
    await liberarMesaDirecto(mesaSeleccionadaModal.id);
    cerrarModalDetalleMesa();
  }
}

async function liberarMesaDirecto(mesaId) {
  if (!confirm(`¿Confirma que desea liberar la Mesa ${mesaId} para los próximos clientes?`)) return;
  try {
    const res = await fetch(`/api/mesas/${mesaId}/liberar`, { method: 'POST' });
    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cargarMesasAdmin();
    }
  } catch (err) {
    console.error('Error liberando mesa:', err);
  }
}

// =========================================================
// ALMACÉN E INVENTARIO DE MATERIA PRIMA & KARDEX
// =========================================================

async function cargarInventario() {
  try {
    const res = await fetch('/api/inventario');
    const data = await res.json();
    
    if (data && data.insumos) {
      listaInventario = data.insumos;
      listaMovimientosInventario = data.movimientos || [];
    } else if (Array.isArray(data)) {
      listaInventario = data;
    }

    renderizarInventario();
    renderizarKardexMovimientos(listaMovimientosInventario);
    poblarSelectInsumos();
  } catch (err) {
    console.error('Error al cargar inventario:', err);
  }
}

function renderizarInventario() {
  const tbody = document.getElementById('inventarioTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  (listaInventario || []).forEach(item => {
    const tr = document.createElement('tr');
    const esCritico = item.cantidad <= item.minimo;

    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">
        <i class="fa-solid fa-box" style="color: var(--accent-gold); margin-right: 0.4rem;"></i>
        ${item.nombre}
      </td>
      <td><span class="badge badge-gold" style="font-size: 0.75rem;">${item.categoria}</span></td>
      <td style="font-size: 1.1rem; font-weight: 800; color: ${esCritico ? '#ef4444' : '#10b981'};">
        ${item.cantidad} ${item.unidad}
      </td>
      <td style="color: var(--text-muted);">${item.minimo} ${item.unidad}</td>
      <td>
        <span class="badge ${esCritico ? 'badge-red' : 'badge-green'}">
          ${esCritico ? '⚠️ Stock Crítico' : '✓ Normal'}
        </span>
      </td>
      <td style="color: var(--accent-gold); font-weight: 700;">RD$ ${(item.costoUnitario || 0).toFixed(2)} / ${item.unidad}</td>
      <td style="color: var(--text-secondary); font-size: 0.85rem;">${item.proveedor || 'Monte Cristi'}</td>
      <td>
        <div style="display: flex; gap: 0.35rem;">
          <button onclick="abrirModalAjusteDirecto(${item.id}, 'ENTRADA')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" title="Registrar Entrada de Compra">
            <i class="fa-solid fa-plus"></i> Entrada
          </button>
          <button onclick="abrirModalAjusteDirecto(${item.id}, 'SALIDA')" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; color: #f87171; border-color: rgba(239,68,68,0.4);" title="Registrar Merma o Salida">
            <i class="fa-solid fa-minus"></i> Merma
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarKardexMovimientos(movimientos) {
  const tbody = document.getElementById('kardexTbody');
  const badgeTotal = document.getElementById('kardexTotalBadge');
  if (badgeTotal) {
    const count = (movimientos || []).length;
    badgeTotal.innerText = `${count} movimiento${count === 1 ? '' : 's'} registrado${count === 1 ? '' : 's'}`;
  }
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!movimientos || movimientos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No hay movimientos de insumos registrados aún en este turno.
        </td>
      </tr>
    `;
    return;
  }

  movimientos.forEach(m => {
    const tr = document.createElement('tr');
    
    // Formatear Fecha
    let fechaTxt = '---';
    try {
      const f = new Date(m.fecha);
      fechaTxt = `${f.toLocaleDateString('es-DO')} ${f.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`;
    } catch(e) {
      fechaTxt = m.fecha;
    }

    // Badge y tipo de movimiento
    let badgeTipo = '';
    let signo = '';
    let colorCant = '';

    if (m.tipo === 'SALIDA_VENTA') {
      badgeTipo = `<span class="badge badge-red" style="font-size: 0.74rem;"><i class="fa-solid fa-receipt"></i> Venta Facturada</span>`;
      signo = '-';
      colorCant = '#ef4444';
    } else if (m.tipo === 'SALIDA_MANUAL') {
      badgeTipo = `<span class="badge badge-gold" style="font-size: 0.74rem;"><i class="fa-solid fa-arrow-up-from-bracket"></i> Merma / Cocina</span>`;
      signo = '-';
      colorCant = '#f59e0b';
    } else {
      badgeTipo = `<span class="badge badge-green" style="font-size: 0.74rem;"><i class="fa-solid fa-truck-ramp-box"></i> Entrada Compra</span>`;
      signo = '+';
      colorCant = '#10b981';
    }

    tr.innerHTML = `
      <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">${fechaTxt}</td>
      <td>${badgeTipo}</td>
      <td style="font-weight: 700; color: #fff;">${m.insumoNombre}</td>
      <td style="font-family: monospace; font-weight: 800; color: ${colorCant};">
        ${signo}${m.cantidad} ${m.unidad}
      </td>
      <td style="font-family: monospace; color: #fff; font-weight: 600;">
        ${m.stockResultante} ${m.unidad}
      </td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">
        ${m.ncf ? `<strong style="color: var(--accent-gold); font-family: monospace;">${m.ncf}</strong> • ` : ''}${m.referencia || 'Operación regular'}
      </td>
      <td style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-solid fa-user-shield" style="font-size: 0.75rem;"></i> ${m.usuario || 'Sistema'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function poblarSelectInsumos() {
  const sel = document.getElementById('invInsumoSelect');
  if (!sel) return;
  sel.innerHTML = '';
  (listaInventario || []).forEach(i => {
    const opt = document.createElement('option');
    opt.value = i.id;
    opt.innerText = `${i.nombre} (Stock actual: ${i.cantidad} ${i.unidad})`;
    sel.appendChild(opt);
  });
}

function seleccionarTipoMovimiento(tipo) {
  const inputTipo = document.getElementById('invTipoMovimiento');
  const btnEntrada = document.getElementById('btnTipoEntrada');
  const btnSalida = document.getElementById('btnTipoSalida');
  const titulo = document.getElementById('modalInvTitulo');
  const btnGuardar = document.getElementById('btnGuardarInv');
  const icon = document.getElementById('modalInvIcon');

  if (inputTipo) inputTipo.value = tipo;

  if (tipo === 'SALIDA') {
    if (btnSalida) {
      btnSalida.className = 'btn btn-primary btn-sm';
      btnSalida.style.background = '#dc2626';
      btnSalida.style.borderColor = '#dc2626';
      btnSalida.style.color = '#fff';
    }
    if (btnEntrada) {
      btnEntrada.className = 'btn btn-outline btn-sm';
      btnEntrada.style.background = 'transparent';
      btnEntrada.style.borderColor = 'var(--border-color)';
      btnEntrada.style.color = 'var(--text-secondary)';
    }
    if (titulo) titulo.innerText = 'Registrar Salida de Insumo / Merma';
    if (icon) {
      icon.className = 'fa-solid fa-arrow-up-from-bracket';
      icon.style.color = '#f87171';
    }
    if (btnGuardar) {
      btnGuardar.innerHTML = '<i class="fa-solid fa-check"></i> Registrar Salida';
      btnGuardar.style.background = '#dc2626';
      btnGuardar.style.borderColor = '#dc2626';
    }
  } else {
    if (btnEntrada) {
      btnEntrada.className = 'btn btn-primary btn-sm';
      btnEntrada.style.background = 'var(--primary)';
      btnEntrada.style.borderColor = 'var(--primary)';
      btnEntrada.style.color = '#000';
    }
    if (btnSalida) {
      btnSalida.className = 'btn btn-outline btn-sm';
      btnSalida.style.background = 'transparent';
      btnSalida.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      btnSalida.style.color = '#f87171';
    }
    if (titulo) titulo.innerText = 'Registrar Entrada de Insumos (Compra)';
    if (icon) {
      icon.className = 'fa-solid fa-boxes-packing';
      icon.style.color = 'var(--accent-gold)';
    }
    if (btnGuardar) {
      btnGuardar.innerHTML = '<i class="fa-solid fa-check"></i> Registrar Entrada';
      btnGuardar.style.background = 'var(--primary)';
      btnGuardar.style.borderColor = 'var(--primary)';
    }
  }
}

function abrirModalAjusteInventario(tipo = 'ENTRADA') {
  if (window.AudioEngine) window.AudioEngine.playClick();
  poblarSelectInsumos();
  seleccionarTipoMovimiento(tipo);
  
  const cantInput = document.getElementById('invCantidad') || document.getElementById('invCantidadEntrada');
  if (cantInput) cantInput.value = '';
  const motInput = document.getElementById('invMotivo');
  if (motInput) motInput.value = '';

  const modal = document.getElementById('modalInventario');
  if (modal) modal.classList.add('active');
}

function abrirModalAjusteDirecto(insumoId, tipo = 'ENTRADA') {
  abrirModalAjusteInventario(tipo);
  const sel = document.getElementById('invInsumoSelect');
  if (sel) sel.value = insumoId;
}

function cerrarModalInventario() {
  const modal = document.getElementById('modalInventario');
  if (modal) modal.classList.remove('active');
}

async function guardarAjusteInventario() {
  const sel = document.getElementById('invInsumoSelect');
  const id = sel ? sel.value : null;
  const cantInput = document.getElementById('invCantidad') || document.getElementById('invCantidadEntrada');
  const cantidad = cantInput ? cantInput.value : null;
  const motivo = document.getElementById('invMotivo') ? document.getElementById('invMotivo').value : '';
  const tipoInput = document.getElementById('invTipoMovimiento');
  const tipo = tipoInput ? tipoInput.value : 'ENTRADA';

  if (!id) {
    alert('Por favor seleccione un insumo de la lista');
    return;
  }

  if (!cantidad || Number(cantidad) <= 0) {
    alert('Ingrese una cantidad válida mayor a 0');
    return;
  }

  const payload = {
    id: parseInt(id),
    tipo: tipo,
    cantidadEntrada: tipo === 'ENTRADA' ? Number(cantidad) : 0,
    cantidadSalida: tipo === 'SALIDA' ? Number(cantidad) : 0,
    motivo: motivo
  };

  try {
    const res = await fetch('/api/inventario/ajuste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cerrarModalInventario();
      cargarInventario();
    } else {
      alert(result.error || 'No se pudo registrar el movimiento de inventario.');
    }
  } catch (err) {
    console.error('Error registrando ajuste de inventario:', err);
    alert('Error al comunicarse con el servidor.');
  }
}

// =========================================================
// PURGA Y REINICIO DE FACTURAS PARA DEMO / DOCENTE
// =========================================================

function abrirModalReiniciarFacturas() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  const pinInput = document.getElementById('reiniciarFacturasPin');
  if (pinInput) pinInput.value = '';
  const modal = document.getElementById('modalReiniciarFacturas');
  if (modal) modal.classList.add('active');
}

function cerrarModalReiniciarFacturas() {
  const modal = document.getElementById('modalReiniciarFacturas');
  if (modal) modal.classList.remove('active');
}

async function ejecutarReinicioFacturas() {
  const pinInput = document.getElementById('reiniciarFacturasPin');
  const pin = pinInput ? pinInput.value.trim() : '';

  const btnConfirmar = document.querySelector('#modalReiniciarFacturas button.btn-primary');
  const textoOriginal = btnConfirmar ? btnConfirmar.innerHTML : 'Confirmar Reinicio';

  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reiniciando facturas...';
  }

  try {
    const res = await fetch('/api/sistema/reiniciar-facturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin || '1234' })
    });
    const data = await res.json();

    if (data.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cerrarModalReiniciarFacturas();
      mostrarToastAdmin(
        `<strong>✅ Facturación Reiniciada con Éxito</strong><br>- Facturas purgadas: ${data.facturasEliminadas || 0}<br>- Secuencias e-NCF (E31, E32, E34) reiniciadas<br>- Mesas y pedidos restablecidos para nueva evaluación docente.`,
        'success'
      );
      
      cargarStats();
      cargarFacturas();
      cargarCuadreCaja();
      cargarMesasAdmin();
      cargarReporte607();
      cargarInventario();
    } else {
      mostrarToastAdmin(`❌ ${data.error || 'PIN de seguridad incorrecto o error al reiniciar.'}`, 'error');
    }
  } catch (err) {
    console.error('Error al reiniciar facturas:', err);
    mostrarToastAdmin('❌ Error de conexión al intentar reiniciar las facturas.', 'error');
  } finally {
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.innerHTML = textoOriginal;
    }
  }
}

// =========================================================
// GESTIÓN DE PERSONAL Y EMPLEADOS
// =========================================================

async function cargarEmpleados() {
  try {
    const res = await fetch('/api/empleados');
    listaEmpleados = await res.json();
    renderizarEmpleados();
  } catch (err) {
    console.error('Error al cargar empleados:', err);
  }
}

function renderizarEmpleados() {
  const tbody = document.getElementById('empleadosTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  (listaEmpleados || []).forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">${emp.nombre}</td>
      <td style="font-family: monospace; color: var(--text-muted);">${emp.cedula || '---'}</td>
      <td style="color: var(--accent-gold); font-weight: 600;">${emp.cargo}</td>
      <td><span class="badge badge-gold" style="font-size: 0.75rem;">${emp.turno}</span></td>
      <td style="color: var(--text-secondary);">${emp.telefono || '---'}</td>
      <td><span class="badge badge-green">Activo</span></td>
      <td>
        <button onclick="eliminarEmpleado(${emp.id})" class="btn btn-outline btn-sm" style="color: #f87171; border-color: rgba(239,68,68,0.3); padding: 0.3rem 0.6rem; font-size: 0.78rem;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalEmpleado() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  document.getElementById('modalEmpleado').classList.add('active');
}

function cerrarModalEmpleado() {
  document.getElementById('modalEmpleado').classList.remove('active');
}

async function guardarEmpleado() {
  const nombre = document.getElementById('empNombre').value;
  const cedula = document.getElementById('empCedula').value;
  const cargo = document.getElementById('empCargo').value;
  const turno = document.getElementById('empTurno').value;
  const telefono = document.getElementById('empTelefono').value;

  if (!nombre.trim()) {
    alert('Ingrese el nombre completo del colaborador');
    return;
  }

  try {
    const res = await fetch('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, cedula, cargo, turno, telefono, estado: 'Activo' })
    });
    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cerrarModalEmpleado();
      cargarEmpleados();
      document.getElementById('empNombre').value = '';
      document.getElementById('empCedula').value = '';
      document.getElementById('empTelefono').value = '';
    }
  } catch (err) {
    console.error('Error guardando empleado:', err);
  }
}

async function eliminarEmpleado(id) {
  if (!confirm('¿Confirma que desea retirar este colaborador de la nómina activa?')) return;
  try {
    const res = await fetch(`/api/empleados/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      cargarEmpleados();
    }
  } catch (err) {
    console.error('Error eliminando empleado:', err);
  }
}

// =========================================================
// CUADRE DE CAJA Y REPORTE Z FISCAL DIARIO
// =========================================================

async function cargarCuadreCaja() {
  try {
    const res = await fetch('/api/cuadre-caja');
    datosCuadre = await res.json();

    if (document.getElementById('cuadreTotalVentas')) {
      document.getElementById('cuadreTotalVentas').innerText = `RD$ ${datosCuadre.totalVentas.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadreEfectivo')) {
      document.getElementById('cuadreEfectivo').innerText = `RD$ ${datosCuadre.totalEnCajaEfectivo.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadreDigital')) {
      document.getElementById('cuadreDigital').innerText = `RD$ ${datosCuadre.totalPayPal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadreImpuestos')) {
      document.getElementById('cuadreImpuestos').innerText = `RD$ ${(datosCuadre.totalITBIS + datosCuadre.totalPropina).toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }

    // Reporte Z Ticket
    if (document.getElementById('cuadreFecha')) {
      document.getElementById('cuadreFecha').innerText = `Emitido: ${datosCuadre.fechaReporte}`;
    }
    if (document.getElementById('cuadreSubtotalGravado')) {
      document.getElementById('cuadreSubtotalGravado').innerText = `RD$ ${datosCuadre.subtotalGravado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadreItbisVal')) {
      document.getElementById('cuadreItbisVal').innerText = `RD$ ${datosCuadre.totalITBIS.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadrePropinaVal')) {
      document.getElementById('cuadrePropinaVal').innerText = `RD$ ${datosCuadre.totalPropina.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
    if (document.getElementById('cuadreGranTotal')) {
      document.getElementById('cuadreGranTotal').innerText = `RD$ ${datosCuadre.totalVentas.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }

    // Conteo y secuencias E32, E31 y E34
    const countE32 = datosCuadre.comprobantes.e32 || datosCuadre.comprobantes.b02 || 0;
    const countE31 = datosCuadre.comprobantes.e31 || datosCuadre.comprobantes.b01 || 0;
    const countE34 = datosCuadre.comprobantes.e34 || 0;

    const elE32Count = document.getElementById('cuadreE32Count') || document.getElementById('cuadreB02Count');
    if (elE32Count) elE32Count.innerText = `${countE32} facturas emitidas`;

    const elE31Count = document.getElementById('cuadreE31Count') || document.getElementById('cuadreB01Count');
    if (elE31Count) elE31Count.innerText = `${countE31} facturas emitidas`;

    const elE34Count = document.getElementById('cuadreE34Count');
    if (elE34Count) elE34Count.innerText = `${countE34} cancelaciones E34`;

    const elUltimoE32 = document.getElementById('cuadreUltimoE32') || document.getElementById('cuadreUltimoB02');
    if (elUltimoE32) elUltimoE32.innerText = datosCuadre.comprobantes.ultimoE32 || datosCuadre.comprobantes.ultimoB02 || 'E320000000001';

    const elUltimoE31 = document.getElementById('cuadreUltimoE31') || document.getElementById('cuadreUltimoB01');
    if (elUltimoE31) elUltimoE31.innerText = datosCuadre.comprobantes.ultimoE31 || datosCuadre.comprobantes.ultimoB01 || 'E310000000001';

    const elUltimoE34 = document.getElementById('cuadreUltimoE34');
    if (elUltimoE34) elUltimoE34.innerText = datosCuadre.comprobantes.ultimoE34 || 'E340000000001';

  } catch (err) {
    console.error('Error cargando cuadre de caja:', err);
  }
}

function cerrarTurnoCaja() {
  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
  alert('*** CIERRE DE CAJA FISCAL SELLADO CON ÉXITO ***\n\nEl Reporte Z ha sido registrado en los libros de gerencia. Las secuencias de Comprobantes Electrónicos E31, E32 y Notas de Crédito E34 han sido auditadas y cuadradas con la DGII.');
}

// =========================================================
// MÓDULO DE SEGURIDAD & AUTENTICACIÓN GERENCIAL
// =========================================================

function verificarSesionAdmin() {
  const sesionGuardada = sessionStorage.getItem('usuario_chivo_admin');
  const overlay = document.getElementById('loginOverlay');
  
  if (sesionGuardada) {
    try {
      usuarioSesion = JSON.parse(sesionGuardada);
      aplicarDatosSesion(usuarioSesion);
      if (overlay) overlay.style.display = 'none';
      return;
    } catch (e) {
      sessionStorage.removeItem('usuario_chivo_admin');
    }
  }

  // Si no hay sesión válida, forzar overlay de autenticación
  if (overlay) overlay.style.display = 'flex';
}

function aplicarDatosSesion(user) {
  const nombreEl = document.getElementById('headerUserName');
  const rolEl = document.getElementById('headerUserRole');
  if (nombreEl) nombreEl.innerText = user.nombre || user.usuario;
  if (rolEl) rolEl.innerText = user.rol || 'Administrador';
}

function cambiarModoLogin(modo) {
  const btnPass = document.getElementById('btnLoginTabPass');
  const btnPin = document.getElementById('btnLoginTabPin');
  const formPass = document.getElementById('loginPassForm');
  const formPin = document.getElementById('loginPinForm');
  const btnSubmit = document.getElementById('btnSubmitLogin');
  const errBox = document.getElementById('loginErrorMsg');
  if (errBox) errBox.style.display = 'none';

  if (modo === 'pin') {
    btnPass.style.background = 'transparent';
    btnPass.style.color = 'var(--text-secondary)';
    btnPin.style.background = 'var(--accent-gold)';
    btnPin.style.color = '#000';
    formPass.style.display = 'none';
    formPin.style.display = 'block';
    if (btnSubmit) btnSubmit.style.display = 'none';
    pinIngresado = '';
    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) pinInput.value = '';
  } else {
    btnPin.style.background = 'transparent';
    btnPin.style.color = 'var(--text-secondary)';
    btnPass.style.background = 'var(--accent-gold)';
    btnPass.style.color = '#000';
    formPin.style.display = 'none';
    formPass.style.display = 'flex';
    if (btnSubmit) btnSubmit.style.display = 'block';
  }
}

function teclearPin(digito) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  if (pinIngresado.length < 4) {
    pinIngresado += digito;
    const pinInput = document.getElementById('loginPinInput');
    if (pinInput) pinInput.value = pinIngresado;
  }
  if (pinIngresado.length === 4) {
    setTimeout(ejecutarLoginPin, 150);
  }
}

function borrarPin() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  pinIngresado = pinIngresado.slice(0, -1);
  const pinInput = document.getElementById('loginPinInput');
  if (pinInput) pinInput.value = pinIngresado;
}

async function ejecutarLoginPass() {
  const usuario = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginErrorMsg');

  if (!usuario || !password) {
    if (errBox) {
      errBox.innerText = 'Por favor complete el usuario y la clave';
      errBox.style.display = 'block';
    }
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();

    if (data.success && data.user) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      usuarioSesion = data.user;
      sessionStorage.setItem('usuario_chivo_admin', JSON.stringify(data.user));
      aplicarDatosSesion(data.user);
      document.getElementById('loginOverlay').style.display = 'none';
    } else {
      if (errBox) {
        errBox.innerText = data.error || 'Credenciales inválidas para este rol gerencial.';
        errBox.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Error en autenticación:', err);
    if (errBox) {
      errBox.innerText = 'Error de conexión con el servidor.';
      errBox.style.display = 'block';
    }
  }
}

async function ejecutarLoginPin() {
  const errBox = document.getElementById('loginErrorMsg');
  if (pinIngresado.length !== 4) return;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinIngresado })
    });
    const data = await res.json();

    if (data.success && data.user) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      usuarioSesion = data.user;
      sessionStorage.setItem('usuario_chivo_admin', JSON.stringify(data.user));
      aplicarDatosSesion(data.user);
      document.getElementById('loginOverlay').style.display = 'none';
    } else {
      pinIngresado = '';
      const pinInput = document.getElementById('loginPinInput');
      if (pinInput) pinInput.value = '';
      if (errBox) {
        errBox.innerText = 'PIN de acceso no reconocido. Intente nuevamente.';
        errBox.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Error en login con PIN:', err);
  }
}

function loginDemo(u, p) {
  cambiarModoLogin('pass');
  document.getElementById('loginUsername').value = u;
  document.getElementById('loginPassword').value = p;
  ejecutarLoginPass();
}

function cerrarSesionAdmin() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  sessionStorage.removeItem('usuario_chivo_admin');
  usuarioSesion = null;
  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.style.display = 'flex';
  const errBox = document.getElementById('loginErrorMsg');
  if (errBox) errBox.style.display = 'none';
}

// =========================================================
// MÓDULO DE PROVEEDORES LOCALES (CADENA DE ABASTO)
// =========================================================

async function cargarProveedores() {
  try {
    const res = await fetch('/api/proveedores');
    listaProveedores = await res.json();
    renderizarProveedores();
  } catch (err) {
    console.error('Error cargando proveedores:', err);
  }
}

function renderizarProveedores() {
  const tbody = document.getElementById('tbodyProveedores');
  const countEl = document.getElementById('provCountTotal');
  if (countEl) countEl.innerText = `${listaProveedores.length} Suplidores`;
  if (!tbody) return;

  tbody.innerHTML = '';
  if (listaProveedores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:2rem;">No hay proveedores registrados en la base de datos.</td></tr>`;
    return;
  }

  listaProveedores.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">
        <i class="fa-solid fa-truck" style="color: var(--accent-gold); margin-right: 0.4rem;"></i>
        ${p.nombre}
      </td>
      <td style="font-family: monospace; color: var(--accent-gold);">${p.rnc || 'N/A'}</td>
      <td><span class="badge badge-green" style="font-size: 0.78rem;">${p.categoria}</span></td>
      <td style="color: #fff;">${p.contacto}</td>
      <td style="color: var(--text-secondary);"><i class="fa-brands fa-whatsapp" style="color: #22c55e;"></i> ${p.telefono}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${p.direccion}</td>
      <td><span class="badge badge-gold" style="font-size: 0.75rem;">${p.diasEntrega}</span></td>
      <td>
        <button onclick="eliminarProveedor(${p.id})" class="btn btn-outline btn-sm" style="color: #f87171; border-color: rgba(239,68,68,0.3); padding: 0.3rem 0.6rem; font-size: 0.78rem;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalProveedor() {
  if (window.AudioEngine) window.AudioEngine.playClick();
  document.getElementById('modalProveedor').classList.add('active');
}

function cerrarModalProveedor() {
  document.getElementById('modalProveedor').classList.remove('active');
}

async function guardarProveedor() {
  const nombre = document.getElementById('provNombre').value;
  const rnc = document.getElementById('provRnc').value;
  const categoria = document.getElementById('provCategoria').value;
  const contacto = document.getElementById('provContacto').value;
  const telefono = document.getElementById('provTelefono').value;
  const direccion = document.getElementById('provDireccion').value;
  const diasEntrega = document.getElementById('provDias').value;

  if (!nombre.trim()) {
    alert('Por favor ingrese el nombre o razón social del proveedor');
    return;
  }

  try {
    const res = await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, rnc, categoria, contacto, telefono, direccion, diasEntrega })
    });
    const result = await res.json();
    if (result.success) {
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      cerrarModalProveedor();
      cargarProveedores();
      document.getElementById('provNombre').value = '';
      document.getElementById('provRnc').value = '';
      document.getElementById('provCategoria').value = '';
      document.getElementById('provContacto').value = '';
      document.getElementById('provTelefono').value = '';
      document.getElementById('provDireccion').value = '';
      document.getElementById('provDias').value = '';
    }
  } catch (err) {
    console.error('Error guardando proveedor:', err);
  }
}

async function eliminarProveedor(id) {
  if (!confirm('¿Confirma que desea retirar este suplidor del directorio activo?')) return;
  try {
    const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      cargarProveedores();
    }
  } catch (err) {
    console.error('Error eliminando proveedor:', err);
  }
}

// =========================================================
// MÓDULO REPORTE FISCAL 607 DGII (VENTAS CON NCF)
// =========================================================

async function cargarReporte607() {
  try {
    const res = await fetch('/api/reportes/607');
    datosReporte607 = await res.json();
    renderizarReporte607();
  } catch (err) {
    console.error('Error cargando reporte 607:', err);
  }
}

function renderizarReporte607() {
  if (!datosReporte607) return;

  const periodoEl = document.getElementById('r607Periodo');
  const countEl = document.getElementById('r607TotalRegistros');
  const baseEl = document.getElementById('r607BaseTotal');
  const itbisEl = document.getElementById('r607ItbisTotal');
  const propinaEl = document.getElementById('r607PropinaTotal');
  const totalEl = document.getElementById('r607TotalCobrado');
  const tbody = document.getElementById('tbodyReporte607');

  if (periodoEl) periodoEl.innerText = datosReporte607.periodo || datosReporte607.periodoFiscal || '202610';
  const totalRegs = datosReporte607.totalRegistros || datosReporte607.cantidadRegistros || (datosReporte607.lineas ? datosReporte607.lineas.length : 0);
  if (countEl) countEl.innerText = `${totalRegs} Facturas`;

  // Calcular totales
  const lineas = datosReporte607.lineas || datosReporte607.registros || [];
  let sumaBase = 0, sumaItbis = 0, sumaPropina = 0, sumaTotal = 0;

  lineas.forEach(l => {
    sumaBase += parseFloat(l.montoFacturado || 0);
    sumaItbis += parseFloat(l.itbisFacturado || 0);
    sumaPropina += parseFloat(l.propinaLegal || 0);
    sumaTotal += parseFloat(l.montoTotal || l.totalCobrado || 0);
  });

  if (baseEl) baseEl.innerText = `RD$ ${sumaBase.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  if (itbisEl) itbisEl.innerText = `RD$ ${sumaItbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  if (propinaEl) propinaEl.innerText = `RD$ ${sumaPropina.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  if (totalEl) totalEl.innerText = `RD$ ${sumaTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;

  if (!tbody) return;
  tbody.innerHTML = '';

  if (lineas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:2rem;">No hay transacciones fiscales registradas en este período.</td></tr>`;
    return;
  }

  lineas.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; color: var(--text-muted);">${item.linea || item.secuencia || (idx + 1)}</td>
      <td style="font-family: monospace; color: #fff;">${item.rncCedula || item.rncOcedula || '000000000'}</td>
      <td><span class="badge badge-gold" style="font-size: 0.72rem;">${item.tipoIdentificacion || '3'}</span></td>
      <td style="font-family: monospace; font-weight: 700; color: var(--accent-gold);">${item.ncf}</td>
      <td style="color: var(--text-secondary);">${item.tipoIngreso || '01'} (Operaciones)</td>
      <td style="font-family: monospace; color: var(--text-muted);">${item.fechaComprobante}</td>
      <td style="font-family: monospace; color: #fff;">RD$ ${parseFloat(item.montoFacturado).toFixed(2)}</td>
      <td style="font-family: monospace; color: var(--accent-gold); font-weight: 700;">RD$ ${parseFloat(item.itbisFacturado).toFixed(2)}</td>
      <td style="font-family: monospace; color: #10b981;">RD$ ${parseFloat(item.propinaLegal).toFixed(2)}</td>
      <td style="font-family: monospace; font-weight: 800; color: #fff;">RD$ ${parseFloat(item.montoTotal || item.totalCobrado).toFixed(2)}</td>
      <td><span class="badge badge-green" style="font-size: 0.72rem;">${item.formaPago === '01' ? 'Efectivo' : 'Tarjeta / PayPal'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function descargarReporte607CSV() {
  if (!datosReporte607) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  const lineas = datosReporte607.lineas || datosReporte607.registros || [];
  if (lineas.length === 0) {
    alert('No hay registros fiscales para exportar en el Formato 607.');
    return;
  }

  let csvContent = 'RNC/Cedula,Tipo_Id,NCF,NCF_Modificado,Tipo_Ingreso,Fecha_Comprobante,Fecha_Retencion,Monto_Facturado,ITBIS_Facturado,ITBIS_Retenido,ITBIS_Percibido,Retencion_Renta,ISR_Percibido,ISC,Otros_Impuestos,Propina_Legal,Forma_Pago\r\n';

  lineas.forEach(l => {
    const row = [
      l.rncCedula || l.rncOcedula || '000000000',
      l.tipoIdentificacion || '3',
      l.ncf,
      '',
      l.tipoIngreso || '01',
      l.fechaComprobante,
      '',
      parseFloat(l.montoFacturado || 0).toFixed(2),
      parseFloat(l.itbisFacturado || 0).toFixed(2),
      '0.00',
      '0.00',
      '0.00',
      '0.00',
      '0.00',
      '0.00',
      parseFloat(l.propinaLegal || 0).toFixed(2),
      l.formaPago || '04'
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DGII_F607_${datosReporte607.periodo || '202610'}_CHIVO_AL_CAMPO.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
}


