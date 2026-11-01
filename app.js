// Cancionero Mercedario Argentino - Lógica de la Aplicación

// Estado Global
let todasLasCanciones = [];
let cancionesFiltradas = [];
let secciones = [];
let seccionActiva = null;
let terminoBusqueda = '';
let cancionActualModal = null;
let tamanoLetraActual = 16; // px
let repertorioMisa = [];
let temaActual = localStorage.getItem('tema_cancionero') || 'claro';

// Constantes de colores para cada sección
const COLORES_SECCION = {
  ENT: { bg: 'bg-red-800', text: 'text-red-800', border: 'border-red-800', light: 'bg-red-50 text-red-800' },
  PER: { bg: 'bg-purple-800', text: 'text-purple-800', border: 'border-purple-800', light: 'bg-purple-50 text-purple-800' },
  GLO: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', light: 'bg-amber-50 text-amber-800' },
  SAL: { bg: 'bg-emerald-700', text: 'text-emerald-700', border: 'border-emerald-700', light: 'bg-emerald-50 text-emerald-800' },
  OFE: { bg: 'bg-orange-700', text: 'text-orange-700', border: 'border-orange-700', light: 'bg-orange-50 text-orange-800' },
  COM: { bg: 'bg-rose-900', text: 'text-rose-900', border: 'border-rose-900', light: 'bg-rose-50 text-rose-900' },
  MED: { bg: 'bg-sky-700', text: 'text-sky-700', border: 'border-sky-700', light: 'bg-sky-50 text-sky-800' },
  ADO: { bg: 'bg-yellow-600', text: 'text-yellow-600', border: 'border-yellow-600', light: 'bg-yellow-50 text-yellow-800' },
  ADV: { bg: 'bg-indigo-800', text: 'text-indigo-800', border: 'border-indigo-800', light: 'bg-indigo-50 text-indigo-800' },
  NAV: { bg: 'bg-pink-700', text: 'text-pink-700', border: 'border-pink-700', light: 'bg-pink-50 text-pink-800' },
  CUA: { bg: 'bg-purple-900', text: 'text-purple-900', border: 'border-purple-900', light: 'bg-purple-50 text-purple-900' },
  PAS: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500', light: 'bg-amber-50 text-amber-900' },
  ESP: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600', light: 'bg-red-50 text-red-700' },
  MAR: { bg: 'bg-blue-700', text: 'text-blue-700', border: 'border-blue-700', light: 'bg-blue-50 text-blue-800' },
  MER: { bg: 'bg-merced-900', text: 'text-merced-900', border: 'border-merced-900', light: 'bg-merced-100 text-merced-950 font-bold ring-1 ring-gold-500' },
  ANI: { bg: 'bg-teal-700', text: 'text-teal-700', border: 'border-teal-700', light: 'bg-teal-50 text-teal-800' }
};

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
  inicializarDatos();
  aplicarTema(temaActual);
  inicializarCarruselHero();
  inicializarEventos();
  cargarRepertorioLocal();
});

// Cargar datos desde window.CANCIONERO_DATA o localStorage
function inicializarDatos() {
  if (window.CANCIONERO_DATA) {
    secciones = window.CANCIONERO_DATA.secciones || [];
    const baseCanciones = window.CANCIONERO_DATA.canciones || [];

    // Unir con canciones agregadas por el usuario en localStorage
    const cancionesLocales = JSON.parse(localStorage.getItem('canciones_nuevas_mercedarias') || '[]');
    todasLasCanciones = [...baseCanciones, ...cancionesLocales];
  } else {
    console.error('No se pudo encontrar window.CANCIONERO_DATA');
  }

  cancionesFiltradas = [...todasLasCanciones];

  const elTotal = document.getElementById('hero-total-cantos');
  if (elTotal) elTotal.textContent = todasLasCanciones.length + ' cantos';

  renderizarFiltrosSecciones();
  poblarSelectNuevaSeccion();
  renderizarCanciones();
}

// Renderizar Chips de Filtros Litúrgicos
function renderizarFiltrosSecciones() {
  const cont = document.getElementById('contenedor-filtros');
  if (!cont) return;

  let html = `
    <button 
      onclick="seleccionarSeccion(null)" 
      class="chip-filtro px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${seccionActiva === null ? 'bg-merced-900 text-white shadow-md ring-2 ring-gold-400' : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'}"
    >
      Todas (${todasLasCanciones.length})
    </button>
  `;

  secciones.forEach(sec => {
    const cantosCount = todasLasCanciones.filter(c => c.seccion_codigo === sec.codigo).length;
    const esActivo = seccionActiva === sec.codigo;
    const esMercedaria = sec.codigo === 'MER';

    let estiloExtra = esMercedaria ? 'border-gold-500/80 font-bold' : 'border-stone-200';
    if (esActivo) {
      estiloExtra = 'bg-merced-900 text-white shadow-md ring-2 ring-gold-400 font-bold';
    } else {
      estiloExtra += ' bg-white text-stone-700 hover:bg-stone-100';
    }

    html += `
      <button 
        onclick="seleccionarSeccion('${sec.codigo}')" 
        class="chip-filtro px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-sm border ${estiloExtra}"
      >
        ${esMercedaria ? '★ ' : ''}${sec.nombre} <span class="opacity-75 text-[11px]">(${cantosCount})</span>
      </button>
    `;
  });

  cont.innerHTML = html;
  actualizarBannerSeccion();
}

// Actualizar banner superior cuando se filtra por una sección
function actualizarBannerSeccion() {
  const banner = document.getElementById('banner-seccion');
  if (!banner) return;

  if (!seccionActiva) {
    banner.classList.add('hidden');
    return;
  }

  const sec = secciones.find(s => s.codigo === seccionActiva);
  if (!sec) return;

  banner.classList.remove('hidden');
  document.getElementById('banner-seccion-titulo').textContent = `${sec.nombre} (${sec.codigo})`;
  document.getElementById('banner-seccion-desc').textContent = `Cantos propios para el momento de ${sec.nombre.toLowerCase()} en la liturgia y la vida comunitaria.`;
  document.getElementById('banner-seccion-icono').textContent = sec.codigo;
}

// Seleccionar Sección Litúrgica
function seleccionarSeccion(codigo) {
  seccionActiva = codigo;
  renderizarFiltrosSecciones();
  filtrarCanciones();
}

function resetFiltros() {
  seccionActiva = null;
  terminoBusqueda = '';
  const input = document.getElementById('input-busqueda');
  if (input) input.value = '';
  document.getElementById('btn-limpiar-busqueda')?.classList.add('hidden');
  renderizarFiltrosSecciones();
  filtrarCanciones();
  window.scrollTo({ top: 380, behavior: 'smooth' });
}

// Búsqueda y Filtrado Instantáneo
function filtrarCanciones() {
  const input = document.getElementById('input-busqueda');
  terminoBusqueda = (input ? input.value : '').trim().toLowerCase();

  const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
  if (btnLimpiar) {
    if (terminoBusqueda) btnLimpiar.classList.remove('hidden');
    else btnLimpiar.classList.add('hidden');
  }

  cancionesFiltradas = todasLasCanciones.filter(cancion => {
    // Filtro por sección
    if (seccionActiva && cancion.seccion_codigo !== seccionActiva) {
      return false;
    }

    // Filtro por texto de búsqueda
    if (terminoBusqueda) {
      const matchCodigo = cancion.codigo.toLowerCase().includes(terminoBusqueda);
      const matchTitulo = cancion.titulo.toLowerCase().includes(terminoBusqueda);
      const matchLetra = cancion.letra.toLowerCase().includes(terminoBusqueda);
      return matchCodigo || matchTitulo || matchLetra;
    }

    return true;
  });

  // Actualizar contador
  const contador = document.getElementById('contador-resultados');
  if (contador) {
    contador.textContent = `${cancionesFiltradas.length} canto${cancionesFiltradas.length === 1 ? '' : 's'} encontrado${cancionesFiltradas.length === 1 ? '' : 's'}`;
  }

  renderizarCanciones();
}

function limpiarBusqueda() {
  const input = document.getElementById('input-busqueda');
  if (input) input.value = '';
  filtrarCanciones();
}

// Renderizar Grilla de Canciones (Paginada / Límite inicial de 60 para ultra velocidad)
let limiteVisual = 60;

function renderizarCanciones(esCargaMas = false) {
  const grilla = document.getElementById('grilla-canciones');
  const sinResultados = document.getElementById('sin-resultados');
  if (!grilla) return;

  if (cancionesFiltradas.length === 0) {
    grilla.innerHTML = '';
    sinResultados.classList.remove('hidden');
    return;
  }

  sinResultados.classList.add('hidden');

  if (!esCargaMas) {
    limiteVisual = 60;
  }

  const itemsAMostrar = cancionesFiltradas.slice(0, limiteVisual);

  let html = itemsAMostrar.map((cancion, idx) => {
    const estiloSeccion = COLORES_SECCION[cancion.seccion_codigo] || { light: 'bg-stone-100 text-stone-800' };
    const enRepertorio = repertorioMisa.some(r => r.codigo === cancion.codigo);

    // Obtener las primeras 2 líneas de la letra para previsualización
    const lineas = cancion.letra.split('\n').filter(l => l.trim().length > 0).slice(0, 2);
    const extracto = lineas.join(' / ').substring(0, 95) + (cancion.letra.length > 95 ? '...' : '');

    return `
      <div class="card-bg bg-white dark:bg-stone-900 rounded-xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-gold-500/60">
        <div>
          <!-- Cabecera de la Tarjeta -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${estiloSeccion.light}">
              ${cancion.codigo}
            </span>
            <span class="text-[11px] text-stone-400 uppercase font-semibold">
              ${cancion.seccion}
            </span>
          </div>

          <!-- Título -->
          <h4 
            onclick="abrirModalCancion('${cancion.codigo}')" 
            class="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-merced-700 dark:group-hover:text-gold-400 cursor-pointer transition leading-snug mb-2"
          >
            ${cancion.titulo}
          </h4>

          <!-- Extracto de letra -->
          <p class="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-2 leading-relaxed mb-4">
            "${extracto}"
          </p>
        </div>

        <!-- Acciones de la Tarjeta -->
        <div class="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <button 
            onclick="abrirModalCancion('${cancion.codigo}')" 
            class="text-merced-800 dark:text-gold-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Ver letra</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>

          <button 
            onclick="toggleRepertorio('${cancion.codigo}')" 
            title="${enRepertorio ? 'Quitar de Misa' : 'Agregar a Misa'}"
            class="p-1.5 rounded-lg transition ${enRepertorio ? 'bg-gold-500 text-merced-950 font-bold' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'}"
          >
            <i data-lucide="${enRepertorio ? 'check' : 'plus'}" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (limiteVisual < cancionesFiltradas.length) {
    html += `
      <div class="col-span-full text-center py-6">
        <button 
          onclick="cargarMasCanciones()" 
          class="bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          Cargar más cantos (${cancionesFiltradas.length - limiteVisual} restantes)
        </button>
      </div>
    `;
  }

  grilla.innerHTML = html;
  lucide.createIcons();
}

function cargarMasCanciones() {
  limiteVisual += 60;
  renderizarCanciones(true);
}

// Modal Visor de Canción
function abrirModalCancion(codigo) {
  const cancion = todasLasCanciones.find(c => c.codigo === codigo);
  if (!cancion) return;

  cancionActualModal = cancion;

  document.getElementById('modal-codigo').textContent = cancion.codigo;
  document.getElementById('modal-seccion').textContent = cancion.seccion;
  document.getElementById('modal-titulo').textContent = cancion.titulo;

  const elLetra = document.getElementById('modal-letra');
  elLetra.textContent = cancion.letra;
  elLetra.style.fontSize = `${tamanoLetraActual}px`;

  // Posición respecto a lista filtrada
  const idx = cancionesFiltradas.findIndex(c => c.codigo === codigo);
  const posEl = document.getElementById('modal-posicion');
  if (posEl && idx !== -1) {
    posEl.textContent = `${idx + 1} de ${cancionesFiltradas.length}`;
  }

  // Actualizar botón de repertorio
  actualizarBotonModalRepertorio();

  document.getElementById('modal-cancion').classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function cerrarModalCancion() {
  document.getElementById('modal-cancion').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function navegarCancionModal(direccion) {
  if (!cancionActualModal) return;
  const idx = cancionesFiltradas.findIndex(c => c.codigo === cancionActualModal.codigo);
  if (idx === -1) return;

  const nuevoIdx = idx + direccion;
  if (nuevoIdx >= 0 && nuevoIdx < cancionesFiltradas.length) {
    abrirModalCancion(cancionesFiltradas[nuevoIdx].codigo);
  }
}

// Controles de tamaño de fuente
function cambiarTamanoLetra(delta) {
  tamanoLetraActual = Math.max(12, Math.min(32, tamanoLetraActual + delta));
  const elLetra = document.getElementById('modal-letra');
  if (elLetra) elLetra.style.fontSize = `${tamanoLetraActual}px`;
}

function resetTamanoLetra() {
  tamanoLetraActual = 16;
  const elLetra = document.getElementById('modal-letra');
  if (elLetra) elLetra.style.fontSize = `16px`;
}

function copiarLetraActual() {
  if (!cancionActualModal) return;
  const texto = `${cancionActualModal.titulo} (${cancionActualModal.codigo})\n${cancionActualModal.seccion}\nCancionero Mercedario Argentino\n\n${cancionActualModal.letra}`;
  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast('Letra copiada al portapapeles');
  });
}

// Gestión de Repertorio de Misa
function toggleRepertorio(codigo) {
  const cancion = todasLasCanciones.find(c => c.codigo === codigo);
  if (!cancion) return;

  const idx = repertorioMisa.findIndex(r => r.codigo === codigo);
  if (idx >= 0) {
    repertorioMisa.splice(idx, 1);
    mostrarToast(`Quitado de Misa: ${cancion.titulo}`);
  } else {
    repertorioMisa.push(cancion);
    mostrarToast(`Agregado a Misa: ${cancion.titulo}`);
  }

  guardarRepertorioLocal();
  actualizarUIRepertorio();
  renderizarCanciones(true);
}

function toggleRepertorioActual() {
  if (cancionActualModal) {
    toggleRepertorio(cancionActualModal.codigo);
    actualizarBotonModalRepertorio();
  }
}

function actualizarBotonModalRepertorio() {
  const btn = document.getElementById('btn-modal-repertorio');
  if (!btn || !cancionActualModal) return;

  const enRepertorio = repertorioMisa.some(r => r.codigo === cancionActualModal.codigo);
  if (enRepertorio) {
    btn.className = 'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition bg-gold-500 text-merced-950 border border-gold-600';
    btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>En Repertorio de Misa</span>';
  } else {
    btn.className = 'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800';
    btn.innerHTML = '<i data-lucide="list-plus" class="w-4 h-4"></i><span>Agregar a Misa</span>';
  }
  lucide.createIcons();
}

function toggleRepertorioDrawer() {
  const drawer = document.getElementById('drawer-repertorio');
  drawer.classList.toggle('translate-x-full');
}

function actualizarUIRepertorio() {
  const badge = document.getElementById('repertorio-badge');
  if (badge) badge.textContent = repertorioMisa.length;

  const lista = document.getElementById('lista-repertorio');
  if (!lista) return;

  if (repertorioMisa.length === 0) {
    lista.innerHTML = `
      <div class="text-center py-12 text-stone-400">
        <i data-lucide="music" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
        <p class="text-sm font-medium">Aún no hay cantos seleccionados.</p>
        <p class="text-xs mt-1">Toca el botón + en cualquier canto para armar el programa de la misa de hoy.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  lista.innerHTML = repertorioMisa.map((cancion, idx) => `
    <div class="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
      <div class="flex items-center space-x-2.5 min-w-0">
        <span class="text-xs font-mono font-bold text-merced-800 dark:text-gold-400">${cancion.codigo}</span>
        <div class="truncate cursor-pointer" onclick="abrirModalCancion('${cancion.codigo}')">
          <p class="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">${cancion.titulo}</p>
          <p class="text-[11px] text-stone-400">${cancion.seccion}</p>
        </div>
      </div>
      <button onclick="toggleRepertorio('${cancion.codigo}')" class="p-1 text-red-500 hover:text-red-700" title="Quitar">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');

  lucide.createIcons();
}

function vaciarRepertorio() {
  if (confirm('¿Vaciar los cantos seleccionados para la misa?')) {
    repertorioMisa = [];
    guardarRepertorioLocal();
    actualizarUIRepertorio();
    renderizarCanciones(true);
    mostrarToast('Repertorio vaciado');
  }
}

function copiarRepertorioTexto() {
  if (repertorioMisa.length === 0) {
    mostrarToast('No hay cantos en el repertorio');
    return;
  }

  let texto = '🎶 REPERTORIO DE MISA - CANCIONERO MERCEDARIO ARGENTINO\n\n';
  repertorioMisa.forEach((c, idx) => {
    texto += `${idx + 1}. [${c.codigo}] ${c.titulo} (${c.seccion})\n`;
  });
  texto += '\nBasado en el cancionero de las Hnas. Mercedarias del Niño Jesús.';

  navigator.clipboard.writeText(texto).then(() => {
    mostrarToast('¡Programa de Misa copiado al portapapeles!');
  });
}

function guardarRepertorioLocal() {
  localStorage.setItem('repertorio_misa_mercedario', JSON.stringify(repertorioMisa));
}

function cargarRepertorioLocal() {
  const guardado = localStorage.getItem('repertorio_misa_mercedario');
  if (guardado) {
    try {
      repertorioMisa = JSON.parse(guardado);
      actualizarUIRepertorio();
    } catch (e) {
      console.error(e);
    }
  }
}

// Configuración de Envío de Sugerencias (Google Apps Script Webhook)
const GOOGLE_SCRIPT_SUGERENCIAS_URL = 'https://script.google.com/macros/s/AKfycbx9H8YJftIfxtugcHONYMRnoUoV3-EFFB3yp5P-cnko6rpDQqOVeyXDEimXkDffbx_5/exec';

// Modal Agregar Nueva Canción
function abrirModalNuevaCancion() {
  document.getElementById('modal-nueva-cancion')?.classList.remove('hidden');
  actualizarCodigoSugerido();
}

function cerrarModalNuevaCancion() {
  document.getElementById('modal-nueva-cancion')?.classList.add('hidden');
}

function poblarSelectNuevaSeccion() {
  const sel = document.getElementById('nueva-seccion');
  if (!sel) return;

  sel.innerHTML = secciones.map(s => `
    <option value="${s.codigo}">${s.nombre} (${s.codigo})</option>
  `).join('');
}

function actualizarCodigoSugerido() {
  const sel = document.getElementById('nueva-seccion');
  const inputCod = document.getElementById('nuevo-codigo');
  if (!sel || !inputCod) return;

  const codSeccion = sel.value;
  const cantosDeEstaSeccion = todasLasCanciones.filter(c => c.seccion_codigo === codSeccion);
  const siguienteNumero = cantosDeEstaSeccion.length + 1;
  inputCod.value = `${codSeccion}-${String(siguienteNumero).padStart(2, '0')}`;
}

function guardarNuevaCancion(e) {
  e.preventDefault();
  const sel = document.getElementById('nueva-seccion');
  const sec = secciones.find(s => s.codigo === sel.value);
  const codigo = document.getElementById('nuevo-codigo').value;
  const titulo = document.getElementById('nuevo-titulo').value.trim();
  const letra = document.getElementById('nueva-letra').value.trim();

  if (!titulo || !letra) return;

  const nueva = {
    id: `${codigo.toLowerCase()}-${titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    codigo: codigo,
    numero_seccion: parseInt(codigo.split('-')[1]),
    titulo: titulo,
    titulo_original: titulo,
    seccion: sec ? sec.nombre : 'General',
    seccion_codigo: sel.value,
    letra: letra,
    es_nueva: true
  };

  // Guardar en array y en localStorage
  todasLasCanciones.push(nueva);
  const cancionesLocales = JSON.parse(localStorage.getItem('canciones_nuevas_mercedarias') || '[]');
  cancionesLocales.push(nueva);
  localStorage.setItem('canciones_nuevas_mercedarias', JSON.stringify(cancionesLocales));

  // Reset y notificar
  document.getElementById('form-nueva-cancion').reset();
  cerrarModalNuevaCancion();
  renderizarFiltrosSecciones();
  filtrarCanciones();
  mostrarToast(`¡Canto "${titulo}" (${codigo}) guardado con éxito!`);
  abrirModalCancion(codigo);
}

// Modal Galería de Templos y Comunidades
function abrirModalGaleria() {
  document.getElementById('modal-galeria').classList.remove('hidden');
}

function cerrarModalGaleria() {
  document.getElementById('modal-galeria').classList.add('hidden');
}

// Cambiar Tema (Claro / Oscuro / Sepia)
function alternarTema() {
  if (temaActual === 'claro') {
    aplicarTema('oscuro');
  } else if (temaActual === 'oscuro') {
    aplicarTema('sepia');
  } else {
    aplicarTema('claro');
  }
}

function aplicarTema(tema) {
  temaActual = tema;
  localStorage.setItem('tema_cancionero', tema);

  document.documentElement.classList.remove('dark', 'theme-sepia');
  const icono = document.getElementById('icono-tema');

  if (tema === 'oscuro') {
    document.documentElement.classList.add('dark');
    if (icono) icono.setAttribute('data-lucide', 'sun');
  } else if (tema === 'sepia') {
    document.documentElement.classList.add('theme-sepia');
    if (icono) icono.setAttribute('data-lucide', 'coffee');
  } else {
    if (icono) icono.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

// Carrusel Hero
function inicializarCarruselHero() {
  const imagenes = document.querySelectorAll('.hero-bg-img');
  if (imagenes.length <= 1) return;

  let indiceActual = 0;
  setInterval(() => {
    imagenes[indiceActual].classList.remove('opacity-100');
    imagenes[indiceActual].classList.add('opacity-0');

    indiceActual = (indiceActual + 1) % imagenes.length;

    imagenes[indiceActual].classList.remove('opacity-0');
    imagenes[indiceActual].classList.add('opacity-100');
  }, 6000);
}

// Notificación Toast Flotante
function mostrarToast(mensaje) {
  const toastExistente = document.getElementById('toast-flotante');
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement('div');
  toast.id = 'toast-flotante';
  toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-gold-400 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border border-gold-500/30 transition-all duration-300';
  toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-gold-400"></i><span>${mensaje}</span>`;
  document.body.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Modal Índice General y Momentos Litúrgicos
function abrirModalIndice() {
  document.getElementById('modal-indice')?.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  const inputFiltro = document.getElementById('input-filtro-indice');
  if (inputFiltro) inputFiltro.value = '';
  renderizarCuerpoIndiceGeneral();
  setTimeout(() => inputFiltro?.focus(), 100);
}

function cerrarModalIndice() {
  document.getElementById('modal-indice')?.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function renderizarCuerpoIndiceGeneral(filtro = '') {
  const cont = document.getElementById('cuerpo-indice-general');
  if (!cont) return;

  const termino = filtro.trim().toLowerCase();
  let html = '';

  secciones.forEach(sec => {
    // Filtrar cantos de esta sección
    let cantosSec = todasLasCanciones.filter(c => c.seccion_codigo === sec.codigo);

    if (termino) {
      cantosSec = cantosSec.filter(c =>
        c.codigo.toLowerCase().includes(termino) ||
        c.titulo.toLowerCase().includes(termino) ||
        sec.nombre.toLowerCase().includes(termino)
      );
    }

    if (termino && cantosSec.length === 0) {
      return; // Ocultar sección si no coincide
    }

    const esMercedaria = sec.codigo === 'MER';
    const abiertaPorDefecto = termino.length > 0;

    html += `
      <details class="group py-2.5" ${abiertaPorDefecto ? 'open' : ''}>
        <summary class="flex items-center justify-between cursor-pointer list-none select-none p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition">
          <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${esMercedaria ? 'bg-merced-900 text-gold-400 ring-2 ring-gold-400' : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200'}">
              ${sec.codigo}
            </span>
            <span class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              ${sec.nombre}
              ${esMercedaria ? '<span class="text-xs bg-gold-500 text-merced-950 font-sans font-bold px-1.5 py-0.2 rounded">Especial</span>' : ''}
            </span>
          </div>
          <div class="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
            <span class="font-medium">${cantosSec.length} cantos</span>
            <i data-lucide="chevron-down" class="w-4 h-4 transition-transform group-open:rotate-180"></i>
          </div>
        </summary>

        <div class="mt-2 pl-4 sm:pl-11 pr-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          ${cantosSec.map(c => `
            <div 
              onclick="irDesdeIndiceACancion('${c.codigo}')" 
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-merced-50 dark:hover:bg-stone-800/80 cursor-pointer group/item transition border border-transparent hover:border-gold-500/30"
            >
              <span class="text-xs font-mono font-bold text-merced-900 dark:text-gold-400 min-w-[55px]">${c.codigo}</span>
              <span class="text-xs font-medium text-stone-800 dark:text-stone-200 group-hover/item:text-merced-900 dark:group-hover/item:text-gold-300 truncate">${c.titulo}</span>
            </div>
          `).join('')}
        </div>
      </details>
    `;
  });

  if (!html) {
    html = `
      <div class="text-center py-8 text-stone-400">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        <p class="text-sm">No se encontraron cantos ni secciones con "${filtro}".</p>
      </div>
    `;
  }

  cont.innerHTML = html;
  lucide.createIcons();
}

function filtrarIndiceGeneral() {
  const val = document.getElementById('input-filtro-indice')?.value || '';
  renderizarCuerpoIndiceGeneral(val);
}

function expandirColapsarIndice(expandir) {
  const detalles = document.querySelectorAll('#cuerpo-indice-general details');
  detalles.forEach(d => {
    if (expandir) d.setAttribute('open', '');
    else d.removeAttribute('open');
  });
}

function irDesdeIndiceACancion(codigo) {
  cerrarModalIndice();
  abrirModalCancion(codigo);
}

// Sistema Integral de Sugerencias y Proposiciones de la Comunidad
function abrirSugerirCanto() {
  const modal = document.getElementById('modal-sugerir');
  if (!modal) return;

  poblarSelectSugerirSeccion();
  document.getElementById('sugerir-tipo').value = 'nueva';
  adaptarFormularioSugerencia();
  document.getElementById('sugerir-referencia').value = '';
  document.getElementById('sugerir-titulo').value = '';
  document.getElementById('sugerir-mensaje').value = '';

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function sugerirCorreccionCancionActual() {
  if (!cancionActualModal) return;
  const modal = document.getElementById('modal-sugerir');
  if (!modal) return;

  poblarSelectSugerirSeccion();
  document.getElementById('sugerir-tipo').value = 'correccion';
  adaptarFormularioSugerencia();

  document.getElementById('sugerir-referencia').value = `[${cancionActualModal.codigo}] ${cancionActualModal.titulo}`;
  document.getElementById('sugerir-titulo').value = cancionActualModal.titulo;
  document.getElementById('sugerir-mensaje').value = `Corrección sugerida para la letra:\n\n${cancionActualModal.letra}\n\nDetalle de la modificación: `;

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function cerrarModalSugerir() {
  document.getElementById('modal-sugerir')?.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function poblarSelectSugerirSeccion() {
  const sel = document.getElementById('sugerir-seccion');
  if (!sel) return;
  sel.innerHTML = secciones.map(s => `
    <option value="${s.codigo}">${s.nombre} (${s.codigo})</option>
  `).join('');
}

function adaptarFormularioSugerencia() {
  const tipo = document.getElementById('sugerir-tipo')?.value || 'nueva';
  const campoRef = document.getElementById('campo-canto-referencia');
  const campoMom = document.getElementById('campo-momento-liturgico');
  const labelTit = document.getElementById('label-sugerir-titulo');
  const labelMen = document.getElementById('label-sugerir-mensaje');

  if (tipo === 'nueva') {
    campoRef?.classList.add('hidden');
    campoMom?.classList.remove('hidden');
    if (labelTit) labelTit.textContent = 'Título del Canto *';
    if (labelMen) labelMen.textContent = 'Letra Completa *';
  } else if (tipo === 'correccion') {
    campoRef?.classList.remove('hidden');
    campoMom?.classList.add('hidden');
    if (labelTit) labelTit.textContent = 'Título de la canción a corregir *';
    if (labelMen) labelMen.textContent = 'Detalle de la corrección en la letra *';
  } else { // baja
    campoRef?.classList.remove('hidden');
    campoMom?.classList.add('hidden');
    if (labelTit) labelTit.textContent = 'Canción que se sugiere retirar *';
    if (labelMen) labelMen.textContent = 'Motivo por el cual ya no se usa *';
  }
}

function enviarSugerenciaComunidad(e) {
  e.preventDefault();
  const tipo = document.getElementById('sugerir-tipo').value;
  const titulo = document.getElementById('sugerir-titulo').value.trim();
  const mensaje = document.getElementById('sugerir-mensaje').value.trim();
  const autor = document.getElementById('sugerir-autor').value.trim() || 'Anónimo';
  const comunidad = document.getElementById('sugerir-comunidad').value.trim() || 'Comunidad Mercedaria';
  const ref = document.getElementById('sugerir-referencia').value.trim();
  const seccion = document.getElementById('sugerir-seccion').value;

  const nuevaSugerencia = {
    fecha: new Date().toLocaleString('es-AR'),
    tipo: tipo,
    titulo: titulo,
    referencia: ref,
    seccion: seccion,
    mensaje: mensaje,
    remitente: autor,
    comunidad: comunidad
  };

  // Guardar copia local como respaldo
  const buzon = JSON.parse(localStorage.getItem('buzon_sugerencias_mercedario') || '[]');
  buzon.push({ ...nuevaSugerencia, id: Date.now(), estado: 'enviada' });
  localStorage.setItem('buzon_sugerencias_mercedario', JSON.stringify(buzon));

  // Enviar al Google Apps Script (silencioso, sin salir de la página)
  const btnEnviar = document.querySelector('#form-sugerir button[type="submit"]');
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
  }

  fetch(GOOGLE_SCRIPT_SUGERENCIAS_URL, {
    method: 'POST',
    mode: 'no-cors', // necesario para Google Apps Script desde el browser
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevaSugerencia)
  })
  .then(() => {
    cerrarModalSugerir();
    mostrarToast('🎵 ¡Muchas gracias! Tu sugerencia fue enviada al Administrador.');
  })
  .catch(() => {
    // Aunque falle la red, la copia local ya fue guardada
    cerrarModalSugerir();
    mostrarToast('🎵 Sugerencia guardada. Se enviará cuando haya conexión.');
  })
  .finally(() => {
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar Propuesta';
    }
  });
}

// Eventos de teclado y scroll
function inicializarEventos() {
  // Tecla / para buscar, Esc para cerrar modales
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      document.getElementById('input-busqueda')?.focus();
    }
    if (e.key === 'Escape') {
      cerrarModalCancion();
      cerrarModalNuevaCancion();
      cerrarModalLoginAdmin();
      cerrarModalGaleria();
      cerrarModalIndice();
      cerrarModalSugerir();
      const drawer = document.getElementById('drawer-repertorio');
      if (drawer && !drawer.classList.contains('translate-x-full')) {
        drawer.classList.add('translate-x-full');
      }
    }
    if (e.key === 'ArrowLeft' && !document.getElementById('modal-cancion').classList.contains('hidden')) {
      navegarCancionModal(-1);
    }
    if (e.key === 'ArrowRight' && !document.getElementById('modal-cancion').classList.contains('hidden')) {
      navegarCancionModal(1);
    }
  });

  // Botón flotante para subir
  window.addEventListener('scroll', () => {
    const btn = document.getElementById('btn-subir');
    if (!btn) return;
    if (window.scrollY > 400) {
      btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.add('opacity-100', 'translate-y-0');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.remove('opacity-100', 'translate-y-0');
    }
  });
}

