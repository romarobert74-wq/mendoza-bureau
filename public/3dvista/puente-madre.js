/* =============================================================================
 * PUENTE 3DVista - TOUR MADRE  -  SOLO ESTADISTICAS
 * =============================================================================
 * Pega TODO este contenido en:
 *   3DVista - TOUR - evento "Al comenzar / Begin" - "Ejecutar JavaScript".
 *
 * Que hace: mide INGRESO al tour madre, TIEMPO de permanencia y PANORAMAS vistos.
 * NO abre ni cierra ventanas: la X del menu y los botones los manejas vos en 3DVista.
 *
 * (El menu principal y el bot IA registran su apertura por su cuenta, desde el
 *  propio webframe; este puente no se encarga de eso.)
 * ========================================================================== */
(function () {
  'use strict';

  var TRACK_URL = 'https://mendoza-bureau.vercel.app/api/track';
  var SOCIO_ID = 'madre';   // este puente es exclusivo del TOUR MADRE

  function getPlayer() {
    if (window.tour && tour.player) return tour.player;
    if (window.player) return window.player;
    if (window.tour) return window.tour;
    return null;
  }

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
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(new RegExp('[\\u0300-\\u036f]','g'), '')
      .replace(/\s+/g, '-').trim();
  }

  function enviarEvento(tipo, ms, nombre) {
    try {
      var payload = JSON.stringify({ socioId: SOCIO_ID, tipo: tipo, ms: ms, nombre: nombre });
      if (navigator.sendBeacon) navigator.sendBeacon(TRACK_URL, payload);
      else fetch(TRACK_URL, { method: 'POST', body: payload, keepalive: true, mode: 'cors' });
    } catch (e) {}
  }

  // Permanencia: acumulamos desde la carga y enviamos UNA vez al salir.
  var _t0 = Date.now();
  var _tiempoEnviado = false;
  function enviarTiempo() {
    if (_tiempoEnviado) return;
    var ms = Date.now() - _t0;
    if (ms < 3000) return;           // descarta rebotes < 3 s
    _tiempoEnviado = true;
    enviarEvento('webframe_tiempo', ms);
  }

  // Ingreso al tour madre.
  setTimeout(function () { enviarEvento('tour'); }, 1500);
  try {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') enviarTiempo();
    });
    window.addEventListener('pagehide', enviarTiempo);
    window.addEventListener('beforeunload', enviarTiempo);
  } catch (e) {}

  // Panoramas vistos: en cada cambio, enviamos su nombre.
  var _panActual = null;
  function panoramaActual() {
    try {
      var pls = todasLasPlaylists();
      if (!pls.length) return null;
      var idx = pls[0].get('selectedIndex');
      var items = pls[0].get('items') || [];
      if (idx == null || !items[idx]) return null;
      return normalizar(nombreDe(items[idx]));
    } catch (e) { return null; }
  }
  setInterval(function () {
    var p = panoramaActual();
    if (p && p !== _panActual) { _panActual = p; enviarEvento('panorama', undefined, p); }
  }, 1500);

  // -- Cierre del ONBOARDING (nuestra intro) ---------------------------------
  // Unica ventana que maneja este puente: el boton "Comenzar" del onboarding
  // manda este mensaje y ocultamos el contenedor/webframe de la intro.
  // (El menu "Descubri la zona" y su X los seguis manejando vos en 3DVista.)
  function ocultarOnboarding() {
    try {
      var p = getPlayer();
      if (!p || !p.getByClassName) return;
      var clases = ['Container', 'Group', 'WebFrame', 'Image'];
      var nombres = ['onboarding', 'bienvenida', 'intro'];
      for (var c = 0; c < clases.length; c++) {
        var arr = []; try { arr = p.getByClassName(clases[c]) || []; } catch (e) {}
        for (var i = 0; i < arr.length; i++) {
          var lab = ''; try { lab = (arr[i].get('data') && arr[i].get('data').label) || arr[i].get('id') || ''; } catch (e) {}
          var url = ''; try { url = arr[i].get('url') || ''; } catch (e) {}
          if ((lab && nombres.indexOf(String(lab).toLowerCase()) >= 0) || url.indexOf('onboarding') >= 0) {
            try { arr[i].set('visible', false); } catch (e) {}
          }
        }
      }
    } catch (e) {}
  }
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (d && typeof d === 'object' && d.source === 'bureau-ir-a' && d.tipo === 'mb-cerrar-onboarding') ocultarOnboarding();
  });
})();
