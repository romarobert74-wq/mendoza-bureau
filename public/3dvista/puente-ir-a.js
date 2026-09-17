/* =============================================================================
 * PUENTE 3DVista <-> Mendoza Bureau  -  TOURS DE SOCIOS
 * =============================================================================
 * Pegar TODO en: 3DVista -> TOUR -> "Al comenzar" -> "Ejecutar JavaScript".
 *
 * Hace: navegacion "Ir a" por NOMBRE, cierre de la botonera y de la ficha
 * (X internas de los webframes) y estadisticas (ingreso, tiempo, panoramas).
 *
 * IMPORTANTE: el listener de mensajes se registra PRIMERO, asi el cierre de
 * las X funciona siempre, aunque el tracking tuviera algun problema.
 * Todo el archivo es ASCII (no se corrompe al copiar/pegar).
 * ========================================================================== */
(function () {
  'use strict';

  function getPlayer() {
    if (window.tour && tour.player) return tour.player;
    if (window.player) return window.player;
    if (window.tour) return window.tour;
    return null;
  }

  // Oculta todos los componentes cuyo label/id este en la lista. Devuelve cuantos.
  function ocultarPorNombre(nombres) {
    var pl = getPlayer();
    if (!pl || !pl.getByClassName) return 0;
    var clases = ['Container', 'Group', 'ViewerArea', 'WebFrame', 'Image', 'IconButton', 'ImageButton', 'TextBox', 'FlatPanoramaPlayer'];
    var obj = nombres.map(function (n) { return String(n).toLowerCase(); });
    var n = 0;
    for (var c = 0; c < clases.length; c++) {
      var arr = []; try { arr = pl.getByClassName(clases[c]) || []; } catch (e) {}
      for (var i = 0; i < arr.length; i++) {
        var l = ''; try { l = (arr[i].get('data') && arr[i].get('data').label) || ''; } catch (e) {}
        if (!l) { try { l = arr[i].get('id') || ''; } catch (e) {} }
        if (l && obj.indexOf(String(l).toLowerCase()) >= 0) { try { arr[i].set('visible', false); n++; } catch (e) {} }
      }
    }
    return n;
  }

  // Oculta cualquier WebFrame cuya URL contenga el fragmento dado.
  function ocultarWebframePorUrl(frag) {
    try {
      var pl = getPlayer();
      var wfs = (pl && pl.getByClassName) ? (pl.getByClassName('WebFrame') || []) : [];
      for (var i = 0; i < wfs.length; i++) {
        var u = ''; try { u = wfs[i].get('url') || ''; } catch (e) {}
        if (u.indexOf(frag) >= 0) { try { wfs[i].set('visible', false); } catch (e) {} }
      }
    } catch (e) {}
  }

  function cerrarBotonera() {
    ocultarPorNombre(['BOTONERA-CENTRAL', 'BOTONERA-PPAL', 'BOTONERA-PRINCIPAL', 'BOTONERA', 'BTN-CERRAR', 'Container X global', 'CONTAINER-X-GLOBAL', 'CONTAINER-X']);
    ocultarWebframePorUrl('/tour/ir-a');
  }
  function cerrarFicha() {
    ocultarPorNombre(['INFO-SOCIO', 'FICHA-SOCIO', 'INFO']);
    ocultarWebframePorUrl('/tour/socio/ficha');
  }
  function cerrarOnboarding() {
    ocultarPorNombre(['ONBOARDING', 'BIENVENIDA', 'INTRO']);
    ocultarWebframePorUrl('onboarding');
  }

  // Muestra un contenedor por nombre + sus hijos (para botones flotantes).
  function abrirPorNombre(nombre) {
    var pl = getPlayer();
    if (!pl || !pl.getByClassName) return;
    var clases = ['Container', 'Group', 'WebFrame', 'Image', 'IconButton', 'ImageButton'];
    for (var c = 0; c < clases.length; c++) {
      var arr = []; try { arr = pl.getByClassName(clases[c]) || []; } catch (e) {}
      for (var i = 0; i < arr.length; i++) {
        var l = ''; try { l = (arr[i].get('data') && arr[i].get('data').label) || arr[i].get('id') || ''; } catch (e) {}
        if (l && String(l).toLowerCase() === String(nombre).toLowerCase()) {
          try { arr[i].set('visible', true); } catch (e) {}
          var kids = null;
          try { kids = arr[i].get('children') || arr[i].get('components') || arr[i].get('items'); } catch (e) {}
          if (kids && kids.length) for (var k = 0; k < kids.length; k++) { try { kids[k].set('visible', true); } catch (e) {} }
        }
      }
    }
  }

  // ---- Navegacion "Ir a" por NOMBRE ----
  function todasLasPlaylists() {
    var pls = [];
    try { if (window.tour && tour.mainPlayList) pls.push(tour.mainPlayList); } catch (e) {}
    try {
      var p = getPlayer();
      if (p && p.getByClassName) { var a = p.getByClassName('PlayList') || []; for (var i = 0; i < a.length; i++) if (pls.indexOf(a[i]) < 0) pls.push(a[i]); }
    } catch (e) {}
    return pls;
  }
  function nombreDe(item) {
    var m; try { m = item.get('media'); } catch (e) { m = null; }
    var c = [];
    try { c.push(m && m.get('label')); } catch (e) {}
    try { c.push(m && m.get('data') && m.get('data').label); } catch (e) {}
    try { c.push(m && m.get('id')); } catch (e) {}
    try { c.push(item && item.get('id')); } catch (e) {}
    for (var i = 0; i < c.length; i++) if (c[i]) return String(c[i]);
    return '';
  }
  var RE_DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');
  function normalizar(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(RE_DIACRITICOS, '').replace(/\s+/g, '-').trim();
  }
  function irA(nombre) {
    var obj = normalizar(nombre);
    var pls = todasLasPlaylists();
    var player = getPlayer();
    for (var p = 0; p < pls.length; p++) {
      var items; try { items = pls[p].get('items') || []; } catch (e) { items = []; }
      for (var i = 0; i < items.length; i++) {
        if (normalizar(nombreDe(items[i])) === obj) {
          try { if (player && player.setMediaByIndex) player.setMediaByIndex(pls[p], i); } catch (e) {}
          try { pls[p].set('selectedIndex', i); } catch (e) {}
          try { var md = items[i].get('media'); if (player && player.openMedia && md) player.openMedia(md); } catch (e) {}
          return;
        }
      }
    }
  }

  // ====== LISTENER (PRIMERO: el cierre nunca depende del tracking) ======
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || typeof d !== 'object' || d.source !== 'bureau-ir-a') return;
    if (d.tipo === 'mb-ir-a') irA(d.panorama);
    else if (d.tipo === 'mb-cerrar-ir-a') cerrarBotonera();
    else if (d.tipo === 'mb-cerrar-ficha') cerrarFicha();
    else if (d.tipo === 'mb-cerrar-onboarding') cerrarOnboarding();
    else if (d.tipo === 'mb-abrir') abrirPorNombre(d.objetivo);
  });

  // ====== TRACKING (envuelto: no puede romper lo de arriba) ======
  try {
    var TRACK_URL = 'https://mendoza-bureau.vercel.app/api/track';
    var socioIdCache = null;

    var detectarSocioId = function () {
      if (socioIdCache) return socioIdCache;
      var buscar = function (u) {
        if (!u) return null;
        var m = String(u).match(/\/tour\/ir-a\/([A-Za-z0-9_-]+)/) || String(u).match(/[?&]id=([A-Za-z0-9_-]+)/);
        return m ? m[1] : null;
      };
      try {
        var ifr = document.getElementsByTagName('iframe');
        for (var i = 0; i < ifr.length; i++) { var s = ''; try { s = ifr[i].src || ''; } catch (e) {} var id = buscar(s); if (id) { socioIdCache = id; return id; } }
      } catch (e) {}
      try {
        var pl = getPlayer();
        if (pl && pl.getByClassName) { var wfs = pl.getByClassName('WebFrame') || []; for (var j = 0; j < wfs.length; j++) { var u = ''; try { u = wfs[j].get('url') || ''; } catch (e) {} var id2 = buscar(u); if (id2) { socioIdCache = id2; return id2; } } }
      } catch (e) {}
      return null;
    };

    var enviarEvento = function (tipo, ms, nombre) {
      try {
        var sid = detectarSocioId() || 'madre';
        var payload = JSON.stringify({ socioId: sid, tipo: tipo, ms: ms, nombre: nombre });
        if (navigator.sendBeacon) navigator.sendBeacon(TRACK_URL, payload);
        else fetch(TRACK_URL, { method: 'POST', body: payload, keepalive: true, mode: 'cors' });
      } catch (e) {}
    };

    var _t0 = Date.now();
    var _tiempoEnviado = false;
    var enviarTiempo = function () {
      if (_tiempoEnviado) return;
      var ms = Date.now() - _t0;
      if (ms < 3000) return;
      _tiempoEnviado = true;
      enviarEvento('webframe_tiempo', ms);
    };

    setTimeout(function () { enviarEvento('tour'); }, 1500);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') enviarTiempo(); });
    window.addEventListener('pagehide', enviarTiempo);
    window.addEventListener('beforeunload', enviarTiempo);

    var _panActual = null;
    var panoramaActual = function () {
      try {
        var pls = todasLasPlaylists();
        if (!pls.length) return null;
        var idx = pls[0].get('selectedIndex');
        var items = pls[0].get('items') || [];
        if (idx == null || !items[idx]) return null;
        return normalizar(nombreDe(items[idx]));
      } catch (e) { return null; }
    };
    setInterval(function () {
      var p = panoramaActual();
      if (p && p !== _panActual) { _panActual = p; enviarEvento('panorama', undefined, p); }
    }, 1500);
  } catch (e) {}
})();
