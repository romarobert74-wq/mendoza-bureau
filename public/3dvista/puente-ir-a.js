/* =============================================================================
 * PUENTE 3DVista ⇄ Sistema Mendoza Bureau  —  navegación "Ir a" por NOMBRE
 * =============================================================================
 *
 * QUÉ HACE
 *   Escucha los mensajes que manda el webframe (la botonera) y hace que el tour
 *   salte al panorama cuyo NOMBRE coincida. También responde para diagnóstico.
 *
 * DÓNDE SE PEGA (una sola vez por tour)
 *   3DVista → seleccioná el TOUR (no un panorama) → pestaña de acciones →
 *   evento "Al comenzar / Begin" → acción "Ejecutar JavaScript / Execute JS"
 *   → pegá TODO este contenido.
 *   (No hace falta subir el archivo; es solo para tenerlo versionado acá.)
 *
 * CÓMO NOMBRAR LOS PANORAMAS
 *   En 3DVista, a cada panorama ponele un "label" simple y sin acentos:
 *   recepcion, habitaciones, piscina, sala-cata, sunset...
 *   Ese mismo nombre es el que cargás en el panel del sistema.
 *
 * IMPORTANTE: distintas versiones de 3DVista exponen la API distinto. Por eso
 * este script prueba varias vías y te avisa en el banco de pruebas cuál anduvo.
 * ========================================================================== */
(function () {
  'use strict';

  // Respuesta hacia el/los webframes (todos los iframes hijos + el emisor)
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

  // Devuelve la lista de "items" de reproducción del tour, según la versión.
  function getItems() {
    try { if (window.tour && tour.mainPlayList) return tour.mainPlayList.get('items') || []; } catch (e) {}
    try { if (window.tour && tour.player) { var p = tour.player.getByClassName('PlayList'); if (p && p[0]) return p[0].get('items'); } } catch (e) {}
    return [];
  }

  // Nombre "legible" de un item (probamos varios campos posibles).
  function nombreDe(item) {
    var m; try { m = item.get('media'); } catch (e) { m = null; }
    var cands = [];
    try { cands.push(m && m.get('label')); } catch (e) {}
    try { cands.push(m && m.get('data') && m.get('data').label); } catch (e) {}
    try { cands.push(m && m.get('id')); } catch (e) {}
    try { cands.push(item && item.get('id')); } catch (e) {}
    for (var i = 0; i < cands.length; i++) {
      if (cands[i]) return String(cands[i]);
    }
    return '';
  }

  function normalizar(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos
      .replace(/\s+/g, '-')
      .trim();
  }

  function irA(nombre, source) {
    var objetivo = normalizar(nombre);
    var items = getItems();
    for (var i = 0; i < items.length; i++) {
      if (normalizar(nombreDe(items[i])) === objetivo) {
        var ok = false;
        // Vía 1: cambiar selectedIndex del playlist
        try { tour.mainPlayList.set('selectedIndex', i); ok = true; } catch (e) {}
        // Vía 2: setMediaByIndex (algunas versiones)
        if (!ok) { try { tour.setMediaByIndex(tour.mainPlayList, i); ok = true; } catch (e) {} }
        responder(source, { tipo: ok ? 'mb-ir-a-ok' : 'mb-ir-a-fail', panorama: nombre });
        return;
      }
    }
    responder(source, { tipo: 'mb-ir-a-fail', panorama: nombre });
  }

  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || typeof d !== 'object' || d.source !== 'bureau-ir-a') return;

    if (d.tipo === 'mb-ping') {
      responder(ev.source, { tipo: 'mb-pong' });
    } else if (d.tipo === 'mb-listar') {
      var items = getItems(), lista = [];
      for (var i = 0; i < items.length; i++) {
        var n = normalizar(nombreDe(items[i]));
        if (n) lista.push(n);
      }
      responder(ev.source, { tipo: 'mb-panoramas', lista: lista });
    } else if (d.tipo === 'mb-ir-a') {
      irA(d.panorama, ev.source);
    }
  });

  // Aviso de que el puente cargó (por si el webframe abre después)
  responder(null, { tipo: 'mb-pong' });
})();
