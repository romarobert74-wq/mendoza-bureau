(function () {
  'use strict';
  function getPlayer(){ if(window.tour&&tour.player)return tour.player; if(window.player)return window.player; if(window.tour)return window.tour; return null; }

  function ocultar(nombres){
    var pl=getPlayer(); if(!pl||!pl.getByClassName) return;
    var clases=['Container','Group','WebFrame','Image','IconButton','ImageButton','TextBox'];
    var obj=nombres.map(function(n){return String(n).toLowerCase();});
    for(var c=0;c<clases.length;c++){ var arr=[]; try{arr=pl.getByClassName(clases[c])||[];}catch(e){}
      for(var i=0;i<arr.length;i++){ var l=''; try{l=(arr[i].get('data')&&arr[i].get('data').label)||'';}catch(e){} if(!l){try{l=arr[i].get('id')||'';}catch(e){}}
        if(l&&obj.indexOf(String(l).toLowerCase())>=0){ try{arr[i].set('visible',false);}catch(e){} } } }
  }
  function ocultarWF(frag){ try{ var pl=getPlayer(); var w=(pl&&pl.getByClassName)?(pl.getByClassName('WebFrame')||[]):[]; for(var i=0;i<w.length;i++){ var u=''; try{u=w[i].get('url')||'';}catch(e){} if(u.indexOf(frag)>=0){try{w[i].set('visible',false);}catch(e){}} } }catch(e){} }

  function cerrarBotonera(){ ocultar(['BOTONERA-CENTRAL','BOTONERA-PPAL','BOTONERA','BTN-CERRAR','Container X global']); ocultarWF('/tour/ir-a'); }
  function cerrarFicha(){ ocultar(['INFO-SOCIO','FICHA-SOCIO','INFO']); ocultarWF('/tour/socio/ficha'); }

  function playlists(){ var a=[]; try{if(window.tour&&tour.mainPlayList)a.push(tour.mainPlayList);}catch(e){} try{var p=getPlayer(); if(p&&p.getByClassName){var b=p.getByClassName('PlayList')||[]; for(var i=0;i<b.length;i++)if(a.indexOf(b[i])<0)a.push(b[i]);}}catch(e){} return a; }
  function nom(it){ var m; try{m=it.get('media');}catch(e){m=null;} var c=[]; try{c.push(m&&m.get('label'));}catch(e){} try{c.push(m&&m.get('data')&&m.get('data').label);}catch(e){} try{c.push(m&&m.get('id'));}catch(e){} try{c.push(it&&it.get('id'));}catch(e){} for(var i=0;i<c.length;i++)if(c[i])return String(c[i]); return ''; }
  var RE=new RegExp('[\\u0300-\\u036f]','g');
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(RE,'').replace(/\s+/g,'-').trim(); }
  function irA(nombre){ var o=norm(nombre); var P=playlists(); var pl=getPlayer(); for(var p=0;p<P.length;p++){ var it; try{it=P[p].get('items')||[];}catch(e){it=[];} for(var i=0;i<it.length;i++){ if(norm(nom(it[i]))===o){ try{if(pl&&pl.setMediaByIndex)pl.setMediaByIndex(P[p],i);}catch(e){} try{P[p].set('selectedIndex',i);}catch(e){} return; } } } }

  // LISTENER (cierre/navegacion) -- se registra PRIMERO
  window.addEventListener('message', function(ev){
    var d=ev.data; if(!d||typeof d!=='object'||d.source!=='bureau-ir-a') return;
    if(d.tipo==='mb-ir-a') irA(d.panorama);
    else if(d.tipo==='mb-cerrar-ir-a') cerrarBotonera();
    else if(d.tipo==='mb-cerrar-ficha') cerrarFicha();
  });

  // ESTADISTICAS (envuelto: no puede romper el cierre de arriba)
  try {
    var TRACK_URL='https://mendoza-bureau.vercel.app/api/track';
    var sidCache=null;
    var detId=function(){
      if(sidCache)return sidCache;
      var busc=function(u){ if(!u)return null; var m=String(u).match(/\/tour\/ir-a\/([A-Za-z0-9_-]+)/)||String(u).match(/[?&]id=([A-Za-z0-9_-]+)/); return m?m[1]:null; };
      try{ var f=document.getElementsByTagName('iframe'); for(var i=0;i<f.length;i++){ var s=''; try{s=f[i].src||'';}catch(e){} var id=busc(s); if(id){sidCache=id;return id;} } }catch(e){}
      try{ var pl=getPlayer(); if(pl&&pl.getByClassName){ var w=pl.getByClassName('WebFrame')||[]; for(var j=0;j<w.length;j++){ var u=''; try{u=w[j].get('url')||'';}catch(e){} var id2=busc(u); if(id2){sidCache=id2;return id2;} } } }catch(e){}
      return null;
    };
    var ev2=function(tipo,ms,nombre){ try{ var sid=detId()||'madre'; var pay=JSON.stringify({socioId:sid,tipo:tipo,ms:ms,nombre:nombre}); if(navigator.sendBeacon)navigator.sendBeacon(TRACK_URL,pay); else fetch(TRACK_URL,{method:'POST',body:pay,keepalive:true,mode:'cors'}); }catch(e){} };
    var t0=Date.now(), tEnv=false;
    var envT=function(){ if(tEnv)return; var ms=Date.now()-t0; if(ms<3000)return; tEnv=true; ev2('webframe_tiempo',ms); };
    setTimeout(function(){ ev2('tour'); },1500);
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden')envT(); });
    window.addEventListener('pagehide',envT);
    window.addEventListener('beforeunload',envT);
    var panAct=null;
    var panActual=function(){ try{ var P=playlists(); if(!P.length)return null; var idx=P[0].get('selectedIndex'); var it=P[0].get('items')||[]; if(idx==null||!it[idx])return null; return norm(nom(it[idx])); }catch(e){return null;} };
    setInterval(function(){ var p=panActual(); if(p&&p!==panAct){ panAct=p; ev2('panorama',undefined,p); } },1500);
  } catch(e){}
})();
