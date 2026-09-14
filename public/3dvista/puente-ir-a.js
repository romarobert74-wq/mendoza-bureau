/* =============================================================================
 * PUENTE 3DVista ⇄ Sistema Mendoza Bureau  —  navegación "Ir a" por NOMBRE
 * =============================================================================
 *
 * DÓNDE SE PEGA (una sola vez por tour)
 *   3DVista → seleccioná el TOUR → evento "Al comenzar / Begin" →
 *   acción "Ejecutar JavaScript" → pegá TODO este contenido.
 *
 * NOMBRES DE PANORAMAS
 *   En 3DVista poné a cada panorama un label simple y sin acentos:
 *   recepcion, habitaciones, piscina, sala-cata, sunset...
 *   Ese mismo nombre se carga en el panel del sistema.
 *
 * Este script prueba VARIAS formas de navegar (según la versión de 3DVista)
 * y avisa por el registro cuál funcionó (campo "metodo").
 * ========================================================================== */
(function () {
  'use strict';

  function responder(source, msg) {
    var payload = Object.assign({ source: 'bureau-tour' }, msg);
    try { if (source) source.postMessage(payload, '*'); } catch (e) {}
    try {
      var ifr = document.getElementsByTagName('iframe');
      for (var i = 0; i < ifr.length; i++) {
        try { ifr[i].contentWindow.postMessage(payload, '*'); } catch (e) {}
      }
    } catch (e) {}
  }

  function getPlayer() {
    if (window.tour && tour.player) return tour.player;
    if (window.player) return window.player;
    if (window.tour) return window.tour;
    return null;
  }

  /* ==========================================================================
   * MÉTRICAS DEL TOUR  →  ingresos + tiempo de permanencia
   * Manda eventos a nuestro sistema (dominio distinto) para medir por socio.
   * No configurás nada: el socioId se detecta solo de la URL del webframe.
   * ======================================================================== */
  var TRACK_URL = 'https://mendoza-bureau.vercel.app/api/track';
  var socioIdCache = null;

  function detectarSocioId() {
    if (socioIdCache) return socioIdCache;
    function buscar(u) {
      if (!u) return null;
      var m = String(u).match(/\/tour\/ir-a\/([A-Za-z0-9_-]+)/) ||
              String(u).match(/[?&]id=([A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    }
    // 1) iframes en el DOM
    try {
      var ifr = document.getElementsByTagName('iframe');
      for (var i = 0; i < ifr.length; i++) {
        var s = ''; try { s = ifr[i].src || ''; } catch (e) {}
        var id = buscar(s); if (id) { socioIdCache = id; return id; }
      }
    } catch (e) {}
    // 2) WebFrames de 3DVista (por si el iframe todavía no está en el DOM)
    try {
      var p = getPlayer();
      if (p && p.getByClassName) {
        var wfs = p.getByClassName('WebFrame') || [];
        for (var j = 0; j < wfs.length; j++) {
          var u = ''; try { u = wfs[j].get('url') || ''; } catch (e) {}
          var id2 = buscar(u); if (id2) { socioIdCache = id2; return id2; }
        }
      }
    } catch (e) {}
    return null;
  }

  function enviarEvento(tipo, ms) {
    try {
      var sid = detectarSocioId() || 'madre';
      var payload = JSON.stringify({ socioId: sid, tipo: tipo, ms: ms });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, payload);
      } else {
        fetch(TRACK_URL, { method: 'POST', body: payload, keepalive: true, mode: 'cors' });
      }
    } catch (e) {}
  }

  // Permanencia: acumulamos desde que carga el tour y enviamos UNA vez al salir.
  var _t0 = Date.now();
  var _tiempoEnviado = false;
  function enviarTiempo() {
    if (_tiempoEnviado) return;
    var ms = Date.now() - _t0;
    if (ms < 3000) return;           // descarta rebotes < 3 s
    _tiempoEnviado = true;
    enviarEvento('webframe_tiempo', ms);
  }

  // Ingreso: esperamos ~1.5 s para que carguen los webframes y detectar el socioId.
  setTimeout(function () { enviarEvento('tour'); }, 1500);
  // Salida (visibilitychange es lo más confiable, sobre todo en celular).
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') enviarTiempo();
    });
    window.addEventListener('pagehide', enviarTiempo);
    window.addEventListener('beforeunload', enviarTiempo);
  } catch (e) {}

  // Devuelve TODAS las playlists del tour (puede haber más de una).
  function todasLasPlaylists() {
    var pls = [];
    try { if (window.tour && tour.mainPlayList) pls.push(tour.mainPlayList); } catch (e) {}
    try {
      var p = getPlayer();
      if (p && p.getByClassName) {
        var arr = p.getByClassName('PlayList') || [];
        for (var i = 0; i < arr.length; i++) if (pls.indexOf(arr[i]) < 0) pls.push(arr[i]);
      }
    } catch (e) {}
    return pls;
  }

  function nombreDe(item) {
    var m; try { m = item.get('media'); } catch (e) { m = null; }
    var cands = [];
    try { cands.push(m && m.get('label')); } catch (e) {}
    try { cands.push(m && m.get('data') && m.get('data').label); } catch (e) {}
    try { cands.push(m && m.get('id')); } catch (e) {}
    try { cands.push(item && item.get('id')); } catch (e) {}
    for (var i = 0; i < cands.length; i++) if (cands[i]) return String(cands[i]);
    return '';
  }

  function normalizar(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  function irA(nombre, source) {
    var objetivo = normalizar(nombre);
    var pls = todasLasPlaylists();
    var player = getPlayer();
    var encontrado = false, metodos = [], idx = -1, plUsada = -1;

    for (var p = 0; p < pls.length; p++) {
      var items; try { items = pls[p].get('items') || []; } catch (e) { items = []; }
      for (var i = 0; i < items.length; i++) {
        if (normalizar(nombreDe(items[i])) === objetivo) {
          encontrado = true; idx = i; plUsada = p;

          // Método A — player.setMediaByIndex(playlist, index)  (mueve el visor)
          try { if (player && player.setMediaByIndex) { player.setMediaByIndex(pls[p], i); metodos.push('setMediaByIndex(pl,i)'); } } catch (e) {}
          // Método B — player.setMediaByIndex(index)  (firma corta)
          if (!metodos.length) { try { if (player && player.setMediaByIndex) { player.setMediaByIndex(i); metodos.push('setMediaByIndex(i)'); } } catch (e) {} }
          // Método C — selectedIndex de ESTA playlist
          try { pls[p].set('selectedIndex', i); metodos.push('selectedIndex#' + p); } catch (e) {}
          // Método D — openMedia con el objeto media
          try {
            var media = items[i].get('media');
            if (player && player.openMedia && media) { player.openMedia(media); metodos.push('openMedia'); }
          } catch (e) {}

          responder(source, {
            tipo: metodos.length ? 'mb-ir-a-ok' : 'mb-ir-a-fail',
            panorama: nombre, metodo: metodos.join(' + ') || '(ninguno)',
            playlist: plUsada, indice: idx, playlists: pls.length,
          });
          return;
        }
      }
    }
    responder(source, { tipo: 'mb-ir-a-fail', panorama: nombre, playlists: pls.length });
  }

  // Diagnóstico: qué expone este 3DVista
  function dump(source) {
    var player = getPlayer();
    var pls = todasLasPlaylists();
    var info = {
      hayTour: !!window.tour,
      hayPlayer: !!player,
      playlists: pls.length,
      itemsPorPlaylist: pls.map(function (pl) { try { return (pl.get('items') || []).length; } catch (e) { return -1; } }),
      metodosPlayer: [],
    };
    try {
      ['setMediaByIndex', 'openMedia', 'setMediaByName', 'getByClassName', 'getMainViewer', 'set']
        .forEach(function (m) { if (player && typeof player[m] === 'function') info.metodosPlayer.push(m); });
    } catch (e) {}
    responder(source, { tipo: 'mb-dump', info: info });
  }

  // Nombre del CONTENEDOR de la botonera en 3DVista (el que muestra/oculta el
  // botón "Ir a"). Debe llamarse así en tu skin. Si algún día lo renombrás,
  // agregá el nuevo nombre a esta lista.
  var NOMBRES_CONTENEDOR = ['BOTONERA-CENTRAL', 'BOTONERA-PPAL', 'BOTONERA-PRINCIPAL', 'BOTONERA'];
  // Botón "X" de cerrar y su contenedor. En 3DVista, ocultar el contenedor padre
  // NO siempre oculta los hijos, así que ocultamos también estos por su nombre.
  // Poné a tu botón X (o a su container) alguno de estos labels.
  var NOMBRES_CERRAR = ['BTN-CERRAR', 'CERRAR', 'X-CERRAR', 'CERRAR-IRA', 'BOTONERA-X',
                        'Container X global', 'CONTAINER-X-GLOBAL', 'CONTAINER-X', 'CONTAINER X'];

  // Oculta TODOS los componentes cuyo label esté en la lista (no solo el primero).
  // Devuelve cuántos ocultó.
  function ocultarPorNombre(nombres) {
    var player = getPlayer();
    if (!player || !player.getByClassName) return 0;
    var clases = ['Container', 'Group', 'ViewerArea', 'WebFrame', 'Image',
                  'IconButton', 'ImageButton', 'TextBox', 'FlatPanoramaPlayer'];
    var objetivos = nombres.map(function (n) { return String(n).toLowerCase(); });
    var n = 0;
    for (var c = 0; c < clases.length; c++) {
      var arr = [];
      try { arr = player.getByClassName(clases[c]) || []; } catch (e) {}
      for (var i = 0; i < arr.length; i++) {
        var lab = '';
        try { lab = (arr[i].get('data') && arr[i].get('data').label) || ''; } catch (e) {}
        if (!lab) { try { lab = arr[i].get('id') || ''; } catch (e) {} }
        if (lab && objetivos.indexOf(String(lab).toLowerCase()) >= 0) {
          try { arr[i].set('visible', false); n++; } catch (e) {}
        }
      }
    }
    return n;
  }

  // Busca un componente por su nombre/etiqueta entre varias clases de 3DVista.
  function hallarPorNombre(nombres) {
    var player = getPlayer();
    if (!player || !player.getByClassName) return null;
    var clases = ['Container', 'Group', 'ViewerArea', 'WebFrame', 'Image',
                  'IconButton', 'ImageButton', 'TextBox', 'FlatPanoramaPlayer'];
    var objetivos = nombres.map(function (n) { return String(n).toLowerCase(); });
    for (var c = 0; c < clases.length; c++) {
      var arr = [];
      try { arr = player.getByClassName(clases[c]) || []; } catch (e) {}
      for (var i = 0; i < arr.length; i++) {
        var lab = '';
        try { lab = (arr[i].get('data') && arr[i].get('data').label) || ''; } catch (e) {}
        if (!lab) { try { lab = arr[i].get('id') || ''; } catch (e) {} }
        if (lab && objetivos.indexOf(String(lab).toLowerCase()) >= 0) return arr[i];
      }
    }
    return null;
  }

  // Cierra la botonera ocultando el CONTENEDOR (no el webframe interno), que es
  // el mismo objeto que muestra el botón "Ir a". Así se puede reabrir siempre.
  function cerrarBotonera() {
    // Cierre SIMÉTRICO: como en 3DVista ocultar el contenedor no siempre oculta
    // a los hijos, ocultamos TODO explícitamente (contenedor + X + webframe).
    // La reapertura la hace el botón "Ir a" con una acción "Mostrar" que muestra
    // esos mismos elementos.
    ocultarPorNombre(NOMBRES_CONTENEDOR);
    ocultarPorNombre(NOMBRES_CERRAR);
    try {
      var player = getPlayer();
      var wfs = (player && player.getByClassName) ? (player.getByClassName('WebFrame') || []) : [];
      for (var i = 0; i < wfs.length; i++) {
        var url = '';
        try { url = wfs[i].get('url') || ''; } catch (e) {}
        if (url.indexOf('/tour/ir-a') >= 0) { try { wfs[i].set('visible', false); } catch (e) {} }
      }
    } catch (e) {}
  }

  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || typeof d !== 'object' || d.source !== 'bureau-ir-a') return;

    if (d.tipo === 'mb-abrir') {
      // Muestra un contenedor por nombre (botones flotantes: Info / Ir a),
      // junto con sus hijos (para que también aparezca el webframe interno).
      var comp = hallarPorNombre([d.objetivo]);
      if (comp) {
        try { comp.set('visible', true); } catch (e) {}
        var kids = null;
        try { kids = comp.get('children'); } catch (e) {}
        if (!kids) { try { kids = comp.get('components'); } catch (e) {} }
        if (!kids) { try { kids = comp.get('items'); } catch (e) {} }
        if (kids && kids.length) {
          for (var k = 0; k < kids.length; k++) {
            try { kids[k].set('visible', true); } catch (e) {}
          }
        }
      }
    } else if (d.tipo === 'mb-cerrar-ir-a') {
      cerrarBotonera();
    } else if (d.tipo === 'mb-ping') {
      responder(ev.source, { tipo: 'mb-pong' });
    } else if (d.tipo === 'mb-listar') {
      var pls = todasLasPlaylists(), lista = [];
      for (var p = 0; p < pls.length; p++) {
        var items; try { items = pls[p].get('items') || []; } catch (e) { items = []; }
        for (var i = 0; i < items.length; i++) {
          var n = normalizar(nombreDe(items[i]));
          if (n && lista.indexOf(n) < 0) lista.push(n);
        }
      }
      responder(ev.source, { tipo: 'mb-panoramas', lista: lista });
    } else if (d.tipo === 'mb-dump') {
      dump(ev.source);
    } else if (d.tipo === 'mb-ir-a') {
      irA(d.panorama, ev.source);
    }
  });

  responder(null, { tipo: 'mb-pong' });
})();
