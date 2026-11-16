// =========================================================
// PGM_COCINA: LÓGICA DEL MONITOR DE COCINA KDS (PÁGINA 16)
// =========================================================

const socket = io();
let pedidosActivos = [];
let soundEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
  // Iniciar reloj
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  // Cargar pedidos actuales
  cargarPedidos();

  // Socket.IO
  socket.emit('unirse_dispositivo', 'cocina');

  socket.on('nuevo_pedido', () => {
    if (soundEnabled && window.AudioEngine) window.AudioEngine.playOrderAlert();
    cargarPedidos();
  });

  socket.on('estatus_pedido_actualizado', () => {
    cargarPedidos();
  });

  socket.on('pago_procesado', () => {
    cargarPedidos();
  });

  document.body.addEventListener('click', () => {
    if (window.AudioEngine) window.AudioEngine.init();
  }, { once: true });
});

function actualizarReloj() {
  const clock = document.getElementById('kdsClockDisplay');
  if (clock) {
    clock.innerText = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  }
}

function testSound() {
  if (window.AudioEngine) window.AudioEngine.playOrderAlert();
}

function toggleMute() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (icon) {
    icon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
  }
}

async function cargarPedidos() {
  try {
    const res = await fetch('/api/pedidos');
    const todos = await res.json();
    // En KDS mostramos órdenes pendientes o en preparación (no despachadas ni pagadas)
    pedidosActivos = (todos || []).filter(p => {
      const est = String(p.estatus || p.estado || 'pendiente').toLowerCase();
      return est !== 'despachado' && est !== 'liberado' && !p.pagado && !p.despachado;
    });
    renderizarTarjetasKDS();
  } catch (err) {
    console.error('Error cargando pedidos KDS:', err);
  }
}

// Renderizado de tarjetas de comanda idénticas al Formato 2 del PDF (Página 16)
function renderizarTarjetasKDS() {
  const container = document.getElementById('kdsCardsGrid');
  if (pedidosActivos.length === 0) {
    container.innerHTML = `
      <div class="kds-empty-msg">
        <i class="fa-solid fa-circle-check" style="font-size: 3rem; margin-bottom: 1rem; color: #10b981; display: block;"></i>
        Sin comandas pendientes en cocina.
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  pedidosActivos.forEach(pedido => {
    const card = document.createElement('div');
    card.className = 'kds-order-card';

    // Subtítulo con formato exacto al PDF: "MESA 04 / 15:30 / 1 MIN"
    const horaEnvio = new Date(pedido.fecha).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    const diffMins = Math.max(0, Math.floor((Date.now() - new Date(pedido.fecha).getTime()) / 60000));
    const minsStr = diffMins <= 1 ? '1 MIN' : `${diffMins} MINS`;
    const subheaderText = `${(pedido.mesaNombre || 'MESA').toUpperCase()} / ${horaEnvio} / ${minsStr}`;

    // Lista de platos con bullet dot azul
    let itemsHtml = '';
    (pedido.items || []).forEach(item => {
      itemsHtml += `
        <div class="kds-dish-line">
          <span class="kds-bullet"></span>
          <span>${item.cantidad}x ${item.nombre}</span>
        </div>
      `;
    });

    // Botón de acción según el estado
    const estatusNorm = String(pedido.estatus || pedido.estado || 'en_preparacion').toLowerCase();
    const esListo = (estatusNorm === 'listo' || estatusNorm === 'preparado');

    let btnHtml = `
      <div style="display: flex; gap: 0.5rem; width: 100%;">
        ${!esListo ? `
          <button onclick="marcarListoParaEntregar('${pedido.id}')" class="kds-state-btn btn-prep-pdf" style="flex: 1.2;">
            <i class="fa-solid fa-fire"></i> EN PREPARACIÓN
          </button>
        ` : `
          <button onclick="marcarDespachoFinal('${pedido.id}')" class="kds-state-btn btn-ready-pdf" style="flex: 1.2;">
            <i class="fa-solid fa-bell-concierge"></i> LISTO / ENTREGAR
          </button>
        `}
        <button onclick="marcarDespachoFinal('${pedido.id}')" class="kds-state-btn" style="flex: 1; background: #10b981; color: #fff; border: 1px solid #059669; font-weight: 700; border-radius: 6px; cursor: pointer; padding: 0.7rem; font-size: 0.82rem;" title="Despachar y retirar del monitor KDS">
          <i class="fa-solid fa-check-double"></i> DESPACHAR
        </button>
      </div>
    `;

    card.innerHTML = `
      <div class="kds-order-header">
        <div class="kds-table-num">${(pedido.mesaNombre || 'MESA').toUpperCase()}</div>
        <div class="kds-meta-sub">${subheaderText}</div>
      </div>

      <div class="kds-dish-list">
        ${itemsHtml}
      </div>

      <div class="kds-action-btn-wrap">
        ${btnHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

// Acción 1: Chef termina la cocción y presiona "EN PREPARACIÓN" -> pasa a "LISTO PARA ENTREGAR"
async function marcarListoParaEntregar(pedidoId) {
  if (window.AudioEngine) window.AudioEngine.playSuccessChime();
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}/estatus`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estatus: 'listo' })
    });
    const result = await res.json();
    if (result.success) {
      cargarPedidos();
    }
  } catch (err) {
    console.error('Error al actualizar estatus:', err);
  }
}

// Acción 2: Mesero recoge los platos o se despacha el delivery
async function marcarDespachoFinal(pedidoId) {
  if (window.AudioEngine) window.AudioEngine.playClick();
  try {
    const res = await fetch(`/api/pedidos/${pedidoId}/despachar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await res.json();
    if (result.success) {
      cargarPedidos();
    }
  } catch (err) {
    console.error('Error despachando pedido:', err);
  }
}
