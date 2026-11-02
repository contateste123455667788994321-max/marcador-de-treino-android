(function(){
'use strict';
if(window.__mtAndroidRunning)return;window.__mtAndroidRunning=true;
const $=id=>document.getElementById(id);
const icons={
runner:'<circle cx="15" cy="4" r="2"/><path d="m8 17 4-4 2 2 3 5m-6-10 3-3 3 2 3 1m-6 1-4-2-4 5m-1 7 4-5"/>',
map:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15"/>',
back:'<path d="m15 18-6-6 6-6"/>',
play:'<path d="m8 5 11 7-11 7z"/>',
pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
stop:'<rect x="5" y="5" width="14" height="14" rx="2"/>',
chevron:'<path d="m9 18 6-6-6-6"/>',
shield:'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>'
};
const svg=(name,size=20)=>'<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.map)+'</svg>';
const style=document.createElement('style');style.id='mt-android-run-css';style.textContent="\n#mt-run-home-card{margin:12px 0 10px;display:flex;align-items:center;gap:12px;padding:14px;background:linear-gradient(110deg,#1b3016,#0c170b);border:1px solid #557d30;border-radius:16px;box-shadow:0 3px 17px #a6ff0018;color:#f2ffec;text-align:left;width:100%}\n#mt-run-home-card .run-home-icon{border:1px solid #729744;background:linear-gradient(120deg,#315121,#101e0c);border-radius:13px;width:54px;height:54px;display:grid;place-items:center;flex-shrink:0;box-shadow:0 0 15px #a6ff0029}\n#mt-run-home-card .run-home-icon svg{color:#a6ff00;filter:drop-shadow(0 0 6px #a6ff005b)}\n#mt-run-home-card .run-home-info{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}\n#mt-run-home-card .run-home-info strong{font-size:16px;font-weight:900}\n#mt-run-home-card .run-home-info small{font-size:11px;color:#bfceb8;line-height:1.35}\n#mt-run-home-card>.run-arrow{color:#a6ff00}\n#mt-run-overlay{position:fixed;inset:0;z-index:1300;background:#070c08;color:#f1ffe9;overflow-y:auto;overscroll-behavior:contain}\n#mt-run-overlay[hidden]{display:none!important}\n#mt-run-overlay .run-shell{display:flex;flex-direction:column;min-height:100%;padding-bottom:calc(35px + env(safe-area-inset-bottom))}\n#mt-run-overlay .run-bar{display:flex;align-items:center;justify-content:space-between;padding:14px 15px 7px}\n#mt-run-overlay .run-close{height:36px;width:36px;display:grid;place-items:center;border:1px solid #435e33;border-radius:12px;color:#e7ffdc;background:#182417}\n#mt-run-overlay .run-bar strong{color:#c3ff6d;font-size:12px;letter-spacing:.8px}\n#mt-run-overlay .run-time{font-size:clamp(43px,12.5vw,65px);font-weight:900;letter-spacing:-2px;text-align:center;font-variant-numeric:tabular-nums;line-height:1.05;margin:7px auto 0}\n#mt-run-overlay .run-time-label{text-align:center;color:#aabb9e;font-size:10px;letter-spacing:1.1px;margin:4px 0}\n#mt-run-overlay .run-stats{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:5px;text-align:center;padding:17px 11px 13px}\n#mt-run-overlay .run-stat strong{font-size:clamp(20px,7vw,29px);display:block;font-weight:900;font-variant-numeric:tabular-nums}\n#mt-run-overlay .run-stat small{font-size:9px;color:#a7bc9e;display:block;margin-top:4px;letter-spacing:.2px}\n#mt-run-overlay .run-map-box{position:relative;min-height:295px;height:min(48vh,510px);border:1px solid #465b38;margin:0 12px 11px;border-radius:17px;overflow:hidden;background:#152215;box-shadow:inset 0 0 25px #a6ff0010,0 5px 20px #0007}\n#mt-run-map{width:100%;height:100%;position:absolute;inset:0}\n#mt-run-overlay .run-map-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:radial-gradient(circle,#213b1c,#111b11 70%);text-align:center;padding:30px}\n#mt-run-overlay .run-map-empty svg{color:#a6ff00;filter:drop-shadow(0 0 9px #a6ff0080)}\n#mt-run-overlay .run-map-empty strong{font-size:15px}\n#mt-run-overlay .run-map-empty small{font-size:11px;color:#b7c8af}\n#mt-run-overlay .run-gps{position:absolute;z-index:1000;left:9px;top:10px;display:flex;align-items:center;gap:7px;padding:7px 11px;background:#0b170cef;border:1px solid #47633c;border-radius:50px;font-size:10px;color:#deffd2;font-weight:800}\n#mt-run-overlay .gps-dot{width:8px;height:8px;border-radius:50%;background:#f4b64e}\n#mt-run-overlay .gps-dot.good{background:#a6ff00;box-shadow:0 0 8px #a6ff00}\n#mt-run-overlay .run-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:0 12px}\n#mt-run-overlay .run-actions.single{grid-template-columns:1fr}\n#mt-run-overlay .run-btn{display:flex;align-items:center;justify-content:center;gap:7px;min-height:51px;padding:10px;border-radius:13px;font-size:13px;font-weight:900}\n#mt-run-overlay .run-btn.start{border:0;color:#112406;background:linear-gradient(125deg,#c8ff57,#a6ff00);box-shadow:0 0 14px #a6ff003b}\n#mt-run-overlay .run-btn.pause{border:1px solid #557342;color:#d9ffc7;background:#263c20}\n#mt-run-overlay .run-btn.stop{border:1px solid #864947;color:#ffc7c3;background:#472120}\n#mt-run-overlay .run-note{font-size:11px;line-height:1.5;color:#acc29e;margin:9px 16px;text-align:center}\n#mt-run-overlay .run-privacy{display:flex;gap:9px;align-items:flex-start;margin:13px 12px;padding:12px;background:#152015;border:1px solid #36492d;border-radius:13px;color:#b9d0b1;font-size:11px;line-height:1.5}\n#mt-run-overlay .run-summary-card{border:1px solid #466c33;background:linear-gradient(145deg,#263b1d,#10180f);padding:16px;margin:11px 12px;border-radius:16px;box-shadow:0 0 19px #a6ff0014}\n#mt-run-overlay .run-summary-card h2{font-size:21px;margin:0 0 8px}\n#mt-run-overlay .run-summary-card p{font-size:12px;color:#bcd2b4;margin:0 0 8px}\n#mt-run-overlay .run-best-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:11px 0}\n#mt-run-overlay .run-best{min-height:92px;background:#152013;border:1px solid #354c2a;border-radius:13px;padding:11px;display:flex;flex-direction:column;justify-content:space-between}\n#mt-run-overlay .run-best small{font-size:10px;color:#a8c1a0}\n#mt-run-overlay .run-best b{font-size:22px;color:#adff27}\n#mt-run-overlay .run-h3{font-size:17px;font-weight:900;margin:12px 14px 7px}\n#mt-run-overlay .run-history{margin:0 12px 14px;background:#131d12;border:1px solid #34472c;border-radius:14px;padding:12px}\n#mt-run-overlay .run-history-row{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #34442c;padding:10px 0}\n#mt-run-overlay .run-history-row:last-child{border-bottom:0}\n#mt-run-overlay .run-history-row strong{font-size:12px;display:block}\n#mt-run-overlay .run-history-row small{font-size:10px;color:#a5b99c}\n#mt-run-overlay .run-history-row span{font-size:11px;color:#c5ffaa;text-align:right}\n#mt-run-overlay .leaflet-control-attribution{font-size:8px!important;color:#879b80!important;background:#0e160ed9!important}\n#mt-run-overlay .leaflet-control-attribution a{color:#bfff6f!important}\n#mt-run-overlay .run-location-dot{height:15px;width:15px;border-radius:50%;background:#a6ff00;border:3px solid white;box-shadow:0 0 0 7px #a6ff003b,0 0 14px #a6ff00}\n@media(max-height:700px){#mt-run-overlay .run-map-box{height:38vh;min-height:230px}#mt-run-overlay .run-time{font-size:43px}#mt-run-overlay .run-stats{padding:8px 10px}}\n";document.head.appendChild(style);
let state={active:false,running:false,durationMs:0,distanceMeters:0,calories:0,paceSecKm:0,route:[],gpsFix:false,gpsEnabled:false,permissionGranted:false};
let history={history:[],bestDistance:0,bestDuration:0,bestPace:0};
let view='run',opened=false,lastFinished=null,elapsedBase=0,lastElapsedTick=Date.now();
let leaflet=null,map=null,routeLine=null,positionMarker=null,mapUnavailable=false,mapLoading=false;
function promptNative(command){
 try{
  const s=window.prompt('mt-run:'+command,'');
  return s?JSON.parse(s):null;
 }catch(e){console.warn('Modo Corrida:',e);return null}
}
function msClock(ms){let seconds=Math.max(0,Math.floor(ms/1000));const h=Math.floor(seconds/3600);seconds%=3600;const m=Math.floor(seconds/60),s=seconds%60;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')}
function clockShort(ms){const secs=Math.max(0,Math.floor(ms/1000));return String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')}
function paceLabel(sec){if(!sec||!Number.isFinite(sec))return '0:00';return Math.floor(sec/60)+':'+String(Math.round(sec%60)).padStart(2,'0')}
function distanceLabel(m){return (Math.max(0,m||0)/1000).toFixed(2)}
function readHistory(){const h=promptNative('history');if(h&&Array.isArray(h.history))history=h;return history}
function poll(){const s=promptNative('state');if(s&&typeof s==='object'&&!s.error){state=s;elapsedBase=s.durationMs||0;lastElapsedTick=Date.now();update();renderMapRoute()}return state}
function currentElapsed(){return Math.max(0,(state.durationMs||0)+(state.running?Date.now()-lastElapsedTick:0))}
function allRuns(){return [...(history.history||[])].reverse()}
function historyMarkup(){
 const records=allRuns();
 return '<div class="run-summary-card"><h2>Seus recordes</h2><p>Sua evolução registrada pelo GPS.</p>'+
 '<div class="run-best-grid"><div class="run-best"><small>Maior distância</small><b>'+distanceLabel(history.bestDistance||0)+' km</b></div><div class="run-best"><small>Maior duração</small><b>'+clockShort(history.bestDuration||0)+'</b></div>'+
 '<div class="run-best"><small>Melhor ritmo</small><b>'+paceLabel(history.bestPace||0)+' /km</b></div><div class="run-best"><small>Corridas concluídas</small><b>'+records.length+'</b></div></div></div>'+
 '<h3 class="run-h3">Histórico de corridas</h3><div class="run-history">'+(records.length?records.slice(0,15).map((r,i)=>{
 const when=r.endedAt?new Date(r.endedAt).toLocaleDateString('pt-BR'):'Corrida';
 return '<div class="run-history-row"><div><strong>'+when+'</strong><small>'+clockShort(r.durationMs||0)+' • '+Math.round(r.calories||0)+' kcal</small></div><span>'+distanceLabel(r.distanceMeters||0)+' km<br>'+paceLabel(r.paceSecKm||0)+' min/km</span></div>';
 }).join(''):'<p class="run-note">Nenhuma corrida registrada ainda.</p>')+'</div>';
}
function mapBox(){return '<div class="run-map-box"><div id="mt-run-map"></div><div class="run-map-empty" id="mt-run-map-empty">'+svg('map',44)+'<strong>Aguardando localização</strong><small>Ative o GPS e permita o acesso para desenhar sua rota.</small></div><div class="run-gps"><span class="gps-dot" id="mt-run-gps-dot"></span><span id="mt-run-gps-text">GPS aguardando</span></div></div>'}
function content(){
 const on=!!state.active,running=!!state.running;
 let buttons='';
 if(view==='history'||view==='summary')buttons='<div class="run-actions single"><button class="run-btn start" id="mt-run-new">'+svg('play')+' Nova corrida</button></div>';
 else if(!on)buttons='<div class="run-actions single"><button class="run-btn start" id="mt-run-start">'+svg('play')+' COMEÇAR</button></div>';
 else buttons='<div class="run-actions"><button class="run-btn stop" id="mt-run-finish">'+svg('stop')+' FINALIZAR</button><button class="run-btn '+(running?'pause':'start')+'" id="mt-run-pause">'+svg(running?'pause':'play')+' '+(running?'PAUSAR':'RETOMAR')+'</button></div>';
 const summary=view==='summary'&&lastFinished?'<div class="run-summary-card"><h2>Corrida concluída! 💚</h2><p>Bom trabalho! Veja seu resultado abaixo.</p><div class="run-best-grid"><div class="run-best"><small>Distância</small><b>'+distanceLabel(lastFinished.distanceMeters||0)+' km</b></div><div class="run-best"><small>Tempo</small><b>'+clockShort(lastFinished.durationMs||0)+'</b></div><div class="run-best"><small>Ritmo médio</small><b>'+paceLabel(lastFinished.paceSecKm||0)+' /km</b></div><div class="run-best"><small>Calorias estimadas</small><b>'+Math.round(lastFinished.calories||0)+' kcal</b></div></div></div>':'';
 const historySection=(view==='history'||view==='summary')?historyMarkup():'';
 return '<div class="run-shell"><div class="run-bar"><button class="run-close" id="mt-run-close" aria-label="Voltar">'+svg('back',23)+'</button><strong>◢ MODO CORRIDA</strong><button class="run-close" id="mt-run-history-toggle" aria-label="Histórico">'+svg('clock',21)+'</button></div>'+
 '<div class="run-time" id="mt-run-time">'+msClock(state.durationMs||0)+'</div><div class="run-time-label">TEMPO DE CORRIDA</div>'+
 '<div class="run-stats"><div class="run-stat"><strong id="mt-run-distance">'+distanceLabel(state.distanceMeters)+' </strong><small>KM</small></div><div class="run-stat"><strong id="mt-run-pace">'+paceLabel(state.paceSecKm)+'</strong><small>RITMO (MIN/KM)</small></div><div class="run-stat"><strong id="mt-run-calories">'+Math.round(state.calories||0)+'</strong><small>KCAL</small></div></div>'+
 (view==='history'?'':mapBox())+summary+buttons+
 '<p class="run-note" id="mt-run-note">'+(on?(running?'Gravando corrida em tempo real.':'Corrida pausada. Seus resultados estão salvos.'):'O GPS desenha sua rota e estima o ritmo e as calorias.')+'</p>'+
 (historySection||'<div class="run-privacy">'+svg('shield',20)+'<span>Seu trajeto fica salvo neste celular. O mapa usa OpenStreetMap com internet. A contagem continua com a tela bloqueada enquanto a corrida estiver ativa.</span></div>')+'</div>'
}
function open(mode){
 const overlay=$('mt-run-overlay');if(!overlay)return;
 if(mode)view=mode;
 else if(state.active)view='run';
 else view='run';
 opened=true;overlay.hidden=false;document.body.style.overflow='hidden';
 render();
}
function close(){opened=false;$('mt-run-overlay').hidden=true;document.body.style.overflow='';disposeMap()}
function disposeMap(){if(map){try{map.remove()}catch{}map=null;routeLine=null;positionMarker=null}}
function render(){
 const overlay=$('mt-run-overlay');if(!opened||!overlay)return;
 disposeMap();
 overlay.innerHTML=content();
 attach();
 update();
 if(view!=='history')ensureMap();
}
function attach(){
 $('mt-run-close').onclick=close;
 $('mt-run-history-toggle').onclick=()=>{readHistory();view=view==='history'?'run':'history';render()};
 const start=$('mt-run-start');if(start)start.onclick=()=>{
  if(!state.gpsEnabled){alert('Ative a localização (GPS) do celular para registrar a corrida.');return}
  const result=promptNative('start');if(result)state=result;view='run';poll();render();
 };
 const finish=$('mt-run-finish');if(finish)finish.onclick=()=>{
  if(!confirm('Finalizar esta corrida e salvar o resultado?'))return;
  const result=promptNative('finish');
  if(result&&result.durationMs!==undefined){lastFinished=result;readHistory();view='summary';poll();render()}
 };
 const pause=$('mt-run-pause');if(pause)pause.onclick=()=>{const command=state.running?'pause':'resume';const result=promptNative(command);if(result)state=result;poll();render()};
 const again=$('mt-run-new');if(again)again.onclick=()=>{lastFinished=null;view='run';render()};
}
function update(){
 if(!opened)return;
 const e=$('mt-run-time');if(e)e.textContent=msClock(currentElapsed());
 const distance=$('mt-run-distance');if(distance)distance.textContent=distanceLabel(state.distanceMeters);
 const pace=$('mt-run-pace');if(pace)pace.textContent=paceLabel(state.paceSecKm);
 const cal=$('mt-run-calories');if(cal)cal.textContent=Math.round(state.calories||0);
 const gps=$('mt-run-gps-text'),dot=$('mt-run-gps-dot');
 if(gps)gps.textContent=!state.gpsEnabled?'Ative o GPS':!state.permissionGranted?'Permissão necessária':state.gpsFix?'GPS conectado':'Buscando sinal GPS';
 if(dot)dot.classList.toggle('good',!!state.gpsFix);
}
function ensureLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 if(mapLoading)return new Promise((resolve,reject)=>{
  let tries=0;const watcher=setInterval(()=>{tries++;if(window.L){clearInterval(watcher);resolve(window.L)}else if(tries>=30){clearInterval(watcher);reject(Error('Sem mapa'))}},300)
 });
 mapLoading=true;
 return new Promise((resolve,reject)=>{
  const link=document.createElement('link');link.rel='stylesheet';link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(link);
  const script=document.createElement('script');script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';script.crossOrigin='anonymous';
  script.onload=()=>{mapLoading=false;resolve(window.L)};
  script.onerror=()=>{mapLoading=false;mapUnavailable=true;reject(Error('Mapa indisponível offline'))};
  document.head.appendChild(script);
 });
}
async function ensureMap(){
 if(map||view==='history'||!opened||mapUnavailable)return;
 const route=Array.isArray(state.route)?state.route:[];
 if(!state.gpsFix&&!route.length)return;
 try{
  const L=await ensureLeaflet();
  if(!opened||view==='history'||map||!$('mt-run-map'))return;
  map=L.map('mt-run-map',{zoomControl:false,attributionControl:true,preferCanvas:true});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'}).addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);
  routeLine=L.polyline([],{color:'#a6ff00',weight:5,opacity:.95}).addTo(map);
  const m=L.divIcon({className:'',html:'<div class="run-location-dot"></div>',iconSize:[18,18]});
  positionMarker=L.marker([0,0],{icon:m}).addTo(map);
  renderMapRoute();
  setTimeout(()=>{if(map)map.invalidateSize()},100);
 }catch(e){mapUnavailable=true;const placeholder=$('mt-run-map-empty');if(placeholder){placeholder.querySelector('small').textContent='Mapa indisponível. O GPS ainda registra a corrida.'}}
}
function renderMapRoute(){
 if(!opened||view==='history')return;
 const route=Array.isArray(state.route)?state.route:[];
 if(!route.length)return;
 const coords=route.filter(x=>Array.isArray(x)&&Number.isFinite(x[0])&&Number.isFinite(x[1])).map(x=>[x[0],x[1]]);
 if(!coords.length)return;
 const empty=$('mt-run-map-empty');if(empty)empty.style.display='none';
 if(!map){ensureMap();return}
 if(routeLine)routeLine.setLatLngs(coords);
 if(positionMarker)positionMarker.setLatLng(coords[coords.length-1]);
 if(!map._mtCentered){map._mtCentered=true;map.setView(coords[coords.length-1],17)}
 else if(state.running)map.panTo(coords[coords.length-1],{animate:false});
}
function decorateHome(){
 const steps=document.querySelector('.steps-home');
 if(!steps||!document.body.classList.contains('home-view'))return;
 if($('mt-run-home-card'))return;
 const card=document.createElement('button');card.id='mt-run-home-card';card.setAttribute('type','button');
 card.innerHTML='<span class="run-home-icon">'+svg('runner',30)+'</span><span class="run-home-info"><strong>Modo Corrida</strong><small>Registre sua corrida em tempo real com GPS</small></span><span class="run-arrow">'+svg('chevron',23)+'</span>';
 steps.insertAdjacentElement('afterend',card);
 card.onclick=()=>{poll();open('run')};
}
const overlay=document.createElement('section');overlay.id='mt-run-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Modo Corrida');overlay.hidden=true;document.body.appendChild(overlay);
const screen=$('screen');
if(screen){let timer=null;new MutationObserver(()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{decorateHome()},80)}).observe(screen,{childList:true,subtree:false})}
window.addEventListener('pagehide',()=>{if(opened&&state.active)promptNative('state')});
setInterval(()=>{if(!document.hidden){decorateHome();if(opened){update()}}},1000);
setInterval(()=>{if(!document.hidden&&opened){poll()}},2500);
poll();decorateHome();
window.MTRunning={open,close,state:()=>state};
})();